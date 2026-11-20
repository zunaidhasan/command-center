import React, { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';
import { BackgroundLayer } from '@/components/layout/BackgroundLayer';
import { CommandPalette } from '@/components/search/CommandPalette';
import { useUIStore } from '@/store/useUIStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useProductivityStore } from '@/store/useProductivityStore';
import { useClientOpsStore } from '@/store/useClientOpsStore';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';

// Views
import { HomeView } from '@/components/views/HomeView';
import { BookmarksView } from '@/components/views/BookmarksView';
import { ProjectsView } from '@/components/views/ProjectsView';
import { ToolsView } from '@/components/views/ToolsView';
import { ProductivityView } from '@/components/views/ProductivityView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { SettingsView } from '@/components/views/SettingsView';

export const AppLayout: React.FC = () => {
  const { activeView, initUI } = useUIStore();
  const { initTheme } = useThemeStore();
  const { initProfile } = useProfileStore();
  const { initBookmarks } = useBookmarkStore();
  const { initProjects } = useProjectStore();
  const { initProductivity } = useProductivityStore();
  const { initClientOps } = useClientOpsStore();
  const { initAnalytics } = useAnalyticsStore();

  useEffect(() => {
    // Initialize all stores
    initUI();
    initTheme();
    initProfile();
    initBookmarks();
    initProjects();
    initProductivity();
    initClientOps();
    initAnalytics();
    useDashboardConfigStore.getState().initDashboardConfig();

    // Listen to online/offline changes
    const handleOnline = () => useUIStore.getState().setIsOnline(true);
    const handleOffline = () => useUIStore.getState().setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomeView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'projects':
        return <ProjectsView />;
      case 'tools':
        return <ToolsView />;
      case 'productivity':
        return <ProductivityView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-text-primary flex overflow-x-hidden font-sans">
      {/* Background Graphic Layer */}
      <BackgroundLayer />

      {/* Global Universal Command Palette */}
      <CommandPalette />

      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 overflow-y-auto min-h-screen">
        <TopNav />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};
