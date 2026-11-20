/// <reference types="chrome" />
/**
 * Unified Storage Adapter
 * Automatically routes to chrome.storage.local when running inside a Chrome Extension,
 * and falls back seamlessly to window.localStorage in regular web environments.
 */

export const StorageAdapter = {
  isExtension(): boolean {
    return typeof chrome !== 'undefined' && !!chrome?.storage?.local;
  },

  async get<T>(key: string, defaultValue: T): Promise<T> {
    try {
      if (this.isExtension()) {
        const result = await chrome.storage.local.get([key]);
        if (result && result[key] !== undefined) {
          return result[key] as T;
        }
      } else {
        const item = localStorage.getItem(`zh_${key}`);
        if (item !== null) {
          return JSON.parse(item) as T;
        }
      }
    } catch (err) {
      console.warn(`[StorageAdapter] Failed to read key "${key}":`, err);
    }
    return defaultValue;
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      if (this.isExtension()) {
        await chrome.storage.local.set({ [key]: value });
      } else {
        localStorage.setItem(`zh_${key}`, JSON.stringify(value));
      }
    } catch (err) {
      console.warn(`[StorageAdapter] Failed to set key "${key}":`, err);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (this.isExtension()) {
        await chrome.storage.local.remove([key]);
      } else {
        localStorage.removeItem(`zh_${key}`);
      }
    } catch (err) {
      console.warn(`[StorageAdapter] Failed to remove key "${key}":`, err);
    }
  },

  async clear(): Promise<void> {
    try {
      if (this.isExtension()) {
        await chrome.storage.local.clear();
      } else {
        // Clear all keys with prefix zh_
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('zh_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      }
    } catch (err) {
      console.warn('[StorageAdapter] Failed to clear storage:', err);
    }
  },
};
