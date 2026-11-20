import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { BookmarkFolder } from '@/types/bookmark';
import { useBookmarkStore } from '@/store/useBookmarkStore';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFolder?: BookmarkFolder | null;
}

export const FolderModal: React.FC<FolderModalProps> = ({
  isOpen,
  onClose,
  initialFolder,
}) => {
  const { addFolder, updateFolder } = useBookmarkStore();
  const [name, setName] = useState('');
  const [accentColor, setAccentColor] = useState('#1EA7FF');
  const [zone, setZone] = useState<BookmarkFolder['zone']>('engineering');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialFolder) {
      setName(initialFolder.name);
      setAccentColor(initialFolder.accentColor || '#1EA7FF');
      setZone(initialFolder.zone || 'engineering');
    } else {
      setName('');
      setAccentColor('#1EA7FF');
      setZone('engineering');
    }
    setError('');
  }, [initialFolder, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Folder name is required');
      return;
    }

    if (initialFolder) {
      await updateFolder(initialFolder.id, {
        name: name.trim(),
        accentColor,
        zone,
      });
    } else {
      await addFolder({
        name: name.trim(),
        accentColor,
        zone,
      });
    }

    onClose();
  };

  const COLOR_OPTIONS = [
    '#EF233C', // Crimson
    '#1EA7FF', // Blue
    '#18D879', // Green
    '#B66BFF', // Purple
    '#FFB21A', // Amber
    '#00F0FF', // Cyan
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialFolder ? 'Edit Bookmark Folder' : 'Create Bookmark Folder'}
      description="Organize your bookmarks into dedicated category folders."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 rounded bg-red-500/15 border border-red-500/30 text-xs text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Folder Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AI Agent Workflows"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">
            Workspace Hub Category
          </label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value as BookmarkFolder['zone'])}
            className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2 focus:outline-none focus:border-primary"
          >
            <option value="engineering">AI & Engineering Hub</option>
            <option value="client-ops">Client Operations & Sales</option>
            <option value="creative">UI/UX & Design Sandbox</option>
            <option value="personal">Personal & Quick-Research</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1.5">
            Accent Color
          </label>
          <div className="flex items-center gap-2">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAccentColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  accentColor === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-background' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialFolder ? 'Save Changes' : 'Create Folder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
