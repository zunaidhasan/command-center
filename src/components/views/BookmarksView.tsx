import React, { useState } from 'react';
import {
  FolderPlus,
  Plus,
  Search,
  Upload,
  Download,
  RefreshCw,
  Folder,
  Trash2,
  Edit2,
  ExternalLink,
  Pin,
  CheckCircle,
} from 'lucide-react';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { BookmarkCard } from '@/components/bookmarks/BookmarkCard';
import { BookmarkModal } from '@/components/bookmarks/BookmarkModal';
import { FolderModal } from '@/components/bookmarks/FolderModal';
import { Bookmark, BookmarkFolder } from '@/types/bookmark';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

export const BookmarksView: React.FC = () => {
  const {
    folders,
    bookmarks,
    searchQuery,
    setSearchQuery,
    syncMode,
    setSyncMode,
    syncFromChrome,
    exportData,
    importData,
    importHtmlBookmarks,
    deleteFolder,
  } = useBookmarkStore();

  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [editingFolder, setEditingFolder] = useState<BookmarkFolder | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Filter bookmarks
  const filteredBookmarks = bookmarks.filter((bm) => {
    const matchesSearch =
      !searchQuery.trim() ||
      bm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bm.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder = selectedFolderId === 'all' || bm.folderId === selectedFolderId;
    return matchesSearch && matchesFolder;
  });

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zh-labs-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
          const res = await importHtmlBookmarks(text);
          setSyncStatus(`Imported ${res.imported} bookmarks from HTML file.`);
        } else {
          const json = JSON.parse(text);
          await importData(json);
          setSyncStatus('Successfully imported bookmarks and folders!');
        }
      } catch (err: any) {
        setSyncStatus(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleChromeSync = async () => {
    setSyncStatus('Checking Chrome Bookmarks API...');
    const result = await syncFromChrome();
    if (result.success) {
      setSyncStatus(`Synced ${result.count} bookmarks from Chrome!`);
    } else {
      setSyncStatus(`Chrome Sync Notice: ${result.error}`);
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
            Bookmark Manager
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Organize, search, and synchronize your complete developer and operational bookmark collection.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setEditingFolder(null);
              setFolderModalOpen(true);
            }}
          >
            <FolderPlus className="w-4 h-4 text-accent-engineering" />
            <span>New Folder</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingBookmark(null);
              setBookmarkModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Bookmark</span>
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json,.html"
              onChange={handleImportFile}
              className="hidden"
            />
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm-card text-xs font-medium bg-surface-secondary text-text-secondary hover:text-text-primary border border-border transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import</span>
            </div>
          </label>

          <Button variant="secondary" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 text-text-muted" />
            <span>Export</span>
          </Button>

          <Button variant="outline" size="sm" onClick={handleChromeSync}>
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Chrome Sync</span>
          </Button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="p-3 rounded-card bg-surface-secondary border border-border text-xs flex items-center justify-between animate-in fade-in">
          <span className="text-text-primary font-mono">{syncStatus}</span>
          <button
            onClick={() => setSyncStatus(null)}
            className="text-text-muted hover:text-text-primary text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="w-full sm:w-80">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search all bookmarks..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Folder Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          <button
            onClick={() => setSelectedFolderId('all')}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
              selectedFolderId === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            All ({bookmarks.length})
          </button>

          {folders.map((folder) => {
            const count = bookmarks.filter((b) => b.folderId === folder.id).length;
            const isSelected = selectedFolderId === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isSelected
                    ? 'bg-surface-hover text-text-primary border border-primary shadow-sm'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: folder.accentColor || '#1EA7FF' }}
                />
                <span>{folder.name}</span>
                <span className="text-[10px] font-mono text-text-muted">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookmarks Grid Display */}
      {selectedFolderId === 'all' ? (
        // Grouped by Folder
        <div className="space-y-6">
          {folders.map((folder) => {
            const folderBms = bookmarks.filter((b) => b.folderId === folder.id);
            if (folderBms.length === 0 && searchQuery) return null;

            return (
              <div
                key={folder.id}
                className="bg-surface/80 border border-border rounded-card p-4 lg:p-5 shadow-card"
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: folder.accentColor || '#1EA7FF' }}
                    />
                    <h3 className="font-heading font-bold text-sm lg:text-base text-text-primary">
                      {folder.name}
                    </h3>
                    <span className="text-xs font-mono text-text-muted">
                      ({folderBms.length})
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingFolder(folder);
                        setFolderModalOpen(true);
                      }}
                      title="Edit folder"
                      className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete folder "${folder.name}" and all its bookmarks?`)) {
                          deleteFolder(folder.id);
                        }
                      }}
                      title="Delete folder"
                      className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingBookmark(null);
                        setBookmarkModalOpen(true);
                      }}
                      className="text-xs ml-2"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {folderBms.map((bm) => (
                    <BookmarkCard
                      key={bm.id}
                      bookmark={bm}
                      onEdit={(item) => {
                        setEditingBookmark(item);
                        setBookmarkModalOpen(true);
                      }}
                      accentColor={folder.accentColor}
                    />
                  ))}
                  {folderBms.length === 0 && (
                    <div className="col-span-full py-6 text-center text-xs text-text-muted">
                      No bookmarks in this folder yet.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Specific Folder View
        <div className="bg-surface/80 border border-border rounded-card p-5 shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredBookmarks.map((bm) => (
              <BookmarkCard
                key={bm.id}
                bookmark={bm}
                onEdit={(item) => {
                  setEditingBookmark(item);
                  setBookmarkModalOpen(true);
                }}
              />
            ))}
            {filteredBookmarks.length === 0 && (
              <div className="col-span-full py-12 text-center text-xs text-text-muted">
                No matching bookmarks found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookmark Modal */}
      {bookmarkModalOpen && (
        <BookmarkModal
          isOpen={bookmarkModalOpen}
          onClose={() => setBookmarkModalOpen(false)}
          initialBookmark={editingBookmark}
          defaultFolderId={selectedFolderId !== 'all' ? selectedFolderId : 'folder-1'}
        />
      )}

      {/* Folder Modal */}
      {folderModalOpen && (
        <FolderModal
          isOpen={folderModalOpen}
          onClose={() => setFolderModalOpen(false)}
          initialFolder={editingFolder}
        />
      )}
    </div>
  );
};
