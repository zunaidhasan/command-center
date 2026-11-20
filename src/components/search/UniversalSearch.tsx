import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, History, X, ArrowUpRight } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

interface SearchChip {
  id: string;
  name: string;
  iconBg: string;
  textColor: string;
  urlPrefix: string;
}

const SEARCH_CHIPS: SearchChip[] = [
  {
    id: 'google',
    name: 'Google',
    iconBg: '#4285F4',
    textColor: '#FFFFFF',
    urlPrefix: 'https://www.google.com/search?q=',
  },
  {
    id: 'github',
    name: 'GitHub',
    iconBg: '#24292E',
    textColor: '#FFFFFF',
    urlPrefix: 'https://github.com/search?q=',
  },
  {
    id: 'docs',
    name: 'Docs',
    iconBg: '#10B981',
    textColor: '#FFFFFF',
    urlPrefix: 'https://devdocs.io/#q=',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    iconBg: '#FF0000',
    textColor: '#FFFFFF',
    urlPrefix: 'https://www.youtube.com/results?search_query=',
  },
  {
    id: 'figma',
    name: 'Figma',
    iconBg: '#A259FF',
    textColor: '#FFFFFF',
    urlPrefix: 'https://www.figma.com/community/search?resource_type=mixed&sort_by=relevancy&query=',
  },
];

const HISTORY_KEY = 'zh_search_history';

export const UniversalSearch: React.FC = () => {
  const { setCommandPaletteOpen } = useUIStore();
  const [query, setQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('google');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved).slice(0, 5));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveToHistory = (item: string) => {
    try {
      const clean = item.trim();
      if (!clean) return;
      const updated = [clean, ...history.filter((h) => h !== clean)].slice(0, 5);
      setHistory(updated);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const removeHistoryItem = (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((h) => h !== item);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  // Close history dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global "/" shortcut to focus search input without conflicting with forms
  useEffect(() => {
    const handleSlashKey = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) &&
        !isEditable
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setShowHistory(true);
      }
    };

    window.addEventListener('keydown', handleSlashKey);
    return () => window.removeEventListener('keydown', handleSlashKey);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setCommandPaletteOpen(true);
      return;
    }

    saveToHistory(query.trim());
    const provider = SEARCH_CHIPS.find((c) => c.id === selectedProvider) || SEARCH_CHIPS[0];
    window.open(`${provider.urlPrefix}${encodeURIComponent(query.trim())}`, '_blank');
    setQuery('');
    setShowHistory(false);
  };

  const handleSelectHistory = (item: string) => {
    setQuery(item);
    const provider = SEARCH_CHIPS.find((c) => c.id === selectedProvider) || SEARCH_CHIPS[0];
    window.open(`${provider.urlPrefix}${encodeURIComponent(item)}`, '_blank');
    setShowHistory(false);
  };

  const handleChipClick = (chipId: string) => {
    setSelectedProvider(chipId);
    if (query.trim()) {
      saveToHistory(query.trim());
      const chip = SEARCH_CHIPS.find((c) => c.id === chipId);
      if (chip) {
        window.open(`${chip.urlPrefix}${encodeURIComponent(query.trim())}`, '_blank');
      }
    }
  };

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div ref={containerRef} className="relative flex flex-col items-center w-full max-w-xl mx-auto">
      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="relative w-full group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setShowHistory(true)}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Google, GitHub, bookmarks, docs, or press / to focus..."
          className="w-full bg-surface/90 hover:bg-surface border border-border group-focus-within:border-primary text-text-primary text-xs lg:text-sm rounded-pill pl-10 pr-24 py-2.5 shadow-subtle backdrop-blur-md transition-all duration-150 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-pill bg-surface-secondary/80 border border-border/80 text-[11px] font-mono text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors shadow-sm"
            title="Open Command Palette (Ctrl+K or Cmd+K)"
          >
            {isMac ? <Command className="w-3 h-3" /> : <span className="text-[10px]">Ctrl</span>}
            <span>K</span>
          </button>
        </div>
      </form>

      {/* Recent Search History Dropdown */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-surface border border-border rounded-card shadow-elevated z-50 p-1.5 animate-in fade-in duration-100">
          <div className="px-2.5 py-1 text-[10px] font-mono text-text-muted flex items-center gap-1 border-b border-border/50">
            <History className="w-3 h-3" />
            <span>Recent Searches</span>
          </div>
          <div className="space-y-0.5 mt-1">
            {history.map((item) => (
              <div
                key={item}
                onClick={() => handleSelectHistory(item)}
                className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-surface-secondary text-xs text-text-secondary hover:text-text-primary cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-3 h-3 text-text-muted" />
                  <span className="truncate">{item}</span>
                </div>
                <button
                  onClick={(e) => removeHistoryItem(item, e)}
                  className="p-1 hover:text-red-400 text-text-muted transition-colors"
                  title="Remove from history"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Search Provider Chips */}
      <div className="flex items-center gap-2 mt-2 select-none overflow-x-auto max-w-full pb-1">
        {SEARCH_CHIPS.map((chip) => {
          const isSelected = selectedProvider === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleChipClick(chip.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-[11px] font-medium transition-all ${
                isSelected
                  ? 'bg-surface-secondary text-text-primary border border-primary/50 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ backgroundColor: chip.iconBg }}
              />
              <span>{chip.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
