// ZH Labs Command Center — background service worker (Manifest V3)
//
// Responsibilities:
//   1. Keep the Browser Lock enforced across every tab / window.
//   2. Snapshot tab URLs when locking and restore them after unlocking.
//   3. Auto-lock on chrome.idle timeout.
//   4. Lock on browser startup when configured.
//   5. Block browser-internal (chrome://) pages while locked.
//   6. Sync Chrome bookmark changes to open dashboards.

console.log('[ZH Labs] Background service worker initialized');

const LOCK_KEY = 'lock_config';
const LOCK_PAGE_PATH = 'index.html';
const LOCK_PAGE_URL = chrome.runtime.getURL(LOCK_PAGE_PATH);
const EXTENSION_ORIGIN = chrome.runtime.getURL('');
const TAB_SNAPSHOT_KEY = 'lock_tab_snapshot';

/** @type {any} */
let lockConfig = null;
let configLoaded = false;

/* ------------------------------------------------------------------ */
/* Config helpers                                                      */
/* ------------------------------------------------------------------ */

async function getLockConfig(force = false) {
  if (configLoaded && !force) return lockConfig;
  try {
    const stored = await chrome.storage.local.get(LOCK_KEY);
    lockConfig = stored[LOCK_KEY] || null;
  } catch (err) {
    console.warn('[Lock] Failed to read lock config:', err);
    lockConfig = null;
  }
  configLoaded = true;
  return lockConfig;
}

function isEnforcing(config) {
  return !!(config && config.enabled && config.locked && config.passwordHash);
}

function isOwnPage(url) {
  return typeof url === 'string' && url.startsWith(EXTENSION_ORIGIN);
}

function isBrowserInternal(url) {
  return /^(chrome|edge|brave|opera|vivaldi|devtools|about|view-source|chrome-search|chrome-untrusted):/i.test(
    url || '',
  );
}

function shouldBlockUrl(url, config) {
  if (!url || isOwnPage(url)) return false;
  if (config.guardTabs) return true;
  return !!config.blockSensitivePages && isBrowserInternal(url);
}

/* ------------------------------------------------------------------ */
/* Tab session snapshot + suspension (serialized to avoid races)        */
/* ------------------------------------------------------------------ */

let sessionQueue = Promise.resolve();

function queueSession(task) {
  const run = sessionQueue.then(task, task);
  sessionQueue = run.catch(() => {});
  return run;
}

async function readSnapshot() {
  try {
    const stored = await chrome.storage.session.get(TAB_SNAPSHOT_KEY);
    return stored[TAB_SNAPSHOT_KEY] || {};
  } catch {
    return {};
  }
}

async function writeSnapshot(snapshot) {
  try {
    await chrome.storage.session.set({ [TAB_SNAPSHOT_KEY]: snapshot });
  } catch {
    /* storage.session unavailable — restore is best-effort */
  }
}

async function clearSnapshot() {
  try {
    await chrome.storage.session.remove(TAB_SNAPSHOT_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Saves the tab's original URL (if new) and navigates it to the lock page.
 * Tabs that already show an extension page are left alone — they render the
 * lock overlay themselves through shared storage state.
 */
async function suspendTab(tabId, url) {
  return queueSession(async () => {
    const snapshot = await readSnapshot();

    if (url && !isOwnPage(url) && !snapshot[tabId]) {
      snapshot[tabId] = url;
      await writeSnapshot(snapshot);
    }

    if (isOwnPage(url)) return;

    try {
      await chrome.tabs.update(tabId, { url: LOCK_PAGE_URL });
    } catch {
      // Some browser-internal pages refuse extension navigation. Closing them
      // is the only reliable way to deny access while locked.
      if (isBrowserInternal(url)) {
        try {
          await chrome.tabs.remove(tabId);
        } catch {
          /* tab already gone */
        }
      }
    }
  });
}

async function lockAllTabs() {
  const config = await getLockConfig(true);
  if (!isEnforcing(config)) return;

  let tabs = [];
  try {
    tabs = await chrome.tabs.query({});
  } catch (err) {
    console.warn('[Lock] Unable to enumerate tabs:', err);
    return;
  }

  // 1. Snapshot everything outside the extension before touching it.
  const snapshot = await readSnapshot();
  let dirty = false;

  for (const tab of tabs) {
    const url = tab.url || tab.pendingUrl || '';
    if (!url || isOwnPage(url)) continue;
    if (!shouldBlockUrl(url, config)) continue;
    if (!snapshot[tab.id]) {
      snapshot[tab.id] = url;
      dirty = true;
    }
  }

  if (dirty) await writeSnapshot(snapshot);

  // 2. Suspend tabs.
  for (const tab of tabs) {
    const url = tab.url || tab.pendingUrl || '';
    if (!url || isOwnPage(url)) continue;
    if (!shouldBlockUrl(url, config)) continue;

    try {
      await chrome.tabs.update(tab.id, { url: LOCK_PAGE_URL });
    } catch {
      if (isBrowserInternal(url)) {
        try {
          await chrome.tabs.remove(tab.id);
        } catch {
          /* tab already gone */
        }
      }
    }
  }

  console.log(`[Lock] Enforced on ${tabs.length} tab(s)`);
}

async function restoreTabs() {
  const snapshot = await readSnapshot();
  await clearSnapshot();

  for (const [rawTabId, url] of Object.entries(snapshot)) {
    const tabId = Number(rawTabId);
    if (!Number.isFinite(tabId) || typeof url !== 'string' || !url) continue;

    try {
      const tab = await chrome.tabs.get(tabId);
      const currentUrl = tab.url || tab.pendingUrl || '';
      // Only navigate back if the tab is still parked on our lock page.
      if (currentUrl === LOCK_PAGE_URL || isOwnPage(currentUrl)) {
        await chrome.tabs.update(tabId, { url });
      }
    } catch {
      /* tab was closed while locked */
    }
  }

  console.log('[Lock] Session restored after unlock');
}

/* ------------------------------------------------------------------ */
/* Enforcement on tab activity                                         */
/* ------------------------------------------------------------------ */

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (!changeInfo.url) return;
  void (async () => {
    const config = await getLockConfig();
    if (!isEnforcing(config)) return;
    if (!shouldBlockUrl(changeInfo.url, config)) return;
    await suspendTab(tabId, changeInfo.url);
  })();
});

chrome.tabs.onCreated.addListener((tab) => {
  void (async () => {
    const config = await getLockConfig();
    if (!isEnforcing(config) || !config.guardTabs) return;

    const url = tab.pendingUrl || tab.url || '';
    if (!url || isOwnPage(url)) return;
    // A brand new tab is our own new-tab override — just point it at the lock page.
    if (/^chrome:\/\/newtab/i.test(url)) {
      try {
        await chrome.tabs.update(tab.id, { url: LOCK_PAGE_URL });
      } catch {
        /* ignore */
      }
      return;
    }
    await suspendTab(tab.id, url);
  })();
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  void (async () => {
    const config = await getLockConfig();
    if (!isEnforcing(config)) return;

    try {
      const tab = await chrome.tabs.get(tabId);
      const url = tab.url || tab.pendingUrl || '';
      if (!shouldBlockUrl(url, config)) return;
      await suspendTab(tabId, url);
    } catch {
      /* tab disappeared */
    }
  })();
});

/* ------------------------------------------------------------------ */
/* Lock state transitions (driven by the dashboard store)              */
/* ------------------------------------------------------------------ */

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[LOCK_KEY]) return;

  const previous = lockConfig;
  lockConfig = changes[LOCK_KEY].newValue || null;
  configLoaded = true;

  const wasLocked = isEnforcing(previous);
  const nowLocked = isEnforcing(lockConfig);

  applyIdleDetection();

  if (nowLocked && !wasLocked) {
    void lockAllTabs();
  } else if (!nowLocked && wasLocked) {
    void restoreTabs();
  }
});

/* ------------------------------------------------------------------ */
/* Idle auto-lock                                                      */
/* ------------------------------------------------------------------ */

function applyIdleDetection() {
  try {
    const minutes =
      lockConfig && lockConfig.enabled ? Math.max(0, Number(lockConfig.autoLockMinutes) || 0) : 0;
    // chrome.idle requires a minimum detection interval of 15 seconds.
    const seconds = minutes > 0 ? Math.max(15, Math.round(minutes * 60)) : 15;
    chrome.idle.setDetectionInterval(seconds);
  } catch (err) {
    console.warn('[Lock] Unable to configure idle detection:', err);
  }
}

async function setLockedFromWorker(reason) {
  const config = await getLockConfig(true);
  if (!config || !config.enabled || config.locked) return;

  const next = {
    ...config,
    locked: true,
    lockReason: reason,
    updatedAt: Date.now(),
  };

  lockConfig = next;
  configLoaded = true;

  await chrome.storage.local.set({ [LOCK_KEY]: next });
  // The storage listener also enforces, but do it inline so the barrier is
  // immediate even if the worker is about to be suspended.
  await lockAllTabs();
}

chrome.idle.onStateChanged.addListener((state) => {
  if (state !== 'idle' && state !== 'locked') return;
  void (async () => {
    const config = await getLockConfig(true);
    if (!config || !config.enabled || config.locked) return;
    if (!(Number(config.autoLockMinutes) > 0)) return;
    await setLockedFromWorker('idle');
  })();
});

/* ------------------------------------------------------------------ */
/* Startup / install                                                   */
/* ------------------------------------------------------------------ */

async function handleSessionStart() {
  const config = await getLockConfig(true);
  if (!config) return;

  applyIdleDetection();

  if (config.enabled && config.lockOnStartup && !config.locked) {
    await setLockedFromWorker('startup');
    return;
  }

  if (isEnforcing(config)) {
    await lockAllTabs();
  }
}

chrome.runtime.onStartup.addListener(() => {
  void handleSessionStart();
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[ZH Labs Command Center] Extension installed successfully.');
  } else if (details.reason === 'update') {
    console.log(
      '[ZH Labs Command Center] Extension updated to version',
      chrome.runtime.getManifest().version,
    );
  }
});

/* ------------------------------------------------------------------ */
/* Settings window shortcut (toolbar icon)                             */
/* ------------------------------------------------------------------ */

if (chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL(LOCK_PAGE_PATH) });
  });
}

/* ------------------------------------------------------------------ */
/* Bookmark change broadcasting                                        */
/* ------------------------------------------------------------------ */

if (chrome.bookmarks) {
  const notifyBookmarkChange = (eventType, data) => {
    chrome.runtime.sendMessage({ type: 'BOOKMARKS_CHANGED', eventType, data }).catch(() => {
      // Ignore errors when no receiver is open
    });
  };

  chrome.bookmarks.onCreated.addListener((id, bookmark) =>
    notifyBookmarkChange('created', { id, bookmark }),
  );
  chrome.bookmarks.onRemoved.addListener((id, removeInfo) =>
    notifyBookmarkChange('removed', { id, removeInfo }),
  );
  chrome.bookmarks.onChanged.addListener((id, changeInfo) =>
    notifyBookmarkChange('changed', { id, changeInfo }),
  );
  chrome.bookmarks.onMoved.addListener((id, moveInfo) =>
    notifyBookmarkChange('moved', { id, moveInfo }),
  );
}

// Warm the cache + idle timer whenever the worker spins up.
void getLockConfig(true).then(() => applyIdleDetection());
