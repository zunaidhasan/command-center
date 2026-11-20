import React, { useState } from 'react';
import { ExternalLink, Edit2, Trash2, Pin, MoreVertical } from 'lucide-react';
import { Bookmark } from '@/types/bookmark';
import { useBookmarkStore } from '@/store/useBookmarkStore';

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit?: (bookmark: Bookmark) => void;
  accentColor?: string;
  folderName?: string;
  displayMode?: 'compact' | 'standard' | 'detailed';
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  onEdit,
  accentColor = '#1EA7FF',
  folderName,
  displayMode = 'standard',
}) => {
  const { deleteBookmark, togglePinBookmark } = useBookmarkStore();
  const [imgError, setImgError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.bookmark-menu')) {
      return;
    }
    window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  const fallbackLetter = bookmark.title.charAt(0).toUpperCase();

  let hostname = '';
  try {
    hostname = new URL(bookmark.url).hostname.replace('www.', '');
  } catch {
    hostname = bookmark.url;
  }

  // ==========================================
  // COMPACT MODE: Minimal icon tile
  // ==========================================
  if (displayMode === 'compact') {
    return (
      <div
        onClick={handleClick}
        className="group relative flex items-center justify-center p-2 rounded-card bg-surface-secondary/40 hover:bg-surface-secondary/90 border border-border/70 hover:border-border-hover transition-all duration-200 cursor-pointer select-none hover:shadow-subtle hover:-translate-y-0.5"
      >
        <div className="relative w-9 h-9 rounded-card bg-surface flex items-center justify-center overflow-hidden border border-border/80 group-hover:border-primary/40 transition-colors shadow-sm">
          {bookmark.icon && !imgError ? (
            <img
              src={bookmark.icon}
              alt={bookmark.title}
              onError={() => setImgError(true)}
              className="w-5 h-5 object-contain transition-transform group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-heading font-bold text-xs text-white"
              style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            >
              {fallbackLetter}
            </div>
          )}
          {bookmark.isPinned && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </div>

        {/* Hover Tooltip */}
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
          <div className="bg-[#0D1117] border border-border/90 text-text-primary rounded-sm-card px-2.5 py-1.5 shadow-elevated text-left space-y-0.5 backdrop-blur-md">
            <span className="font-heading font-semibold text-xs text-text-primary block">
              {bookmark.title}
            </span>
            <span className="text-[11px] font-mono text-accent-engineering/90 block">
              {hostname}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // DETAILED MODE: Card with description
  // ==========================================
  if (displayMode === 'detailed') {
    return (
      <div
        onClick={handleClick}
        className="group relative flex items-start gap-3 p-3 rounded-card bg-surface-secondary/40 hover:bg-surface-secondary/90 border border-border/70 hover:border-border-hover transition-all duration-200 cursor-pointer select-none hover:shadow-subtle"
      >
        <div className="relative w-11 h-11 rounded-card bg-surface flex items-center justify-center overflow-hidden border border-border/80 group-hover:border-primary/40 transition-colors shadow-sm shrink-0">
          {bookmark.icon && !imgError ? (
            <img
              src={bookmark.icon}
              alt={bookmark.title}
              onError={() => setImgError(true)}
              className="w-6 h-6 object-contain"
              loading="lazy"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center font-heading font-bold text-sm text-white"
              style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
            >
              {fallbackLetter}
            </div>
          )}
          {bookmark.isPinned && (
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="font-heading font-semibold text-xs text-text-primary truncate group-hover:text-white">
              {bookmark.title}
            </span>
            <ExternalLink className="w-3 h-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="text-[11px] font-mono text-accent-engineering/90 truncate mt-0.5">
            {hostname}
          </div>
          {bookmark.description && (
            <p className="text-[11px] text-text-secondary line-clamp-1 mt-1">
              {bookmark.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // STANDARD MODE (Default)
  // ==========================================
  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col items-center justify-center p-2.5 rounded-card bg-surface-secondary/40 hover:bg-surface-secondary/90 border border-border/70 hover:border-border-hover transition-all duration-200 cursor-pointer select-none hover:shadow-subtle hover:-translate-y-0.5"
    >
      {/* Icon Container with Subtle Glow on Hover */}
      <div className="relative w-11 h-11 rounded-card bg-surface flex items-center justify-center overflow-hidden border border-border/80 group-hover:border-primary/40 transition-colors shadow-sm">
        {bookmark.icon && !imgError ? (
          <img
            src={bookmark.icon}
            alt={bookmark.title}
            onError={() => setImgError(true)}
            className="w-6 h-6 object-contain transition-transform group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center font-heading font-bold text-sm text-white"
            style={{ backgroundColor: `${accentColor}25`, color: accentColor }}
          >
            {fallbackLetter}
          </div>
        )}

        {bookmark.isPinned && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </div>

      {/* Truncated Title on card surface */}
      <span className="mt-1.5 text-xs font-medium text-text-primary text-center truncate w-full px-1 group-hover:text-white transition-colors">
        {bookmark.title}
      </span>

      {/* Hover Action Menu Trigger */}
      <div className="bookmark-menu absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
          title="More options"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 top-full mt-1 w-32 bg-surface border border-border rounded-sm-card shadow-elevated z-30 p-1 space-y-0.5 text-xs animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit?.(bookmark);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                togglePinBookmark(bookmark.id);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-surface-secondary text-text-secondary hover:text-text-primary"
            >
              <Pin className="w-3 h-3" />
              <span>{bookmark.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                deleteBookmark(bookmark.id);
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-500/15 text-red-400"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Clean Floating Tooltip */}
      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50">
        <div className="bg-[#0D1117] border border-border/90 text-text-primary rounded-sm-card px-2.5 py-1.5 shadow-elevated text-left space-y-0.5 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-semibold text-xs text-text-primary">
              {bookmark.title}
            </span>
            {bookmark.isPinned && (
              <span className="text-[9px] font-mono uppercase bg-primary/20 text-primary-light px-1 py-0.2 rounded">
                Pinned
              </span>
            )}
          </div>
          <div className="text-[11px] font-mono text-accent-engineering/90 truncate flex items-center gap-1">
            <span>{hostname}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </div>
          {bookmark.description && (
            <p className="text-[11px] text-text-secondary leading-snug pt-0.5 max-w-[220px]">
              {bookmark.description}
            </p>
          )}
          {folderName && (
            <div className="text-[10px] font-mono text-text-muted pt-0.5 border-t border-border/40">
              {folderName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
