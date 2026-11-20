import { create } from 'zustand';
import { OverviewMetric, QuickLink } from '@/types/analytics';
import { INITIAL_METRICS, INITIAL_QUICK_LINKS } from '@/services/initial-data';
import { StorageAdapter } from '@/services/storage';

interface AnalyticsState {
  metrics: OverviewMetric[];
  quickLinks: QuickLink[];
  isLoading: boolean;

  initAnalytics: () => Promise<void>;
  updateMetric: (id: string, updates: Partial<OverviewMetric>) => Promise<void>;
  resetMetrics: () => Promise<void>;
  
  // Quick Links
  addQuickLink: (link: Omit<QuickLink, 'id'>) => Promise<QuickLink>;
  updateQuickLink: (id: string, updates: Partial<QuickLink>) => Promise<void>;
  deleteQuickLink: (id: string) => Promise<void>;
  resetQuickLinks: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  metrics: INITIAL_METRICS,
  quickLinks: INITIAL_QUICK_LINKS,
  isLoading: true,

  initAnalytics: async () => {
    try {
      const savedMetrics = await StorageAdapter.get<OverviewMetric[]>('dashboard_metrics', INITIAL_METRICS);
      const savedLinks = await StorageAdapter.get<QuickLink[]>('dashboard_quick_links', INITIAL_QUICK_LINKS);
      set({
        metrics: savedMetrics,
        quickLinks: savedLinks,
        isLoading: false,
      });
    } catch (err) {
      console.error('[AnalyticsStore] Failed to load data:', err);
      set({
        metrics: INITIAL_METRICS,
        quickLinks: INITIAL_QUICK_LINKS,
        isLoading: false,
      });
    }
  },

  updateMetric: async (id, updates) => {
    const updated = get().metrics.map((m) => (m.id === id ? { ...m, ...updates } : m));
    set({ metrics: updated });
    await StorageAdapter.set('dashboard_metrics', updated);
  },

  resetMetrics: async () => {
    set({ metrics: INITIAL_METRICS });
    await StorageAdapter.set('dashboard_metrics', INITIAL_METRICS);
  },

  addQuickLink: async (linkData) => {
    const newLink: QuickLink = {
      ...linkData,
      id: `ql-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...get().quickLinks, newLink];
    set({ quickLinks: updated });
    await StorageAdapter.set('dashboard_quick_links', updated);
    return newLink;
  },

  updateQuickLink: async (id, updates) => {
    const updated = get().quickLinks.map((l) => (l.id === id ? { ...l, ...updates } : l));
    set({ quickLinks: updated });
    await StorageAdapter.set('dashboard_quick_links', updated);
  },

  deleteQuickLink: async (id) => {
    const updated = get().quickLinks.filter((l) => l.id !== id);
    set({ quickLinks: updated });
    await StorageAdapter.set('dashboard_quick_links', updated);
  },

  resetQuickLinks: async () => {
    set({ quickLinks: INITIAL_QUICK_LINKS });
    await StorageAdapter.set('dashboard_quick_links', INITIAL_QUICK_LINKS);
  },
}));
