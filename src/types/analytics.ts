export interface OverviewMetric {
  id: string;
  label: string;
  value: string;
  icon: 'rocket' | 'shield' | 'dollar' | 'clock';
  color: 'red' | 'green' | 'amber' | 'blue';
  subtext?: string;
  isDemo: boolean;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  category?: string;
}

export interface SystemStatusData {
  status: 'All Systems Operational' | 'Partial Outage' | 'Under Maintenance';
  uptime: string;
  lastChecked: number;
  memoryUsage?: string;
  activeExtensions?: number;
  networkOnline: boolean;
}
