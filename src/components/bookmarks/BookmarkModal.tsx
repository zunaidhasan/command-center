import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Globe, Sparkles } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Bookmark } from '@/types/bookmark';
import { useBookmarkStore } from '@/store/useBookmarkStore';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBookmark?: Bookmark | null;
  defaultFolderId?: string;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  initialBookmark,
  defaultFolderId = 'folder-1',
}) => {
  const { folders, addBookmark, updateBookmark, deleteBookmark } = useBookmarkStore();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [folderId, setFolderId] = useState(defaultFolderId);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialBookmark) {
      setTitle(initialBookmark.title);
      setUrl(initialBookmark.url);
      setIcon(initialBookmark.icon || '');
      setFolderId(initialBookmark.folderId);
      setDescription(initialBookmark.description || '');
      setTags(initialBookmark.tags?.join(', ') || '');
      setIsPinned(!!initialBookmark.isPinned);
    } else {
      setTitle('');
      setUrl('');
      setIcon('');
      setFolderId(defaultFolderId);
      setDescription('');
      setTags('');
      setIsPinned(false);
    }
    setError('');
  }, [initialBookmark, defaultFolderId, isOpen]);

  const handleFetchFavicon = () => {
    if (!url.trim()) return;
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }
    try {
      const domain = new URL(finalUrl).hostname;
      setIcon(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    } catch {
      // Ignore
    }
  };

  const handleDuplicate = async () => {
    if (!initialBookmark) return;
    await addBookmark({
      title: `${title} (Copy)`,
      url: url.trim(),
      folderId,
      icon: icon.trim() || undefined,
      description: description.trim() || undefined,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isPinned: false,
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!initialBookmark) return;
    if (window.confirm(`Delete bookmark "${initialBookmark.title}"?`)) {
      await deleteBookmark(initialBookmark.id);
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    try {
      new URL(finalUrl);
    } catch {
      setError('Please enter a valid website URL');
      return;
    }

    const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (initialBookmark) {
      await updateBookmark(initialBookmark.id, {
        title: title.trim(),
        url: finalUrl,
        folderId,
        icon: icon.trim() || undefined,
        description: description.trim() || undefined,
        tags: parsedTags,
        isPinned,
      });
    } else {
      await addBookmark({
        title: title.trim(),
        url: finalUrl,
        folderId,
        icon: icon.trim() || undefined,
        description: description.trim() || undefined,
        tags: parsedTags,
        isPinned,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
      description="Save a frequently accessed tool, project, or documentation page."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs select-none">
        {error && (
          <div className="p-2.5 rounded bg-red-500/15 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="text-text-secondary font-medium block mb-1">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. GitHub"
            required
          />
        </div>

        <div>
          <label className="text-text-secondary font-medium block mb-1">Target URL</label>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleFetchFavicon}
              placeholder="e.g. github.com"
              className="flex-1"
              required
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleFetchFavicon}
              title="Auto-fetch domain favicon"
            >
              <Globe className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-secondary font-medium block mb-1">Category Folder</label>
            <select
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-2 text-text-primary focus:outline-none focus:border-primary"
            >
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-text-secondary font-medium block mb-1">Custom Icon URL (Optional)</label>
            <Input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="https://.../icon.png"
            />
          </div>
        </div>

        <div>
          <label className="text-text-secondary font-medium block mb-1">Description (Optional)</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief technical or context note"
          />
        </div>

        <div>
          <label className="text-text-secondary font-medium block mb-1">Tags (Comma-separated)</label>
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="AI, Dev, Research, Sales"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-text-primary font-medium">Pin to Category Favorites</span>
          </label>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            {initialBookmark && (
              <>
                <button
                  type="button"
                  onClick={handleDuplicate}
                  className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors p-1"
                  title="Duplicate Bookmark"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Duplicate</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-text-secondary hover:text-red-400 transition-colors p-1"
                  title="Delete Bookmark"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {initialBookmark ? 'Save Changes' : 'Add Bookmark'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
