/// <reference types="chrome" />
import { create } from 'zustand';
import { Bookmark, BookmarkFolder, BookmarkSyncMode, BookmarkExportData } from '@/types/bookmark';
import { INITIAL_FOLDERS, INITIAL_BOOKMARKS } from '@/services/initial-data';
import { StorageAdapter } from '@/services/storage';
import { getDatabase } from '@/db/idb';

interface BookmarkState {
  folders: BookmarkFolder[];
  bookmarks: Bookmark[];
  syncMode: BookmarkSyncMode;
  searchQuery: string;
  isLoading: boolean;

  // Actions
  initBookmarks: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSyncMode: (mode: BookmarkSyncMode) => Promise<void>;
  
  // Bookmark CRUD
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'order'>) => Promise<Bookmark>;
  updateBookmark: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  deleteBookmark: (id: string) => Promise<void>;
  togglePinBookmark: (id: string) => Promise<void>;
  reorderBookmarks: (folderId: string, orderedIds: string[]) => Promise<void>;
  moveBookmark: (bookmarkId: string, targetFolderId: string) => Promise<void>;

  // Folder CRUD
  addFolder: (folder: Omit<BookmarkFolder, 'id' | 'order'>) => Promise<BookmarkFolder>;
  updateFolder: (id: string, updates: Partial<BookmarkFolder>) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  reorderFolders: (orderedIds: string[]) => Promise<void>;

  // Import / Export
  exportData: () => Promise<BookmarkExportData>;
  importData: (data: BookmarkExportData) => Promise<void>;
  importHtmlBookmarks: (htmlContent: string) => Promise<{ imported: number }>;
  
  // Chrome Sync
  syncFromChrome: () => Promise<{ success: boolean; count?: number; error?: string }>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  folders: [],
  bookmarks: [],
  syncMode: 'independent',
  searchQuery: '',
  isLoading: true,

  initBookmarks: async () => {
    try {
      const db = await getDatabase();
      const savedFolders = await db.getAll('folders');
      const savedBookmarks = await db.getAll('bookmarks');
      const syncMode = await StorageAdapter.get<BookmarkSyncMode>('bookmark_sync_mode', 'independent');

      if (savedFolders.length === 0 || savedBookmarks.length === 0) {
        // Initialize with default folders and bookmarks
        const tx = db.transaction(['folders', 'bookmarks'], 'readwrite');
        for (const f of INITIAL_FOLDERS) {
          await tx.objectStore('folders').put(f);
        }
        for (const b of INITIAL_BOOKMARKS) {
          await tx.objectStore('bookmarks').put(b);
        }
        await tx.done;

        set({
          folders: INITIAL_FOLDERS,
          bookmarks: INITIAL_BOOKMARKS,
          syncMode,
          isLoading: false,
        });
      } else {
        // Sort folders by order
        savedFolders.sort((a, b) => a.order - b.order);
        savedBookmarks.sort((a, b) => a.order - b.order);

        set({
          folders: savedFolders,
          bookmarks: savedBookmarks,
          syncMode,
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('[BookmarkStore] Failed to initialize bookmarks:', err);
      // Fallback in-memory
      set({
        folders: INITIAL_FOLDERS,
        bookmarks: INITIAL_BOOKMARKS,
        isLoading: false,
      });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSyncMode: async (mode) => {
    await StorageAdapter.set('bookmark_sync_mode', mode);
    set({ syncMode: mode });
    if (mode === 'chrome') {
      await get().syncFromChrome();
    }
  },

  addBookmark: async (bookmarkData) => {
    const { bookmarks, folders } = get();
    const folderBookmarks = bookmarks.filter((b) => b.folderId === bookmarkData.folderId);
    const nextOrder = folderBookmarks.length > 0 ? Math.max(...folderBookmarks.map((b) => b.order)) + 1 : 0;

    // Auto-detect favicon if missing
    let icon = bookmarkData.icon;
    if (!icon && bookmarkData.url) {
      try {
        const domain = new URL(bookmarkData.url).hostname;
        icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      } catch {
        // invalid url fallback
      }
    }

    const newBookmark: Bookmark = {
      ...bookmarkData,
      id: `bm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      icon,
      order: nextOrder,
      createdAt: Date.now(),
    };

    const updated = [...bookmarks, newBookmark];
    set({ bookmarks: updated });

    try {
      const db = await getDatabase();
      await db.put('bookmarks', newBookmark);
    } catch (err) {
      console.error('[BookmarkStore] Failed to persist bookmark in IDB:', err);
    }

    return newBookmark;
  },

  updateBookmark: async (id, updates) => {
    const { bookmarks } = get();
    const updated = bookmarks.map((b) => (b.id === id ? { ...b, ...updates, updatedAt: Date.now() } : b));
    set({ bookmarks: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('bookmarks', id);
      if (existing) {
        await db.put('bookmarks', { ...existing, ...updates, updatedAt: Date.now() });
      }
    } catch (err) {
      console.error('[BookmarkStore] Failed to update bookmark in IDB:', err);
    }
  },

  deleteBookmark: async (id) => {
    const { bookmarks } = get();
    const updated = bookmarks.filter((b) => b.id !== id);
    set({ bookmarks: updated });

    try {
      const db = await getDatabase();
      await db.delete('bookmarks', id);
    } catch (err) {
      console.error('[BookmarkStore] Failed to delete bookmark in IDB:', err);
    }
  },

  togglePinBookmark: async (id) => {
    const { bookmarks } = get();
    const target = bookmarks.find((b) => b.id === id);
    if (!target) return;
    const nextPinState = !target.isPinned;
    await get().updateBookmark(id, { isPinned: nextPinState });
  },

  reorderBookmarks: async (folderId, orderedIds) => {
    const { bookmarks } = get();
    const idToOrder = new Map(orderedIds.map((id, index) => [id, index]));
    
    const updated = bookmarks.map((b) => {
      if (b.folderId === folderId && idToOrder.has(b.id)) {
        return { ...b, order: idToOrder.get(b.id)! };
      }
      return b;
    });

    set({ bookmarks: updated });

    try {
      const db = await getDatabase();
      const tx = db.transaction('bookmarks', 'readwrite');
      for (const b of updated.filter((item) => item.folderId === folderId)) {
        await tx.store.put(b);
      }
      await tx.done;
    } catch (err) {
      console.error('[BookmarkStore] Failed to persist reordering:', err);
    }
  },

  moveBookmark: async (bookmarkId, targetFolderId) => {
    const { bookmarks } = get();
    const folderBookmarks = bookmarks.filter((b) => b.folderId === targetFolderId);
    const nextOrder = folderBookmarks.length > 0 ? Math.max(...folderBookmarks.map((b) => b.order)) + 1 : 0;

    await get().updateBookmark(bookmarkId, { folderId: targetFolderId, order: nextOrder });
  },

  addFolder: async (folderData) => {
    const { folders } = get();
    const nextOrder = folders.length > 0 ? Math.max(...folders.map((f) => f.order)) + 1 : 0;
    
    const newFolder: BookmarkFolder = {
      ...folderData,
      id: `folder-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order: nextOrder,
    };

    const updated = [...folders, newFolder];
    set({ folders: updated });

    try {
      const db = await getDatabase();
      await db.put('folders', newFolder);
    } catch (err) {
      console.error('[BookmarkStore] Failed to persist folder in IDB:', err);
    }

    return newFolder;
  },

  updateFolder: async (id, updates) => {
    const { folders } = get();
    const updated = folders.map((f) => (f.id === id ? { ...f, ...updates } : f));
    set({ folders: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('folders', id);
      if (existing) {
        await db.put('folders', { ...existing, ...updates });
      }
    } catch (err) {
      console.error('[BookmarkStore] Failed to update folder in IDB:', err);
    }
  },

  deleteFolder: async (id) => {
    const { folders, bookmarks } = get();
    const updatedFolders = folders.filter((f) => f.id !== id);
    // Remove all bookmarks within this folder
    const bookmarksToDelete = bookmarks.filter((b) => b.folderId === id);
    const updatedBookmarks = bookmarks.filter((b) => b.folderId !== id);

    set({ folders: updatedFolders, bookmarks: updatedBookmarks });

    try {
      const db = await getDatabase();
      await db.delete('folders', id);
      const tx = db.transaction('bookmarks', 'readwrite');
      for (const b of bookmarksToDelete) {
        await tx.store.delete(b.id);
      }
      await tx.done;
    } catch (err) {
      console.error('[BookmarkStore] Failed to delete folder in IDB:', err);
    }
  },

  reorderFolders: async (orderedIds) => {
    const { folders } = get();
    const idToOrder = new Map(orderedIds.map((id, index) => [id, index]));
    const updated = folders.map((f) => ({
      ...f,
      order: idToOrder.has(f.id) ? idToOrder.get(f.id)! : f.order,
    }));
    updated.sort((a, b) => a.order - b.order);
    set({ folders: updated });

    try {
      const db = await getDatabase();
      const tx = db.transaction('folders', 'readwrite');
      for (const f of updated) {
        await tx.store.put(f);
      }
      await tx.done;
    } catch (err) {
      console.error('[BookmarkStore] Failed to persist folder reordering in IDB:', err);
    }
  },

  exportData: async () => {
    const { folders, bookmarks } = get();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      folders,
      bookmarks,
    };
  },

  importData: async (data) => {
    if (!data.folders || !data.bookmarks) {
      throw new Error('Invalid backup file format: missing folders or bookmarks.');
    }

    try {
      const db = await getDatabase();
      const tx = db.transaction(['folders', 'bookmarks'], 'readwrite');
      
      // Clear existing
      await tx.objectStore('folders').clear();
      await tx.objectStore('bookmarks').clear();

      for (const f of data.folders) {
        await tx.objectStore('folders').put(f);
      }
      for (const b of data.bookmarks) {
        await tx.objectStore('bookmarks').put(b);
      }
      await tx.done;

      set({
        folders: data.folders,
        bookmarks: data.bookmarks,
      });
    } catch (err) {
      console.error('[BookmarkStore] Failed to import backup data:', err);
      throw err;
    }
  },

  importHtmlBookmarks: async (htmlContent) => {
    // Parse Netscape Bookmark file
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));
    
    if (links.length === 0) {
      throw new Error('No bookmarks found in HTML file.');
    }

    const { folders } = get();
    let importFolder = folders.find((f) => f.name.includes('Imported'));
    if (!importFolder) {
      importFolder = await get().addFolder({
        name: 'Imported Bookmarks',
        accentColor: '#1EA7FF',
        icon: 'Download',
        zone: 'personal',
      });
    }

    let count = 0;
    for (const link of links) {
      const url = link.getAttribute('href');
      const title = link.textContent?.trim() || 'Untitled Bookmark';
      const icon = link.getAttribute('icon') || undefined;

      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        await get().addBookmark({
          title,
          url,
          folderId: importFolder.id,
          icon,
        });
        count++;
      }
    }

    return { imported: count };
  },

  syncFromChrome: async () => {
    if (typeof chrome === 'undefined' || !chrome.bookmarks) {
      return { success: false, error: 'Chrome Bookmarks API is not available in standard browser mode. Install as Chrome Extension.' };
    }

    try {
      const tree = await chrome.bookmarks.getTree();
      // Safely parse Chrome bookmarks tree and merge
      let count = 0;
      const traverse = async (node: chrome.bookmarks.BookmarkTreeNode, parentFolderId?: string) => {
        if (node.url) {
          // Bookmark item
          if (parentFolderId) {
            await get().addBookmark({
              title: node.title || 'Bookmark',
              url: node.url,
              folderId: parentFolderId,
            });
            count++;
          }
        } else if (node.children) {
          // Folder item
          let currentFolderId = parentFolderId;
          if (node.title && node.title !== 'Bookmarks bar' && node.title !== 'Other bookmarks' && node.title !== '') {
            const newFolder = await get().addFolder({
              name: `[Chrome] ${node.title}`,
              accentColor: '#1EA7FF',
              zone: 'personal',
            });
            currentFolderId = newFolder.id;
          }
          for (const child of node.children) {
            await traverse(child, currentFolderId || 'folder-5');
          }
        }
      };

      for (const root of tree) {
        await traverse(root);
      }

      return { success: true, count };
    } catch (err: any) {
      console.error('[BookmarkStore] Chrome bookmark sync error:', err);
      return { success: false, error: err.message || 'Failed to read Chrome bookmarks' };
    }
  },
}));
