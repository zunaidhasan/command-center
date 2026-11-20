import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, Note, ClientContextTemplate } from '@/types/productivity';
import { Project } from '@/types/project';
import { ClientLead, PortfolioReference } from '@/types/client-ops';
import { Bookmark, BookmarkFolder } from '@/types/bookmark';

interface ZHLabsDB extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: { 'by-completed': number; 'by-priority': string };
  };
  notes: {
    key: string;
    value: Note;
    indexes: { 'by-pinned': number; 'by-updated': number };
  };
  projects: {
    key: string;
    value: Project;
    indexes: { 'by-status': string };
  };
  clientLeads: {
    key: string;
    value: ClientLead;
    indexes: { 'by-stage': string };
  };
  portfolioReferences: {
    key: string;
    value: PortfolioReference;
    indexes: { 'by-category': string };
  };
  clientContexts: {
    key: string;
    value: ClientContextTemplate;
  };
  bookmarks: {
    key: string;
    value: Bookmark;
    indexes: { 'by-folder': string; 'by-order': number };
  };
  folders: {
    key: string;
    value: BookmarkFolder;
    indexes: { 'by-order': number };
  };
}

const DB_NAME = 'zh-labs-command-center-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ZHLabsDB>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<ZHLabsDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ZHLabsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
          taskStore.createIndex('by-completed', 'completed');
          taskStore.createIndex('by-priority', 'priority');
        }

        // Notes store
        if (!db.objectStoreNames.contains('notes')) {
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('by-pinned', 'pinned');
          noteStore.createIndex('by-updated', 'updatedAt');
        }

        // Projects store
        if (!db.objectStoreNames.contains('projects')) {
          const projectStore = db.createObjectStore('projects', { keyPath: 'id' });
          projectStore.createIndex('by-status', 'status');
        }

        // Client Leads store
        if (!db.objectStoreNames.contains('clientLeads')) {
          const leadStore = db.createObjectStore('clientLeads', { keyPath: 'id' });
          leadStore.createIndex('by-stage', 'stage');
        }

        // Portfolio References store
        if (!db.objectStoreNames.contains('portfolioReferences')) {
          const refStore = db.createObjectStore('portfolioReferences', { keyPath: 'id' });
          refStore.createIndex('by-category', 'category');
        }

        // Client Contexts store
        if (!db.objectStoreNames.contains('clientContexts')) {
          db.createObjectStore('clientContexts', { keyPath: 'id' });
        }

        // Bookmarks store
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id' });
          bookmarkStore.createIndex('by-folder', 'folderId');
          bookmarkStore.createIndex('by-order', 'order');
        }

        // Folders store
        if (!db.objectStoreNames.contains('folders')) {
          const folderStore = db.createObjectStore('folders', { keyPath: 'id' });
          folderStore.createIndex('by-order', 'order');
        }
      },
    });
  }
  return dbPromise;
}
