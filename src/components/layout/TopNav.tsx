import React, { useState } from 'react';
import { Sun, Moon, Maximize, Minimize } from 'lucide-react';
import { GreetingSection } from '@/components/layout/GreetingSection';
import { UniversalSearch } from '@/components/search/UniversalSearch';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { NotificationsDrawer } from '@/components/layout/NotificationsDrawer';
import { QuickAddMenu } from '@/components/layout/QuickAddMenu';
import { BookmarkModal } from '@/components/bookmarks/BookmarkModal';
import { WorkspaceManagerModal } from '@/components/dashboard/WorkspaceManagerModal';
import { WidgetLibraryModal } from '@/components/dashboard/WidgetLibraryModal';
import { useThemeStore } from '@/store/useThemeStore';
import { useUIStore } from '@/store/useUIStore';
import { useProductivityStore } from '@/store/useProductivityStore';

export const TopNav: React.FC = () => {
  const { theme, setPreset } = useThemeStore();
  const { setActiveView } = useUIStore();
  const { addTask } = useProductivityStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [widgetLibraryOpen, setWidgetLibraryOpen] = useState(false);

  const toggleThemeMode = () => {
    if (theme.preset === 'light') {
      setPreset('midnight');
    } else {
      setPreset('light');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const handleQuickAddTask = async () => {
    const title = window.prompt('Enter new task:');
    if (title?.trim()) {
      await addTask({
        title: title.trim(),
        priority: 'medium',
        completed: false,
      });
    }
  };

  return (
    <>
      <header className="w-full pt-4 pb-2 px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 select-none z-20">
        {/* Left: Personalized Greeting */}
        <div className="shrink-0">
          <GreetingSection />
        </div>

        {/* Center: Universal Command Search */}
        <div className="w-full md:w-auto flex-1 max-w-xl mx-auto">
          <UniversalSearch />
        </div>

        {/* Right: Quick Controls, Quick Add & Profile */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          {/* Universal Quick Add */}
          <QuickAddMenu
            onAddBookmark={() => setBookmarkModalOpen(true)}
            onAddTask={handleQuickAddTask}
            onAddNote={() => setActiveView('productivity')}
            onAddProject={() => setActiveView('projects')}
            onAddWorkspace={() => setWorkspaceModalOpen(true)}
            onAddWidget={() => setWidgetLibraryOpen(true)}
          />

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleThemeMode}
            title={`Switch to ${theme.preset === 'light' ? 'Dark' : 'Light'} Mode`}
            className="p-2 rounded-sm-card text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            {theme.preset === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5 text-amber-400/90" />
            )}
          </button>

          {/* Notifications */}
          <NotificationsDrawer />

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-sm-card text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors hidden sm:inline-flex"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <ProfileDropdown />
        </div>
      </header>

      {/* Modals triggered from Quick Add */}
      {bookmarkModalOpen && (
        <BookmarkModal
          isOpen={bookmarkModalOpen}
          onClose={() => setBookmarkModalOpen(false)}
          defaultFolderId="folder-1"
        />
      )}

      {workspaceModalOpen && (
        <WorkspaceManagerModal
          isOpen={workspaceModalOpen}
          onClose={() => setWorkspaceModalOpen(false)}
        />
      )}

      {widgetLibraryOpen && (
        <WidgetLibraryModal
          isOpen={widgetLibraryOpen}
          onClose={() => setWidgetLibraryOpen(false)}
        />
      )}
    </>
  );
};
