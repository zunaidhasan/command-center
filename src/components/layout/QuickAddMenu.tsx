import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Bookmark,
  CheckSquare,
  FileText,
  FolderGit2,
  LayoutGrid,
  AppWindow,
  Sliders,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

interface QuickAddMenuProps {
  onAddBookmark: () => void;
  onAddTask: () => void;
  onAddNote: () => void;
  onAddProject: () => void;
  onAddWorkspace: () => void;
  onAddWidget: () => void;
}

export const QuickAddMenu: React.FC<QuickAddMenuProps> = ({
  onAddBookmark,
  onAddTask,
  onAddNote,
  onAddProject,
  onAddWorkspace,
  onAddWidget,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const ACTIONS = [
    { label: 'Add Bookmark', icon: Bookmark, color: '#1EA7FF', action: onAddBookmark },
    { label: 'Add Task', icon: CheckSquare, color: '#18D879', action: onAddTask },
    { label: 'Add Quick Note', icon: FileText, color: '#FFB21A', action: onAddNote },
    { label: 'Add Project', icon: FolderGit2, color: '#B66BFF', action: onAddProject },
    { label: 'Add Dashboard Widget', icon: AppWindow, color: '#EF233C', action: onAddWidget },
    { label: 'New Workspace', icon: LayoutGrid, color: '#00F0FF', action: onAddWorkspace },
  ];

  return (
    <div ref={menuRef} className="relative select-none">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm-card bg-primary text-white hover:bg-primary-hover shadow-sm transition-all font-medium text-xs"
        title="Universal Quick Add"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Add</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-surface border border-border rounded-card shadow-elevated z-50 p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 text-[10px] font-mono text-text-muted uppercase tracking-wider border-b border-border/50 mb-1">
            Universal Quick Add
          </div>

          {ACTIONS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  setIsOpen(false);
                  item.action();
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-sm-card hover:bg-surface-secondary text-text-secondary hover:text-text-primary text-xs transition-colors text-left"
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: `${item.color}18`,
                    borderColor: `${item.color}35`,
                    color: item.color,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
