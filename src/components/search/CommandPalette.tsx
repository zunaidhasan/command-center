import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Bookmark,
  FolderGit2,
  CheckSquare,
  FileText,
  Palette,
  Terminal,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useProductivityStore } from '@/store/useProductivityStore';
import { useThemeStore } from '@/store/useThemeStore';
import { ThemePreset } from '@/types/theme';
import { WorkspaceMode } from '@/types/workspace';

interface PaletteItem {
  id: string;
  type: 'bookmark' | 'project' | 'task' | 'note' | 'command' | 'theme' | 'workspace';
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  action: () => void;
  badge?: string;
}

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveView, setActiveWorkspace } = useUIStore();
  const { bookmarks } = useBookmarkStore();
  const { projects } = useProjectStore();
  const { tasks, notes, addTask, addNote } = useProductivityStore();
  const { setPreset } = useThemeStore();

  const [input, setInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input on open
  useEffect(() => {
    if (commandPaletteOpen) {
      setInput('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Build searchable items
  const items: PaletteItem[] = useMemo(() => {
    const query = input.trim().toLowerCase();
    const result: PaletteItem[] = [];

    // Handle slash commands
    if (query.startsWith('/')) {
      const parts = query.slice(1).split(' ');
      const command = parts[0];
      const arg = parts.slice(1).join(' ');

      if ('theme'.startsWith(command)) {
        const presets: ThemePreset[] = ['midnight', 'cyber', 'violet', 'crimson', 'forest', 'light'];
        presets.forEach((p) => {
          result.push({
            id: `cmd-theme-${p}`,
            type: 'theme',
            title: `Set Theme: ${p.toUpperCase()}`,
            subtitle: `Switch current theme preset to ${p}`,
            icon: Palette,
            badge: 'Theme',
            action: () => {
              setPreset(p);
              setCommandPaletteOpen(false);
            },
          });
        });
      }

      if ('workspace'.startsWith(command)) {
        const modes: { id: WorkspaceMode; name: string }[] = [
          { id: 'engineering', name: 'Engineering Mode' },
          { id: 'client-ops', name: 'Client Ops & Sales' },
          { id: 'creative', name: 'Creative Sandbox' },
          { id: 'personal', name: 'Personal & Research' },
        ];
        modes.forEach((m) => {
          result.push({
            id: `cmd-ws-${m.id}`,
            type: 'workspace',
            title: `Switch Workspace: ${m.name}`,
            subtitle: `Activate ${m.name} layout and tools`,
            icon: Terminal,
            badge: 'Workspace',
            action: () => {
              setActiveWorkspace(m.id);
              setActiveView('home');
              setCommandPaletteOpen(false);
            },
          });
        });
      }

      if ('todo'.startsWith(command) || 'task'.startsWith(command)) {
        result.push({
          id: 'cmd-new-task',
          type: 'command',
          title: arg ? `Create task: "${arg}"` : 'Create new task...',
          subtitle: 'Add to productivity checklist',
          icon: CheckSquare,
          badge: 'Productivity',
          action: () => {
            if (arg) {
              addTask({ title: arg, priority: 'medium', completed: false });
            }
            setActiveView('productivity');
            setCommandPaletteOpen(false);
          },
        });
      }

      if ('note'.startsWith(command)) {
        result.push({
          id: 'cmd-new-note',
          type: 'command',
          title: arg ? `Create note: "${arg}"` : 'Create new note...',
          subtitle: 'Save thought into quick notes',
          icon: FileText,
          badge: 'Notes',
          action: () => {
            if (arg) {
              addNote({ title: arg, content: '', pinned: false });
            }
            setActiveView('productivity');
            setCommandPaletteOpen(false);
          },
        });
      }

      if ('github'.startsWith(command)) {
        result.push({
          id: 'cmd-github-search',
          type: 'command',
          title: `Search GitHub for "${arg || '...'}"`,
          subtitle: 'Open GitHub repositories search in new tab',
          icon: FolderGit2,
          badge: 'GitHub',
          action: () => {
            window.open(`https://github.com/search?q=${encodeURIComponent(arg)}`, '_blank');
            setCommandPaletteOpen(false);
          },
        });
      }

      if ('docs'.startsWith(command)) {
        result.push({
          id: 'cmd-docs-search',
          type: 'command',
          title: `Search DevDocs for "${arg || '...'}"`,
          subtitle: 'Search API and technical documentation',
          icon: Sparkles,
          badge: 'Docs',
          action: () => {
            window.open(`https://devdocs.io/#q=${encodeURIComponent(arg)}`, '_blank');
            setCommandPaletteOpen(false);
          },
        });
      }

      if ('search'.startsWith(command) || 'google'.startsWith(command)) {
        result.push({
          id: 'cmd-google-search',
          type: 'command',
          title: `Google Search: "${arg || '...'}"`,
          subtitle: 'Search Google in new tab',
          icon: Search,
          badge: 'Web',
          action: () => {
            window.open(`https://www.google.com/search?q=${encodeURIComponent(arg)}`, '_blank');
            setCommandPaletteOpen(false);
          },
        });
      }

      return result;
    }

    // Default search across Bookmarks
    bookmarks.forEach((bm) => {
      if (
        !query ||
        bm.title.toLowerCase().includes(query) ||
        bm.url.toLowerCase().includes(query) ||
        bm.description?.toLowerCase().includes(query)
      ) {
        result.push({
          id: `bm-${bm.id}`,
          type: 'bookmark',
          title: bm.title,
          subtitle: bm.url,
          icon: Bookmark,
          badge: 'Bookmark',
          action: () => {
            window.open(bm.url, '_blank');
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    // Search across Projects
    projects.forEach((proj) => {
      if (
        !query ||
        proj.name.toLowerCase().includes(query) ||
        proj.description.toLowerCase().includes(query)
      ) {
        result.push({
          id: `proj-${proj.id}`,
          type: 'project',
          title: proj.name,
          subtitle: proj.deploymentUrl || proj.repositoryUrl || proj.description,
          icon: FolderGit2,
          badge: 'Project',
          action: () => {
            if (proj.deploymentUrl) {
              window.open(proj.deploymentUrl, '_blank');
            } else if (proj.repositoryUrl) {
              window.open(proj.repositoryUrl, '_blank');
            } else {
              setActiveView('projects');
            }
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    // Search across Tasks
    tasks.forEach((task) => {
      if (!query || task.title.toLowerCase().includes(query)) {
        result.push({
          id: `task-${task.id}`,
          type: 'task',
          title: task.title,
          subtitle: `Priority: ${task.priority.toUpperCase()} • ${
            task.completed ? 'Completed' : 'Pending'
          }`,
          icon: CheckSquare,
          badge: 'Task',
          action: () => {
            setActiveView('productivity');
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    // Search across Notes
    notes.forEach((note) => {
      if (
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      ) {
        result.push({
          id: `note-${note.id}`,
          type: 'note',
          title: note.title,
          subtitle: note.content.slice(0, 60),
          icon: FileText,
          badge: 'Note',
          action: () => {
            setActiveView('productivity');
            setCommandPaletteOpen(false);
          },
        });
      }
    });

    // Fallback web search option if typing a query
    if (query) {
      result.push({
        id: 'fallback-google',
        type: 'command',
        title: `Search Google for "${query}"`,
        subtitle: 'Search the web in a new tab',
        icon: Search,
        badge: 'Google',
        action: () => {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
          setCommandPaletteOpen(false);
        },
      });

      result.push({
        id: 'fallback-github',
        type: 'command',
        title: `Search GitHub for "${query}"`,
        subtitle: 'Find repositories, issues, and code',
        icon: FolderGit2,
        badge: 'GitHub',
        action: () => {
          window.open(`https://github.com/search?q=${encodeURIComponent(query)}`, '_blank');
          setCommandPaletteOpen(false);
        },
      });
    }

    return result.slice(0, 15);
  }, [input, bookmarks, projects, tasks, notes, setPreset, setActiveWorkspace, setActiveView, setCommandPaletteOpen, addTask, addNote]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-card shadow-elevated z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input Header */}
        <div className="flex items-center px-4 py-3 border-b border-border bg-surface-secondary/40">
          <Search className="w-5 h-5 text-text-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search (e.g. /theme, /todo, /github, or any keyword)..."
            className="w-full bg-transparent text-text-primary text-sm font-medium placeholder:text-text-muted focus:outline-none"
          />
          <span className="text-[10px] font-mono bg-surface-secondary text-text-muted px-2 py-1 rounded border border-border shrink-0 ml-2">
            ESC
          </span>
        </div>

        {/* Quick Command Hint Bar */}
        <div className="px-4 py-2 border-b border-border/50 bg-surface-darker/50 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-text-muted">
          <span className="text-primary font-semibold">Shortcuts:</span>
          <button
            onClick={() => setInput('/theme ')}
            className="hover:text-text-primary px-1.5 py-0.5 rounded bg-surface/60"
          >
            /theme
          </button>
          <button
            onClick={() => setInput('/workspace ')}
            className="hover:text-text-primary px-1.5 py-0.5 rounded bg-surface/60"
          >
            /workspace
          </button>
          <button
            onClick={() => setInput('/todo ')}
            className="hover:text-text-primary px-1.5 py-0.5 rounded bg-surface/60"
          >
            /todo
          </button>
          <button
            onClick={() => setInput('/note ')}
            className="hover:text-text-primary px-1.5 py-0.5 rounded bg-surface/60"
          >
            /note
          </button>
          <button
            onClick={() => setInput('/github ')}
            className="hover:text-text-primary px-1.5 py-0.5 rounded bg-surface/60"
          >
            /github
          </button>
          <button
            onClick={() => setInput('/docs ')}
            className="hover:text-text-primary px-1.5 py-0.5 rounded bg-surface/60"
          >
            /docs
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-xs">
              No matching bookmarks, projects, or commands found.
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = selectedIndex === index;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-sm-card cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary/15 text-white border border-primary/30'
                      : 'text-text-secondary hover:bg-surface-secondary/70'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-sm-card shrink-0 ${
                        isSelected ? 'bg-primary text-white' : 'bg-surface-secondary text-text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-text-primary truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] font-mono text-text-muted truncate">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {item.badge && (
                      <span className="text-[10px] font-mono bg-surface-secondary text-text-muted px-2 py-0.5 rounded border border-border/80">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface-secondary/30 text-[11px] font-mono text-text-muted">
          <span>Navigate with ↑ / ↓</span>
          <span>Press ↵ to select • ESC to exit</span>
        </div>
      </div>
    </div>
  );
};
