// Centralized Dashboard & Widget Types

export type WidgetType =
  | 'clock'
  | 'metrics'
  | 'productivity-focus'
  | 'hub-personal'
  | 'hub-engineering'
  | 'hub-creative'
  | 'hub-client-ops'
  | 'quote'
  | 'system-status'
  | 'quick-links'
  | 'quick-stats'
  | 'quick-tools'
  | 'pomodoro'
  | 'world-clock'
  | 'weather'
  | 'calculator';

export type WidgetCategory =
  | 'productivity'
  | 'development'
  | 'client-ops'
  | 'utilities'
  | 'bookmarks';

export type WidgetColSpan = 3 | 4 | 6 | 8 | 9 | 12;

export interface ClockSettings {
  mode: 'minimal' | 'standard' | 'expanded';
  format: '12h' | '24h';
  showSeconds: boolean;
  showTimezone: boolean;
  timezone: string;
  showWorldClocks: boolean;
  worldClocks: { city: string; timezone: string }[];
  showWeather: boolean;
  weatherTemp: string;
  weatherCondition: string;
  size: 'sm' | 'md' | 'lg';
}

export interface HubWidgetSettings {
  folderIds: string[];
  accentColor: string;
  icon: string;
  displayMode: 'compact' | 'standard' | 'detailed';
  sideWidget: 'none' | 'quick-stats' | 'quick-tools' | 'todo-notes';
  maxItems?: number;
}

export interface GenericWidgetSettings {
  [key: string]: any;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  visible: boolean;
  order: number;
  colSpan: WidgetColSpan;
  sectionId?: string;
  settings?: GenericWidgetSettings;
}

export interface DashboardSection {
  id: string;
  title: string;
  icon: string;
  accentColor: string;
  collapsed: boolean;
  visible: boolean;
  order: number;
  widgetIds: string[];
}

export interface CustomWorkspace {
  id: string;
  name: string;
  description: string;
  icon: string;
  accentColor: string;
  isCustom: boolean;
  isDefault: boolean;
  widgets: DashboardWidget[];
  sections?: DashboardSection[];
  themePreset?: string;
  displayPreferences?: Record<string, any>;
}

export type PresetProfileId =
  | 'default'
  | 'minimal'
  | 'compact'
  | 'balanced'
  | 'deep-work'
  | 'developer'
  | 'client-operations'
  | 'analytics';

export interface DashboardProfile {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  isPreset?: boolean;
  workspaces: CustomWorkspace[];
  activeWorkspaceId: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppearanceConfig {
  preset: string;
  accentColor: string;
  customBgColor?: string;
  wallpaperPreset: string;
  wallpaperOpacity: number;
  cardBlur: boolean;
  cardOpacity: number;
  borderRadius: '8px' | '12px' | '16px' | '24px';
  fontSize: 'sm' | 'md' | 'lg';
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarCollapsed: boolean;
  sidebarWidth?: number;
  reducedMotion: boolean;
}

export interface DashboardBackupData {
  version: number;
  exportedAt: string;
  appName: string;
  profiles: DashboardProfile[];
  activeProfileId: string;
  workspaces: CustomWorkspace[];
  activeWorkspaceId: string;
  appearance: AppearanceConfig;
}

// Backward-compatibility aliases for existing components
export type SideWidgetType = 'none' | 'quick-stats' | 'quick-tools' | 'todo-notes';
export type CardColSpan = 1 | 2;
export type UtilityStripPosition = 'top' | 'bottom';
export type WorkspacePreset = 'default' | 'engineering' | 'client-ops' | 'creative' | 'personal';

export interface DashboardCardConfig {
  id: string;
  title: string;
  zone: 'engineering' | 'client-ops' | 'creative' | 'personal' | 'custom';
  folderIds: string[];
  accentColor: string;
  icon: string;
  sideWidget: SideWidgetType;
  colSpan: CardColSpan;
  visible: boolean;
  order: number;
}

export type KPIIcon = 'rocket' | 'shield' | 'dollar' | 'clock' | 'activity' | 'terminal' | 'check' | 'zap' | 'sparkles' | 'server';
export type KPIColor = 'red' | 'green' | 'amber' | 'blue' | 'purple';

export interface KPICardConfig {
  id: string;
  label: string;
  value: string;
  icon: KPIIcon;
  color: KPIColor;
  badge?: string;
  subtext?: string;
  dataMode: 'manual' | 'computed';
  computedSource?: 'projects-count' | 'tasks-count' | 'bookmarks-count' | 'focus-hours';
  visible: boolean;
  order: number;
}

export type BottomWidgetId = 'clock' | 'quote' | 'system' | 'quick-links';

export interface BottomWidgetConfig {
  id: BottomWidgetId;
  title: string;
  visible: boolean;
  order: number;
}

export interface DashboardPresetConfig {
  id: WorkspacePreset;
  name: string;
  description: string;
  accentColor: string;
  icon: string;
  cards: DashboardCardConfig[];
  kpis: KPICardConfig[];
  bottomWidgets: BottomWidgetConfig[];
  utilityStripPosition?: UtilityStripPosition;
}

export interface DashboardConfigExport {
  version: number;
  exportedAt: string;
  appName: string;
  activePreset: WorkspacePreset;
  cards: DashboardCardConfig[];
  kpis: KPICardConfig[];
  bottomWidgets: BottomWidgetConfig[];
  utilityStripPosition?: UtilityStripPosition;
}
