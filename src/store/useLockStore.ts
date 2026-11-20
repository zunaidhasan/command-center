import { create } from 'zustand';
import { LockConfig, LockReason, UnlockResult } from '@/types/lock';
import {
  DEFAULT_LOCK_CONFIG,
  LOCK_STORAGE_KEY,
  applyFailedAttempt,
  createPasswordRecord,
  getRemainingLockoutMs,
  loadLockConfig,
  normalizeLockConfig,
  saveLockConfig,
  validatePassword,
  verifyPassword,
} from '@/services/lock';

interface LockStoreState {
  config: LockConfig;
  isLoading: boolean;
  isBusy: boolean;

  initLock: () => Promise<void>;
  syncFromStorage: () => Promise<void>;

  enableLock: (password: string, confirmation: string) => Promise<UnlockResult>;
  disableLock: (password: string) => Promise<UnlockResult>;
  changePassword: (
    currentPassword: string,
    nextPassword: string,
    confirmation: string,
  ) => Promise<UnlockResult>;

  lockNow: (reason?: LockReason) => Promise<void>;
  unlock: (password: string) => Promise<UnlockResult>;

  setAutoLockMinutes: (minutes: number) => Promise<void>;
  setLockOnStartup: (enabled: boolean) => Promise<void>;
  setGuardTabs: (enabled: boolean) => Promise<void>;
  setBlockSensitivePages: (enabled: boolean) => Promise<void>;

  clearFailedAttempts: () => Promise<void>;
  clearLockout: () => Promise<void>;
}

let storageSyncAttached = false;
let initialized = false;

/**
 * Rejects an operation when the caller is currently locked out.
 * Shared by unlock / disable / change-password so the lockout cannot be
 * bypassed by using a different settings action.
 */
function lockedOutResult(config: LockConfig): UnlockResult | null {
  const remaining = getRemainingLockoutMs(config);
  if (remaining <= 0) return null;
  return { ok: false, reason: 'locked-out', lockoutUntil: config.lockoutUntil };
}

async function persist(next: LockConfig): Promise<LockConfig> {
  const saved = await saveLockConfig(next);
  // Keep the persisted (updatedAt-stamped) record in memory.
  return saved;
}

/**
 * Builds the response for a rejected password. When the failure trips the
 * lockout, `consecutiveFailures` is reset by `applyFailedAttempt`, so report
 * zero remaining attempts rather than a misleading count.
 */
function failureResult(failed: LockConfig): UnlockResult {
  const lockedOut = failed.lockoutUntil > Date.now();
  return {
    ok: false,
    reason: 'invalid',
    attemptsLeft: lockedOut ? 0 : Math.max(0, failed.maxAttempts - failed.consecutiveFailures),
    lockoutUntil: lockedOut ? failed.lockoutUntil : undefined,
  };
}

function attachStorageSync(set: (partial: Partial<LockStoreState>) => void) {
  if (storageSyncAttached) return;
  storageSyncAttached = true;

  // Chrome extension: keep every open tab in sync when another tab (or the
  // background worker) locks / unlocks.
  if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== 'local' || !changes[LOCK_STORAGE_KEY]) return;
      const next = normalizeLockConfig(changes[LOCK_STORAGE_KEY].newValue as Partial<LockConfig>);
      set({ config: next });
    });
    return;
  }

  // Web fallback: localStorage `storage` events fire in other tabs.
  window.addEventListener('storage', (event) => {
    if (event.key !== `zh_${LOCK_STORAGE_KEY}` || !event.newValue) return;
    try {
      set({ config: normalizeLockConfig(JSON.parse(event.newValue)) });
    } catch {
      /* ignore malformed payloads */
    }
  });
}

export const useLockStore = create<LockStoreState>((set, get) => ({
  config: DEFAULT_LOCK_CONFIG,
  isLoading: true,
  isBusy: false,

  initLock: async () => {
    if (initialized) {
      set({ isLoading: false });
      return;
    }
    initialized = true;

    try {
      const config = await loadLockConfig();
      set({ config, isLoading: false });
    } catch (err) {
      console.error('[LockStore] Failed to load lock configuration:', err);
      set({ config: DEFAULT_LOCK_CONFIG, isLoading: false });
    }

    attachStorageSync(set);
  },

  syncFromStorage: async () => {
    const config = await loadLockConfig();
    set({ config });
  },

  enableLock: async (password, confirmation) => {
    const validationError = validatePassword(password);
    if (validationError) return { ok: false, reason: 'weak-password' };
    if (password !== confirmation) return { ok: false, reason: 'invalid' };

    set({ isBusy: true });
    try {
      const record = await createPasswordRecord(password);
      const next = await persist({
        ...get().config,
        enabled: true,
        locked: false,
        ...record,
        consecutiveFailures: 0,
        failedAttempts: [],
        lockoutUntil: 0,
        lockReason: 'unknown',
        createdAt: Date.now(),
        lastUnlockedAt: Date.now(),
      });
      set({ config: next, isBusy: false });
      return { ok: true };
    } catch (err) {
      console.error('[LockStore] Failed to enable browser lock:', err);
      set({ isBusy: false });
      return { ok: false, reason: 'invalid' };
    }
  },

  disableLock: async (password) => {
    const { config } = get();
    if (!config.enabled) return { ok: true };

    const lockedOut = lockedOutResult(config);
    if (lockedOut) return lockedOut;

    set({ isBusy: true });
    try {
      const valid = await verifyPassword(password, config);
      if (!valid) {
        const failed = await persist(applyFailedAttempt(config, 'manual'));
        set({ config: failed, isBusy: false });
        return failureResult(failed);
      }

      const next = await persist({
        ...config,
        enabled: false,
        locked: false,
        passwordHash: null,
        salt: null,
        consecutiveFailures: 0,
        failedAttempts: [],
        lockoutUntil: 0,
        lockReason: 'unknown',
        lastUnlockedAt: Date.now(),
      });
      set({ config: next, isBusy: false });
      return { ok: true };
    } catch (err) {
      console.error('[LockStore] Failed to disable browser lock:', err);
      set({ isBusy: false });
      return { ok: false, reason: 'invalid' };
    }
  },

  changePassword: async (currentPassword, nextPassword, confirmation) => {
    const { config } = get();
    if (!config.enabled || !config.passwordHash) {
      return { ok: false, reason: 'not-enabled' };
    }

    const validationError = validatePassword(nextPassword);
    if (validationError) return { ok: false, reason: 'weak-password' };
    if (nextPassword !== confirmation) return { ok: false, reason: 'invalid' };

    const lockedOut = lockedOutResult(config);
    if (lockedOut) return lockedOut;

    set({ isBusy: true });
    try {
      const valid = await verifyPassword(currentPassword, config);
      if (!valid) {
        const failed = await persist(applyFailedAttempt(config, 'manual'));
        set({ config: failed, isBusy: false });
        return failureResult(failed);
      }

      const record = await createPasswordRecord(nextPassword);
      const next = await persist({
        ...config,
        ...record,
        consecutiveFailures: 0,
        lockoutUntil: 0,
        lastUnlockedAt: Date.now(),
      });
      set({ config: next, isBusy: false });
      return { ok: true };
    } catch (err) {
      console.error('[LockStore] Failed to change lock password:', err);
      set({ isBusy: false });
      return { ok: false, reason: 'invalid' };
    }
  },

  lockNow: async (reason = 'manual') => {
    const { config } = get();
    if (!config.enabled || config.locked) return;

    const next = await persist({
      ...config,
      locked: true,
      lockReason: reason,
    });
    set({ config: next });
  },

  unlock: async (password) => {
    const { config } = get();
    if (!config.enabled) return { ok: true };

    const lockedOut = lockedOutResult(config);
    if (lockedOut) return lockedOut;

    set({ isBusy: true });
    try {
      const valid = await verifyPassword(password, config);
      if (!valid) {
        const failed = await persist(applyFailedAttempt(config, config.lockReason));
        set({ config: failed, isBusy: false });
        return failureResult(failed);
      }

      const next = await persist({
        ...config,
        locked: false,
        consecutiveFailures: 0,
        lockoutUntil: 0,
        lockReason: 'unknown',
        lastUnlockedAt: Date.now(),
      });
      set({ config: next, isBusy: false });
      return { ok: true };
    } catch (err) {
      console.error('[LockStore] Unlock failed:', err);
      set({ isBusy: false });
      return { ok: false, reason: 'invalid' };
    }
  },

  setAutoLockMinutes: async (minutes) => {
    const next = await persist({
      ...get().config,
      autoLockMinutes: Math.max(0, Math.min(240, Math.round(minutes))),
    });
    set({ config: next });
  },

  setLockOnStartup: async (enabled) => {
    const next = await persist({ ...get().config, lockOnStartup: enabled });
    set({ config: next });
  },

  setGuardTabs: async (enabled) => {
    const next = await persist({ ...get().config, guardTabs: enabled });
    set({ config: next });
  },

  setBlockSensitivePages: async (enabled) => {
    const next = await persist({ ...get().config, blockSensitivePages: enabled });
    set({ config: next });
  },

  clearFailedAttempts: async () => {
    const next = await persist({
      ...get().config,
      failedAttempts: [],
      consecutiveFailures: 0,
    });
    set({ config: next });
  },

  clearLockout: async () => {
    const next = await persist({ ...get().config, lockoutUntil: 0, consecutiveFailures: 0 });
    set({ config: next });
  },
}));

/** Convenience selector: is the lock configured at all? */
export const isLockEnabled = (config: LockConfig) => config.enabled && !!config.passwordHash;
