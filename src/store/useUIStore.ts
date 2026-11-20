import { create } from 'zustand';
import { WorkspaceMode } from '@/types/workspace';
import { StorageAdapter } from '@/services/storage';

export type ActiveView = 'home' | 'bookmarks' | 'projects' | 'tools' | 'productivity' | 'analytics' | 'settings';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

interface UIState {
  activeView: ActiveView;
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  profileModalOpen: boolean;
  themeModalOpen: boolean;
  themePickerPopoverOpen: boolean;
  notificationsDrawerOpen: boolean;
  quickToolsDrawerOpen: boolean;
  selectedToolId: string | null;
  activeWorkspace: WorkspaceMode;
  notifications: AppNotification[];
  isOnline: boolean;

  // Actions
  setActiveView: (view: ActiveView) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setThemeModalOpen: (open: boolean) => void;
  setThemePickerPopoverOpen: (open: boolean) => void;
  setNotificationsDrawerOpen: (open: boolean) => void;
  setQuickToolsDrawerOpen: (open: boolean, toolId?: string) => void;
  setActiveWorkspace: (mode: WorkspaceMode) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  setIsOnline: (online: boolean) => void;
  initUI: () => Promise<void>;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-1',
    title: 'DeshVox Deployment',
    message: 'Production health check passed with sub-100ms API response time.',
    time: '10m ago',
    type: 'success',
    read: false,
  },
  {
    id: 'n-2',
    title: 'Fiverr Client Inquiry',
    message: 'New order discussion from Apex Media Group regarding Fal.ai integration.',
    time: '45m ago',
    type: 'info',
    read: false,
  },
  {
    id: 'n-3',
    title: 'System Ready',
    message: 'ZH Labs Command Center is operating in local-first secure mode.',
    time: '2h ago',
    type: 'info',
    read: false,
  },
];

export const useUIStore = create<UIState>((set) => ({
  activeView: 'home',
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  profileModalOpen: false,
  themeModalOpen: false,
  themePickerPopoverOpen: false,
  notificationsDrawerOpen: false,
  quickToolsDrawerOpen: false,
  selectedToolId: null,
  activeWorkspace: 'engineering',
  notifications: DEFAULT_NOTIFICATIONS,
  isOnline: navigator.onLine,

  setActiveView: (view) => set({ activeView: view }),
  
  toggleSidebar: () =>
    set((state) => {
      const next = !state.sidebarCollapsed;
      StorageAdapter.set('sidebar_collapsed', next);
      return { sidebarCollapsed: next };
    }),

  setSidebarCollapsed: (collapsed) => {
    StorageAdapter.set('sidebar_collapsed', collapsed);
    set({ sidebarCollapsed: collapsed });
  },

  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setProfileModalOpen: (open) => set({ profileModalOpen: open }),
  setThemeModalOpen: (open) => set({ themeModalOpen: open }),
  setThemePickerPopoverOpen: (open) => set({ themePickerPopoverOpen: open }),
  setNotificationsDrawerOpen: (open) => set({ notificationsDrawerOpen: open }),
  
  setQuickToolsDrawerOpen: (open, toolId) =>
    set({ quickToolsDrawerOpen: open, selectedToolId: toolId || null }),

  setActiveWorkspace: (mode) => {
    StorageAdapter.set('active_workspace', mode);
    set({ activeWorkspace: mode });
  },

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearNotifications: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  setIsOnline: (online) => set({ isOnline: online }),

  initUI: async () => {
    const savedCollapsed = await StorageAdapter.get('sidebar_collapsed', false);
    const savedWorkspace = await StorageAdapter.get<WorkspaceMode>('active_workspace', 'engineering');
    set({ sidebarCollapsed: savedCollapsed, activeWorkspace: savedWorkspace });
  },
}));
