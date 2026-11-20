import { create } from 'zustand';
import {
  DashboardWidget,
  WidgetType,
  WidgetColSpan,
  CustomWorkspace,
  DashboardProfile,
  PresetProfileId,
  AppearanceConfig,
  DashboardCardConfig,
  KPICardConfig,
  BottomWidgetConfig,
  WorkspacePreset,
  UtilityStripPosition,
  DashboardBackupData,
} from '@/types/dashboard';
import { StorageAdapter } from '@/services/storage';
import { WIDGET_REGISTRY } from '@/services/widget-registry';

const STORAGE_KEY = 'dashboard_layout_config';
const PROFILES_KEY = 'dashboard_profiles_config';

// 1. Initial Default Ordered Widgets according to the requested hierarchy:
// Hierarchy:
// 1. Header & search (in layout)
// 2. Large digital clock and date (Clock widget)
// 3. Workspace selector (Customizer bar)
// 4. Focus / productivity widgets
// 5. Metric cards
// Default widgets layout in 12-column grid system
// Top Utility Section: Clock (3c) + Quote (3c) + System Status (3c) + Quick Links (3c)
// Followed by Focus Mission, Metric Cards Row, and the 4 Hubs
export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  {
    id: 'widget-clock',
    type: 'clock',
    title: 'Digital Clock & Date',
    visible: true,
    order: 0,
    colSpan: 3,
    settings: {
      mode: 'minimal',
      format: '12h',
      showSeconds: true,
      showTimezone: true,
      timezone: 'Asia/Dhaka',
      showWorldClocks: true,
      worldClocks: [
        { city: 'London', timezone: 'Europe/London' },
        { city: 'New York', timezone: 'America/New_York' },
        { city: 'Tokyo', timezone: 'Asia/Tokyo' },
      ],
      showWeather: true,
      weatherTemp: '28°C',
      weatherCondition: 'Clear Sky',
    },
  },
  {
    id: 'widget-quote',
    type: 'quote',
    title: 'Daily Inspiration Quote',
    visible: true,
    order: 1,
    colSpan: 3,
  },
  {
    id: 'widget-system',
    type: 'system-status',
    title: 'System Status',
    visible: true,
    order: 2,
    colSpan: 3,
  },
  {
    id: 'widget-quick-links',
    type: 'quick-links',
    title: 'Quick Links',
    visible: true,
    order: 3,
    colSpan: 3,
  },
  {
    id: 'widget-productivity',
    type: 'productivity-focus',
    title: 'Focus Mission & Quickpad',
    visible: true,
    order: 4,
    colSpan: 12,
    settings: { defaultTab: 'tasks' },
  },
  {
    id: 'widget-metrics',
    type: 'metrics',
    title: 'Overview Metric Cards',
    visible: true,
    order: 5,
    colSpan: 12,
  },
  {
    id: 'widget-hub-personal',
    type: 'hub-personal',
    title: 'Personal & Quick-Research Hub',
    visible: true,
    order: 6,
    colSpan: 6,
    settings: {
      folderIds: ['folder-5'],
      accentColor: '#FFB21A',
      sideWidget: 'todo-notes',
    },
  },
  {
    id: 'widget-hub-engineering',
    type: 'hub-engineering',
    title: 'AI & Engineering Hub',
    visible: true,
    order: 7,
    colSpan: 6,
    settings: {
      folderIds: ['folder-1', 'folder-2'],
      accentColor: '#1EA7FF',
      sideWidget: 'none',
    },
  },
  {
    id: 'widget-hub-creative',
    type: 'hub-creative',
    title: 'UI/UX & Design Sandbox',
    visible: true,
    order: 8,
    colSpan: 6,
    settings: {
      folderIds: ['folder-4'],
      accentColor: '#B66BFF',
      sideWidget: 'quick-tools',
    },
  },
  {
    id: 'widget-hub-client-ops',
    type: 'hub-client-ops',
    title: 'Client Operations & Sales',
    visible: true,
    order: 9,
    colSpan: 6,
    settings: {
      folderIds: ['folder-3'],
      accentColor: '#18D879',
      sideWidget: 'quick-stats',
    },
  },
];

// Predefined Workspaces with independent layouts
export const INITIAL_WORKSPACES: CustomWorkspace[] = [
  {
    id: 'default',
    name: 'Default Balanced',
    description: 'Clean full hierarchy with Top Clock & Utility strip, Focus, KPIs, & 4 Hubs',
    icon: 'LayoutGrid',
    accentColor: '#EF233C',
    isCustom: false,
    isDefault: true,
    widgets: DEFAULT_DASHBOARD_WIDGETS,
  },
  {
    id: 'engineering',
    name: 'Engineering & AI',
    description: 'Full-width AI research agents, coding tools, terminal stats, and deployments',
    icon: 'Code2',
    accentColor: '#1EA7FF',
    isCustom: false,
    isDefault: false,
    widgets: [
      DEFAULT_DASHBOARD_WIDGETS[0], // Clock
      DEFAULT_DASHBOARD_WIDGETS[1], // Quote
      DEFAULT_DASHBOARD_WIDGETS[2], // System
      DEFAULT_DASHBOARD_WIDGETS[3], // Quick Links
      { ...DEFAULT_DASHBOARD_WIDGETS[7], colSpan: 12 }, // Engineering Hub (full width)
      DEFAULT_DASHBOARD_WIDGETS[5], // Metrics
      DEFAULT_DASHBOARD_WIDGETS[4], // Focus
      DEFAULT_DASHBOARD_WIDGETS[6], // Personal
      DEFAULT_DASHBOARD_WIDGETS[8], // Creative
      DEFAULT_DASHBOARD_WIDGETS[9], // Client Ops
    ],
  },
  {
    id: 'client-ops',
    name: 'Client & Agency',
    description: 'Prioritizes sales pipeline, client communications, contracts, and revenue',
    icon: 'Briefcase',
    accentColor: '#18D879',
    isCustom: false,
    isDefault: false,
    widgets: [
      DEFAULT_DASHBOARD_WIDGETS[0], // Clock
      DEFAULT_DASHBOARD_WIDGETS[1], // Quote
      DEFAULT_DASHBOARD_WIDGETS[2], // System
      DEFAULT_DASHBOARD_WIDGETS[3], // Quick Links
      { ...DEFAULT_DASHBOARD_WIDGETS[9], colSpan: 12 }, // Client Ops (full width)
      DEFAULT_DASHBOARD_WIDGETS[5], // Metrics
      DEFAULT_DASHBOARD_WIDGETS[7], // Engineering
      DEFAULT_DASHBOARD_WIDGETS[6], // Personal
      DEFAULT_DASHBOARD_WIDGETS[8], // Creative
    ],
  },
  {
    id: 'creative',
    name: 'Creative Sandbox',
    description: 'UI/UX Design sandbox, Figma shortcuts, color tools, and visual AI',
    icon: 'Palette',
    accentColor: '#B66BFF',
    isCustom: false,
    isDefault: false,
    widgets: [
      DEFAULT_DASHBOARD_WIDGETS[0], // Clock
      DEFAULT_DASHBOARD_WIDGETS[1], // Quote
      DEFAULT_DASHBOARD_WIDGETS[2], // System
      DEFAULT_DASHBOARD_WIDGETS[3], // Quick Links
      { ...DEFAULT_DASHBOARD_WIDGETS[8], colSpan: 12 }, // Creative Sandbox (full width)
      DEFAULT_DASHBOARD_WIDGETS[5], // Metrics
      DEFAULT_DASHBOARD_WIDGETS[7], // Engineering
      DEFAULT_DASHBOARD_WIDGETS[6], // Personal
      DEFAULT_DASHBOARD_WIDGETS[9], // Client Ops
    ],
  },
  {
    id: 'personal',
    name: 'Personal & Notes',
    description: 'Deep focus, personal scratchpad, interactive task checklist, and learning',
    icon: 'Bookmark',
    accentColor: '#FFB21A',
    isCustom: false,
    isDefault: false,
    widgets: [
      DEFAULT_DASHBOARD_WIDGETS[0], // Clock
      DEFAULT_DASHBOARD_WIDGETS[1], // Quote
      DEFAULT_DASHBOARD_WIDGETS[2], // System
      DEFAULT_DASHBOARD_WIDGETS[3], // Quick Links
      { ...DEFAULT_DASHBOARD_WIDGETS[6], colSpan: 12 }, // Personal Hub (full width)
      DEFAULT_DASHBOARD_WIDGETS[4], // Focus & Notes
      DEFAULT_DASHBOARD_WIDGETS[5], // Metrics
      DEFAULT_DASHBOARD_WIDGETS[7], // Engineering
      DEFAULT_DASHBOARD_WIDGETS[8], // Creative
      DEFAULT_DASHBOARD_WIDGETS[9], // Client Ops
    ],
  },
];

// Predefined Profiles
export const PRESET_PROFILES: DashboardProfile[] = [
  {
    id: 'default',
    name: 'Default Complete',
    description: 'Full modular dashboard with all 10 tiers and balanced components',
    isDefault: true,
    isPreset: true,
    workspaces: INITIAL_WORKSPACES,
    activeWorkspaceId: 'default',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'minimal',
    name: 'Minimal Focus',
    description: 'Distraction-free setup with Clock, Universal Search, and Quick Links only',
    isPreset: true,
    workspaces: [
      {
        ...INITIAL_WORKSPACES[0],
        id: 'default',
        widgets: [
          DEFAULT_DASHBOARD_WIDGETS[0], // Clock
          DEFAULT_DASHBOARD_WIDGETS[3], // Quick Links
          DEFAULT_DASHBOARD_WIDGETS[1], // Quote
        ],
      },
    ],
    activeWorkspaceId: 'default',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'developer',
    name: 'Developer Power-User',
    description: 'AI & Engineering Hub full width, system status, dev tools & live deployments',
    isPreset: true,
    workspaces: [INITIAL_WORKSPACES[1]],
    activeWorkspaceId: 'engineering',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'client-operations',
    name: 'Agency & Revenue',
    description: 'Client leads, revenue metrics, growth chart, and proposal contexts',
    isPreset: true,
    workspaces: [INITIAL_WORKSPACES[2]],
    activeWorkspaceId: 'client-ops',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

// Backward-compatibility initial states
export const DEFAULT_CARDS: DashboardCardConfig[] = [
  {
    id: 'card-engineering',
    title: 'AI & Engineering Hub',
    zone: 'engineering',
    folderIds: ['folder-1', 'folder-2'],
    accentColor: '#1EA7FF',
    icon: 'Code2',
    sideWidget: 'none',
    colSpan: 1,
    visible: true,
    order: 0,
  },
  {
    id: 'card-client-ops',
    title: 'Client Operations & Sales',
    zone: 'client-ops',
    folderIds: ['folder-3'],
    accentColor: '#18D879',
    icon: 'Briefcase',
    sideWidget: 'quick-stats',
    colSpan: 1,
    visible: true,
    order: 1,
  },
  {
    id: 'card-creative',
    title: 'UI/UX & Design Sandbox',
    zone: 'creative',
    folderIds: ['folder-4'],
    accentColor: '#B66BFF',
    icon: 'Palette',
    sideWidget: 'quick-tools',
    colSpan: 1,
    visible: true,
    order: 2,
  },
  {
    id: 'card-personal',
    title: 'Personal & Quick-Research',
    zone: 'personal',
    folderIds: ['folder-5'],
    accentColor: '#FFB21A',
    icon: 'Bookmark',
    sideWidget: 'todo-notes',
    colSpan: 1,
    visible: true,
    order: 3,
  },
];

export const DEFAULT_KPIS: KPICardConfig[] = [
  {
    id: 'kpi-1',
    label: 'DeshVox Deployments',
    value: '4/4 Prod',
    icon: 'rocket',
    color: 'red',
    badge: 'Live',
    subtext: '100% operational',
    dataMode: 'manual',
    computedSource: 'projects-count',
    visible: true,
    order: 0,
  },
  {
    id: 'kpi-2',
    label: 'Sardar IT Contracts',
    value: '12 Active',
    icon: 'shield',
    color: 'green',
    badge: '+3 New',
    subtext: '4 in review pipeline',
    dataMode: 'manual',
    visible: true,
    order: 1,
  },
  {
    id: 'kpi-3',
    label: 'Monthly Revenue / ARR',
    value: '$8.4k',
    icon: 'dollar',
    color: 'amber',
    badge: '+24%',
    subtext: 'Trailing 30-day billing',
    dataMode: 'manual',
    visible: true,
    order: 2,
  },
  {
    id: 'kpi-4',
    label: 'Deep Focus Logged',
    value: '38.5 hrs',
    icon: 'clock',
    color: 'blue',
    badge: 'Top 5%',
    subtext: 'Ahead of weekly goal',
    dataMode: 'manual',
    computedSource: 'focus-hours',
    visible: true,
    order: 3,
  },
];

export const DEFAULT_BOTTOM_WIDGETS: BottomWidgetConfig[] = [
  { id: 'clock', title: 'Digital Clock', visible: true, order: 0 },
  { id: 'quote', title: 'Daily Inspiration Quote', visible: true, order: 1 },
  { id: 'system', title: 'System Status Diagnostic', visible: true, order: 2 },
  { id: 'quick-links', title: 'Quick Links Strip', visible: true, order: 3 },
];

export const WORKSPACE_PRESETS = {
  default: {
    id: 'default' as const,
    name: 'Default Balanced',
    description: 'Clean 2x2 grid with 4 hubs and balanced side widgets',
    accentColor: '#EF233C',
    icon: 'LayoutGrid',
    cards: DEFAULT_CARDS,
    kpis: DEFAULT_KPIS,
    bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
  },
  engineering: {
    id: 'engineering' as const,
    name: 'Engineering & AI',
    description: 'Full-width AI & Coding Hub at top with Quick Tools and server stats',
    accentColor: '#1EA7FF',
    icon: 'Code2',
    cards: DEFAULT_CARDS,
    kpis: DEFAULT_KPIS,
    bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
  },
  'client-ops': {
    id: 'client-ops' as const,
    name: 'Client & Agency',
    description: 'Prioritizes sales pipeline, revenue KPI, contracts and agency tools',
    accentColor: '#18D879',
    icon: 'Briefcase',
    cards: DEFAULT_CARDS,
    kpis: DEFAULT_KPIS,
    bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
  },
  creative: {
    id: 'creative' as const,
    name: 'Creative Sandbox',
    description: 'Expands UI/UX Design Hub to full width with embedded design utilities',
    accentColor: '#B66BFF',
    icon: 'Palette',
    cards: DEFAULT_CARDS,
    kpis: DEFAULT_KPIS,
    bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
  },
  personal: {
    id: 'personal' as const,
    name: 'Personal & Focus',
    description: 'Interactive notes & todo at center stage with productivity metrics',
    accentColor: '#FFB21A',
    icon: 'Bookmark',
    cards: DEFAULT_CARDS,
    kpis: DEFAULT_KPIS,
    bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
  },
};

interface DashboardStoreState {
  version: number;
  isEditMode: boolean;
  hasUnsavedChanges: boolean;

  // Profiles & Workspaces
  profiles: DashboardProfile[];
  activeProfileId: string;
  workspaces: CustomWorkspace[];
  activeWorkspaceId: string;

  // Active Workspace Live Widgets
  widgets: DashboardWidget[];
  draftWidgets: DashboardWidget[];

  // Backward-compatibility properties
  activePreset: WorkspacePreset;
  cards: DashboardCardConfig[];
  kpis: KPICardConfig[];
  bottomWidgets: BottomWidgetConfig[];
  utilityStripPosition: UtilityStripPosition;
  isLoading: boolean;

  // Initialize
  initDashboardConfig: () => Promise<void>;

  // Editor Actions
  setIsEditMode: (editing: boolean) => void;
  toggleEditMode: () => void;
  saveChanges: () => Promise<void>;
  cancelChanges: () => void;
  resetToDefault: () => Promise<void>;

  // Widget Actions
  reorderWidgets: (fromIndex: number, toIndex: number) => void;
  setWidgetColSpan: (widgetId: string, colSpan: WidgetColSpan) => void;
  toggleWidgetVisibility: (widgetId: string) => void;
  addWidget: (type: WidgetType, customTitle?: string, initialColSpan?: WidgetColSpan) => void;
  removeWidget: (widgetId: string) => void;
  duplicateWidget: (widgetId: string) => void;
  updateWidgetSettings: (widgetId: string, settings: Record<string, any>) => void;

  // Workspace Actions
  setActiveWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string, description?: string, icon?: string, accentColor?: string) => Promise<string>;
  updateWorkspace: (workspaceId: string, updates: Partial<CustomWorkspace>) => Promise<void>;
  duplicateWorkspace: (workspaceId: string) => Promise<string>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;

  // Profile Actions
  setActiveProfile: (profileId: string) => Promise<void>;
  createProfile: (name: string, description?: string) => Promise<string>;
  duplicateProfile: (profileId: string) => Promise<string>;
  deleteProfile: (profileId: string) => Promise<void>;

  // Backward-compatibility controls
  setPreset: (presetId: WorkspacePreset) => Promise<void>;
  setUtilityStripPosition: (pos: UtilityStripPosition) => Promise<void>;
  moveCard: (cardId: string, direction: 'up' | 'down') => Promise<void>;
  toggleCardVisibility: (cardId: string) => Promise<void>;
  setCardColSpan: (cardId: string, colSpan: any) => Promise<void>;
  setCardSideWidget: (cardId: string, sideWidget: any) => Promise<void>;
  updateCardConfig: (cardId: string, updates: any) => Promise<void>;
  moveKPI: (kpiId: string, direction: 'left' | 'right') => Promise<void>;
  toggleKPIVisibility: (kpiId: string) => Promise<void>;
  updateKPI: (kpiId: string, updates: any) => Promise<void>;
  addKPI: (kpi: any) => Promise<any>;
  deleteKPI: (kpiId: string) => Promise<void>;
  moveBottomWidget: (id: string, direction: 'left' | 'right') => Promise<void>;
  toggleBottomWidgetVisibility: (id: string) => Promise<void>;

  // Export / Import
  exportConfig: () => any;
  importConfig: (data: any) => Promise<{ success: boolean; error?: string }>;
}

export const useDashboardConfigStore = create<DashboardStoreState>((set, get) => ({
  version: 2,
  isEditMode: false,
  hasUnsavedChanges: false,

  profiles: PRESET_PROFILES,
  activeProfileId: 'default',
  workspaces: INITIAL_WORKSPACES,
  activeWorkspaceId: 'default',

  widgets: DEFAULT_DASHBOARD_WIDGETS,
  draftWidgets: DEFAULT_DASHBOARD_WIDGETS,

  activePreset: 'default',
  cards: DEFAULT_CARDS,
  kpis: DEFAULT_KPIS,
  bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
  utilityStripPosition: 'top',
  isLoading: true,

  initDashboardConfig: async () => {
    try {
      const savedConfig = await StorageAdapter.get<any>(STORAGE_KEY, null);
      if (savedConfig && Array.isArray(savedConfig.widgets)) {
        const activeWsId = savedConfig.activeWorkspaceId || 'default';
        const savedWorkspaces = Array.isArray(savedConfig.workspaces) && savedConfig.workspaces.length > 0
          ? savedConfig.workspaces
          : INITIAL_WORKSPACES;

        const currentWs = savedWorkspaces.find((w: CustomWorkspace) => w.id === activeWsId) || savedWorkspaces[0];

        set({
          widgets: currentWs.widgets || savedConfig.widgets || DEFAULT_DASHBOARD_WIDGETS,
          draftWidgets: currentWs.widgets || savedConfig.widgets || DEFAULT_DASHBOARD_WIDGETS,
          workspaces: savedWorkspaces,
          activeWorkspaceId: currentWs.id,
          activeProfileId: savedConfig.activeProfileId || 'default',
          utilityStripPosition: savedConfig.utilityStripPosition || 'top',
          cards: savedConfig.cards || DEFAULT_CARDS,
          kpis: savedConfig.kpis || DEFAULT_KPIS,
          bottomWidgets: savedConfig.bottomWidgets || DEFAULT_BOTTOM_WIDGETS,
          isLoading: false,
        });
      } else {
        set({
          widgets: DEFAULT_DASHBOARD_WIDGETS,
          draftWidgets: DEFAULT_DASHBOARD_WIDGETS,
          workspaces: INITIAL_WORKSPACES,
          activeWorkspaceId: 'default',
          isLoading: false,
        });
      }
    } catch (err) {
      console.error('[DashboardStore] Init error:', err);
      set({
        widgets: DEFAULT_DASHBOARD_WIDGETS,
        draftWidgets: DEFAULT_DASHBOARD_WIDGETS,
        isLoading: false,
      });
    }
  },

  setIsEditMode: (editing) => {
    const widgets = get().widgets;
    set({
      isEditMode: editing,
      draftWidgets: editing ? [...widgets] : widgets,
      hasUnsavedChanges: false,
    });
  },

  toggleEditMode: () => {
    const isEditing = !get().isEditMode;
    const widgets = get().widgets;
    set({
      isEditMode: isEditing,
      draftWidgets: isEditing ? [...widgets] : widgets,
      hasUnsavedChanges: false,
    });
  },

  saveChanges: async () => {
    const draft = get().draftWidgets;
    const activeWsId = get().activeWorkspaceId;
    const updatedWorkspaces = get().workspaces.map((w) =>
      w.id === activeWsId ? { ...w, widgets: draft } : w
    );

    set({
      widgets: draft,
      workspaces: updatedWorkspaces,
      isEditMode: false,
      hasUnsavedChanges: false,
    });

    await StorageAdapter.set(STORAGE_KEY, {
      version: 2,
      activeWorkspaceId: activeWsId,
      activeProfileId: get().activeProfileId,
      workspaces: updatedWorkspaces,
      widgets: draft,
      utilityStripPosition: get().utilityStripPosition,
      cards: get().cards,
      kpis: get().kpis,
      bottomWidgets: get().bottomWidgets,
    });
  },

  cancelChanges: () => {
    set({
      draftWidgets: [...get().widgets],
      isEditMode: false,
      hasUnsavedChanges: false,
    });
  },

  resetToDefault: async () => {
    set({
      widgets: DEFAULT_DASHBOARD_WIDGETS,
      draftWidgets: DEFAULT_DASHBOARD_WIDGETS,
      workspaces: INITIAL_WORKSPACES,
      activeWorkspaceId: 'default',
      cards: DEFAULT_CARDS,
      kpis: DEFAULT_KPIS,
      bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
      utilityStripPosition: 'top',
      hasUnsavedChanges: false,
    });

    await StorageAdapter.set(STORAGE_KEY, {
      version: 2,
      activeWorkspaceId: 'default',
      activeProfileId: 'default',
      workspaces: INITIAL_WORKSPACES,
      widgets: DEFAULT_DASHBOARD_WIDGETS,
      utilityStripPosition: 'top',
      cards: DEFAULT_CARDS,
      kpis: DEFAULT_KPIS,
      bottomWidgets: DEFAULT_BOTTOM_WIDGETS,
    });
  },

  reorderWidgets: (fromIndex, toIndex) => {
    const list = [...get().draftWidgets];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(toIndex, 0, moved);
    const reindexed = list.map((w, idx) => ({ ...w, order: idx }));
    set({ draftWidgets: reindexed, hasUnsavedChanges: true });
  },

  setWidgetColSpan: (widgetId, colSpan) => {
    const updated = get().draftWidgets.map((w) =>
      w.id === widgetId ? { ...w, colSpan } : w
    );
    set({ draftWidgets: updated, hasUnsavedChanges: true });
  },

  toggleWidgetVisibility: (widgetId) => {
    const updated = get().draftWidgets.map((w) =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    );
    set({ draftWidgets: updated, hasUnsavedChanges: true });
  },

  addWidget: (type, customTitle, initialColSpan) => {
    const regItem = WIDGET_REGISTRY[type];
    const newWidget: DashboardWidget = {
      id: `widget-${type}-${Date.now()}`,
      type,
      title: customTitle || regItem?.name || 'Custom Widget',
      visible: true,
      order: get().draftWidgets.length,
      colSpan: initialColSpan || regItem?.defaultColSpan || 6,
      settings: regItem?.defaultSettings ? { ...regItem.defaultSettings } : {},
    };
    const updated = [...get().draftWidgets, newWidget];
    set({ draftWidgets: updated, hasUnsavedChanges: true });
  },

  removeWidget: (widgetId) => {
    const updated = get().draftWidgets.filter((w) => w.id !== widgetId);
    set({ draftWidgets: updated, hasUnsavedChanges: true });
  },

  duplicateWidget: (widgetId) => {
    const original = get().draftWidgets.find((w) => w.id === widgetId);
    if (!original) return;
    const duplicated: DashboardWidget = {
      ...original,
      id: `widget-${original.type}-${Date.now()}`,
      title: `${original.title} (Copy)`,
      order: original.order + 1,
    };
    const updated = [...get().draftWidgets, duplicated];
    set({ draftWidgets: updated, hasUnsavedChanges: true });
  },

  updateWidgetSettings: (widgetId, settings) => {
    const updated = get().draftWidgets.map((w) =>
      w.id === widgetId ? { ...w, settings: { ...w.settings, ...settings } } : w
    );
    set({ draftWidgets: updated, hasUnsavedChanges: true });
  },

  setActiveWorkspace: async (workspaceId) => {
    const ws = get().workspaces.find((w) => w.id === workspaceId);
    if (!ws) return;
    set({
      activeWorkspaceId: workspaceId,
      widgets: ws.widgets,
      draftWidgets: ws.widgets,
      activePreset: (workspaceId as WorkspacePreset) || 'default',
    });
    await StorageAdapter.set(STORAGE_KEY, {
      ...get(),
      activeWorkspaceId: workspaceId,
      widgets: ws.widgets,
    });
  },

  createWorkspace: async (name, description, icon, accentColor) => {
    const newId = `ws-${Date.now()}`;
    const newWs: CustomWorkspace = {
      id: newId,
      name,
      description: description || 'Custom developer workspace',
      icon: icon || 'LayoutGrid',
      accentColor: accentColor || '#1EA7FF',
      isCustom: true,
      isDefault: false,
      widgets: DEFAULT_DASHBOARD_WIDGETS,
    };
    const updated = [...get().workspaces, newWs];
    set({ workspaces: updated, activeWorkspaceId: newId, widgets: newWs.widgets, draftWidgets: newWs.widgets });
    await StorageAdapter.set(STORAGE_KEY, { ...get(), workspaces: updated, activeWorkspaceId: newId });
    return newId;
  },

  updateWorkspace: async (workspaceId, updates) => {
    const updated = get().workspaces.map((w) =>
      w.id === workspaceId ? { ...w, ...updates } : w
    );
    set({ workspaces: updated });
    await StorageAdapter.set(STORAGE_KEY, { ...get(), workspaces: updated });
  },

  duplicateWorkspace: async (workspaceId) => {
    const original = get().workspaces.find((w) => w.id === workspaceId);
    if (!original) return workspaceId;
    const newId = `ws-${Date.now()}`;
    const copy: CustomWorkspace = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      isCustom: true,
      isDefault: false,
    };
    const updated = [...get().workspaces, copy];
    set({ workspaces: updated, activeWorkspaceId: newId, widgets: copy.widgets, draftWidgets: copy.widgets });
    await StorageAdapter.set(STORAGE_KEY, { ...get(), workspaces: updated, activeWorkspaceId: newId });
    return newId;
  },

  deleteWorkspace: async (workspaceId) => {
    if (get().workspaces.length <= 1) return;
    const filtered = get().workspaces.filter((w) => w.id !== workspaceId);
    const nextActive = filtered[0].id;
    set({
      workspaces: filtered,
      activeWorkspaceId: nextActive,
      widgets: filtered[0].widgets,
      draftWidgets: filtered[0].widgets,
    });
    await StorageAdapter.set(STORAGE_KEY, { ...get(), workspaces: filtered, activeWorkspaceId: nextActive });
  },

  setActiveProfile: async (profileId) => {
    const profile = get().profiles.find((p) => p.id === profileId);
    if (!profile) return;
    set({
      activeProfileId: profileId,
      workspaces: profile.workspaces,
      activeWorkspaceId: profile.activeWorkspaceId,
      widgets: profile.workspaces[0]?.widgets || DEFAULT_DASHBOARD_WIDGETS,
      draftWidgets: profile.workspaces[0]?.widgets || DEFAULT_DASHBOARD_WIDGETS,
    });
    await StorageAdapter.set(PROFILES_KEY, { activeProfileId: profileId });
  },

  createProfile: async (name, description) => {
    const newId = `profile-${Date.now()}`;
    const newProf: DashboardProfile = {
      id: newId,
      name,
      description: description || 'Custom user dashboard profile',
      workspaces: get().workspaces,
      activeWorkspaceId: get().activeWorkspaceId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...get().profiles, newProf];
    set({ profiles: updated, activeProfileId: newId });
    return newId;
  },

  duplicateProfile: async (profileId) => {
    const original = get().profiles.find((p) => p.id === profileId);
    if (!original) return profileId;
    const newId = `profile-${Date.now()}`;
    const copy: DashboardProfile = {
      ...original,
      id: newId,
      name: `${original.name} (Copy)`,
      isPreset: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [...get().profiles, copy];
    set({ profiles: updated, activeProfileId: newId });
    return newId;
  },

  deleteProfile: async (profileId) => {
    if (get().profiles.length <= 1) return;
    const filtered = get().profiles.filter((p) => p.id !== profileId);
    set({ profiles: filtered, activeProfileId: filtered[0].id });
  },

  // Backward-compatibility wrappers
  setPreset: async (presetId) => {
    let updatedCards = [...get().cards];
    if (presetId === 'engineering') {
      updatedCards = updatedCards.map((c) => {
        if (c.id === 'card-engineering') return { ...c, colSpan: 2, sideWidget: 'quick-tools' };
        if (c.id === 'card-creative') return { ...c, colSpan: 1, sideWidget: 'none' };
        return c;
      });
    } else if (presetId === 'client-ops') {
      updatedCards = updatedCards.map((c) => {
        if (c.id === 'card-client-ops') return { ...c, colSpan: 2, sideWidget: 'quick-stats' };
        return c;
      });
    } else if (presetId === 'creative') {
      updatedCards = updatedCards.map((c) => {
        if (c.id === 'card-creative') return { ...c, colSpan: 2, sideWidget: 'quick-tools' };
        return c;
      });
    } else if (presetId === 'personal') {
      updatedCards = updatedCards.map((c) => {
        if (c.id === 'card-personal') return { ...c, colSpan: 2, sideWidget: 'todo-notes' };
        return c;
      });
    } else {
      updatedCards = DEFAULT_CARDS;
    }
    set({ activePreset: presetId, cards: updatedCards });
    await get().setActiveWorkspace(presetId);
  },
  setUtilityStripPosition: async (pos) => {
    set({ utilityStripPosition: pos });
    await StorageAdapter.set(STORAGE_KEY, { ...get(), utilityStripPosition: pos });
  },
  moveCard: async (cardId, direction) => {
    const current = [...get().cards].sort((a, b) => a.order - b.order);
    const index = current.findIndex((c) => c.id === cardId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const [moved] = current.splice(index, 1);
    current.splice(targetIndex, 0, moved);
    const reordered = current.map((c, idx) => ({ ...c, order: idx }));
    set({ cards: reordered });
  },
  toggleCardVisibility: async (cardId) => {
    const updated = get().cards.map((c) => (c.id === cardId ? { ...c, visible: !c.visible } : c));
    set({ cards: updated });
  },
  setCardColSpan: async (cardId, colSpan) => {
    const updated = get().cards.map((c) => (c.id === cardId ? { ...c, colSpan } : c));
    set({ cards: updated });
  },
  setCardSideWidget: async (cardId, sideWidget) => {
    const updated = get().cards.map((c) => (c.id === cardId ? { ...c, sideWidget } : c));
    set({ cards: updated });
  },
  updateCardConfig: async (cardId, updates) => {
    const updated = get().cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c));
    set({ cards: updated });
  },
  moveKPI: async (kpiId, direction) => {
    const current = [...get().kpis].sort((a, b) => a.order - b.order);
    const index = current.findIndex((k) => k.id === kpiId);
    if (index === -1) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const [moved] = current.splice(index, 1);
    current.splice(targetIndex, 0, moved);
    const reordered = current.map((k, idx) => ({ ...k, order: idx }));
    set({ kpis: reordered });
  },
  toggleKPIVisibility: async (kpiId) => {
    const updated = get().kpis.map((k) => (k.id === kpiId ? { ...k, visible: !k.visible } : k));
    set({ kpis: updated });
  },
  updateKPI: async (kpiId, updates) => {
    const updated = get().kpis.map((k) => (k.id === kpiId ? { ...k, ...updates } : k));
    set({ kpis: updated });
  },
  addKPI: async (kpi) => {
    const newKpi: KPICardConfig = { ...kpi, id: `kpi-${Date.now()}`, order: get().kpis.length };
    const updated = [...get().kpis, newKpi];
    set({ kpis: updated });
    return newKpi;
  },
  deleteKPI: async (kpiId) => {
    set({ kpis: get().kpis.filter((k) => k.id !== kpiId) });
  },
  moveBottomWidget: async (id, direction) => {
    const current = [...get().bottomWidgets].sort((a, b) => a.order - b.order);
    const index = current.findIndex((b) => b.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;
    const [moved] = current.splice(index, 1);
    current.splice(targetIndex, 0, moved);
    set({ bottomWidgets: current.map((b, idx) => ({ ...b, order: idx })) });
  },
  toggleBottomWidgetVisibility: async (id) => {
    set({
      bottomWidgets: get().bottomWidgets.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
    });
  },

  exportConfig: () => {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      appName: 'ZH Labs Command Center',
      activePreset: get().activePreset,
      activeWorkspaceId: get().activeWorkspaceId,
      activeProfileId: get().activeProfileId,
      workspaces: get().workspaces,
      widgets: get().widgets,
      profiles: get().profiles,
      cards: get().cards,
      kpis: get().kpis,
      bottomWidgets: get().bottomWidgets,
      utilityStripPosition: get().utilityStripPosition,
    };
  },

  importConfig: async (data) => {
    try {
      if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
        return { success: false, error: 'Invalid configuration: empty data payload' };
      }
      if (!Array.isArray(data.widgets) && !Array.isArray(data.cards)) {
        return { success: false, error: 'Invalid configuration: missing widgets or cards' };
      }
      set({
        widgets: Array.isArray(data.widgets) ? data.widgets : get().widgets,
        draftWidgets: Array.isArray(data.widgets) ? data.widgets : get().widgets,
        workspaces: Array.isArray(data.workspaces) ? data.workspaces : get().workspaces,
        activeWorkspaceId: data.activeWorkspaceId || get().activeWorkspaceId,
        utilityStripPosition: data.utilityStripPosition || 'top',
        cards: Array.isArray(data.cards) ? data.cards : get().cards,
        kpis: Array.isArray(data.kpis) ? data.kpis : get().kpis,
        bottomWidgets: Array.isArray(data.bottomWidgets) ? data.bottomWidgets : get().bottomWidgets,
        activePreset: data.activePreset || get().activePreset,
      });
      await StorageAdapter.set(STORAGE_KEY, { ...get() });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid configuration' };
    }
  },
}));
