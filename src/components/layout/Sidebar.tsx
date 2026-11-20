import React from 'react';
import {
  Home,
  Bookmark,
  FolderGit2,
  Wrench,
  CheckSquare,
  BarChart2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useUIStore, ActiveView } from '@/store/useUIStore';
import { useLockStore } from '@/store/useLockStore';
import { cn } from '@/utils/cn';

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'productivity', label: 'Productivity', icon: CheckSquare },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, sidebarCollapsed, toggleSidebar, isOnline } = useUIStore();
  const lockEnabled = useLockStore((state) => state.config.enabled);
  const lockNow = useLockStore((state) => state.lockNow);

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between border-r border-border bg-surface/90 backdrop-blur-md transition-all duration-300 z-30 select-none min-h-screen',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header & Brand */}
      <div className="p-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {/* Red ZH Badge */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-[#99001A] flex items-center justify-center font-heading font-black text-white text-lg tracking-tight shadow-md shadow-primary/25 group-hover:scale-105 transition-transform shrink-0">
              ZH
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden transition-all duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-bold text-lg text-text-primary tracking-tight">
                    Labs
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-primary/20 text-primary-light px-1.5 py-0.5 rounded">
                    OS
                  </span>
                </div>
                <p className="text-[11px] text-text-muted font-mono tracking-wider">
                  Build • Automate • Grow
                </p>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          {!sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              title="Collapse sidebar"
              className="p-1.5 rounded-sm-card text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm-card text-sm font-medium transition-all group relative',
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-primary/5 text-white border-l-2 border-primary shadow-sm shadow-primary/10 font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'
                )}
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-surface-secondary border border-border text-xs rounded-sm-card text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-elevated z-50">
                  {item.label}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-border/60 space-y-2">
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            {lockEnabled && (
              <button
                onClick={() => void lockNow('manual')}
                title="Lock browser"
                aria-label="Lock browser"
                className="p-2 rounded-sm-card text-primary/80 hover:text-primary hover:bg-primary/10 transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={toggleSidebar}
              title="Expand sidebar"
              className="p-2 rounded-sm-card text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              )}
              title={isOnline ? 'Online' : 'Offline'}
            />
          </div>
        ) : (
          <>
            {lockEnabled && (
              <button
                onClick={() => void lockNow('manual')}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-sm-card border border-border bg-surface-secondary/60 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-primary/40 transition-colors group"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  Lock Browser
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                  Secure
                </span>
              </button>
            )}
            <div className="bg-surface-secondary/50 rounded-sm-card p-2.5 border border-border/60">
              <div className="flex items-center justify-between text-xs text-text-muted font-mono mb-1.5">
                <span>v1.0.0</span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-text-muted">
                <span>Extension Mode</span>
                <span className="text-primary font-mono font-medium">MV3 Active</span>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
