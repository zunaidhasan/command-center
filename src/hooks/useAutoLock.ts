import { useEffect } from 'react';
import { useLockStore } from '@/store/useLockStore';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'wheel'] as const;

/**
 * In-page idle timer. The extension service worker also uses chrome.idle, but
 * this fallback covers the web build and keeps the timer accurate while the
 * tab is focused.
 */
export function useAutoLock() {
  const enabled = useLockStore((state) => state.config.enabled);
  const locked = useLockStore((state) => state.config.locked);
  const minutes = useLockStore((state) => state.config.autoLockMinutes);
  const lockNow = useLockStore((state) => state.lockNow);

  useEffect(() => {
    if (!enabled || locked || minutes <= 0) return;

    let lastActivity = Date.now();

    const markActive = () => {
      lastActivity = Date.now();
    };

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, markActive, { passive: true });
    });
    document.addEventListener('visibilitychange', markActive);

    const interval = window.setInterval(() => {
      if (Date.now() - lastActivity >= minutes * 60_000) {
        window.clearInterval(interval);
        void lockNow('idle');
      }
    }, 10_000);

    return () => {
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, markActive);
      });
      document.removeEventListener('visibilitychange', markActive);
      window.clearInterval(interval);
    };
  }, [enabled, locked, minutes, lockNow]);
}
