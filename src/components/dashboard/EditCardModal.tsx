import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DashboardCardConfig, SideWidgetType, CardColSpan } from '@/types/dashboard';
import { useBookmarkStore } from '@/store/useBookmarkStore';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: DashboardCardConfig | null;
  onSave: (cardId: string, updates: Partial<DashboardCardConfig>) => Promise<void>;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({
  isOpen,
  onClose,
  card,
  onSave,
}) => {
  const { folders } = useBookmarkStore();
  const [title, setTitle] = useState('');
  const [accentColor, setAccentColor] = useState('#1EA7FF');
  const [sideWidget, setSideWidget] = useState<SideWidgetType>('none');
  const [colSpan, setColSpan] = useState<CardColSpan>(1);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [icon, setIcon] = useState('Code2');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setAccentColor(card.accentColor);
      setSideWidget(card.sideWidget);
      setColSpan(card.colSpan);
      setSelectedFolderIds(card.folderIds || []);
      setIcon(card.icon || 'Code2');
    }
  }, [card]);

  if (!card) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSave(card.id, {
      title: title.trim(),
      accentColor,
      sideWidget,
      colSpan,
      folderIds: selectedFolderIds,
      icon,
    });
    onClose();
  };

  const toggleFolder = (folderId: string) => {
    if (selectedFolderIds.includes(folderId)) {
      setSelectedFolderIds(selectedFolderIds.filter((id) => id !== folderId));
    } else {
      setSelectedFolderIds([...selectedFolderIds, folderId]);
    }
  };

  const PRESET_ACCENTS = [
    { name: 'Engineering Blue', hex: '#1EA7FF' },
    { name: 'Client Green', hex: '#18D879' },
    { name: 'Creative Violet', hex: '#B66BFF' },
    { name: 'Amber Gold', hex: '#FFB21A' },
    { name: 'Crimson Red', hex: '#EF233C' },
    { name: 'Cyber Cyan', hex: '#00F0FF' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Customize Hub: ${card.title}`}
      description="Configure title, layout span, folder associations, and embedded side widgets."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs select-none">
        <div>
          <label className="text-text-secondary font-medium block mb-1">Hub Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. AI & Engineering Hub"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-secondary font-medium block mb-1">Grid Width</label>
            <select
              value={colSpan}
              onChange={(e) => setColSpan(Number(e.target.value) as CardColSpan)}
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value={1}>1 Column (Standard 50% width)</option>
              <option value={2}>2 Columns (Full Row 100% width)</option>
            </select>
          </div>

          <div>
            <label className="text-text-secondary font-medium block mb-1">Embedded Side Widget</label>
            <select
              value={sideWidget}
              onChange={(e) => setSideWidget(e.target.value as SideWidgetType)}
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="none">None (Full width for app tiles)</option>
              <option value="quick-stats">Quick Stats (Growth Sparkline)</option>
              <option value="quick-tools">Quick Tools (Color, JSON, SVG, Image)</option>
              <option value="todo-notes">Todo / Notes (Interactive Tasks)</option>
            </select>
          </div>
        </div>

        {/* Accent Color */}
        <div>
          <label className="text-text-secondary font-medium block mb-1.5">Accent Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer bg-surface p-0.5"
            />
            <Input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="flex-1 font-mono"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {PRESET_ACCENTS.map((p) => (
              <button
                type="button"
                key={p.hex}
                onClick={() => setAccentColor(p.hex)}
                className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform"
                style={{ backgroundColor: p.hex }}
                title={p.name}
              />
            ))}
          </div>
        </div>

        {/* Icon */}
        <div>
          <label className="text-text-secondary font-medium block mb-1">Header Icon</label>
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
          >
            <option value="Code2">Code2 (Engineering & Code)</option>
            <option value="Briefcase">Briefcase (Client Ops & Business)</option>
            <option value="Palette">Palette (UI/UX & Creative)</option>
            <option value="Bookmark">Bookmark (Personal & Research)</option>
            <option value="Terminal">Terminal (Dev & Shell)</option>
            <option value="Cpu">Cpu (Hardware & System)</option>
            <option value="Sparkles">Sparkles (AI & Automation)</option>
          </select>
        </div>

        {/* Folder associations */}
        <div>
          <label className="text-text-secondary font-medium block mb-1.5">
            Included Bookmark Categories ({selectedFolderIds.length} selected)
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-surface-secondary/50 rounded-sm-card border border-border/60">
            {folders.map((f) => {
              const isSelected = selectedFolderIds.includes(f.id);
              return (
                <div
                  key={f.id}
                  onClick={() => toggleFolder(f.id)}
                  className="flex items-center justify-between p-2 rounded bg-surface/70 hover:bg-surface border border-border/50 cursor-pointer transition-colors"
                >
                  <span className="text-text-primary font-medium">{f.name}</span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleFolder(f.id)}
                    className="accent-primary"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
