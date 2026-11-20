export interface Bookmark {
  id: string;
  title: string;
  url: string;
  folderId: string;
  icon?: string;
  description?: string;
  order: number;
  isPinned?: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface BookmarkFolder {
  id: string;
  name: string;
  parentId?: string | null;
  order: number;
  accentColor?: string;
  icon?: string;
  zone?: 'engineering' | 'client-ops' | 'creative' | 'personal';
}

export type BookmarkSyncMode = 'independent' | 'chrome';

export interface BookmarkExportData {
  version: string;
  exportedAt: string;
  folders: BookmarkFolder[];
  bookmarks: Bookmark[];
}
