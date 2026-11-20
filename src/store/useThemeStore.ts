import { create } from 'zustand';
import { ThemeConfig, ThemePreset, InterfaceDensity } from '@/types/theme';
import { INITIAL_THEME } from '@/services/initial-data';
import { StorageAdapter } from '@/services/storage';

interface ThemeState {
  theme: ThemeConfig;
  isLoading: boolean;

  initTheme: () => Promise<void>;
  setPreset: (preset: ThemePreset) => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
  setDensity: (density: InterfaceDensity) => Promise<void>;
  setWallpaperPreset: (preset: ThemeConfig['wallpaperPreset']) => Promise<void>;
  setCustomWallpaperUrl: (url: string) => Promise<void>;
  setWallpaperOpacity: (opacity: number) => Promise<void>;
  setCardBlur: (enabled: boolean) => Promise<void>;
  setAnimations: (enabled: boolean) => Promise<void>;
  updateTheme: (updates: Partial<ThemeConfig>) => Promise<void>;
  resetToDefault: () => Promise<void>;
}

export const PRESET_DEFAULTS: Record<ThemePreset, { accent: string; name: string; desc: string }> = {
  midnight: { accent: '#EF233C', name: 'Midnight', desc: 'Deep obsidian dark with signature crimson accent' },
  cyber: { accent: '#00F0FF', name: 'Cyber', desc: 'Neon cyan tech aesthetic with deep blue shadows' },
  violet: { accent: '#B66BFF', name: 'Violet', desc: 'Atmospheric amethyst purple with indigo tones' },
  crimson: { accent: '#FF2E4D', name: 'Crimson', desc: 'Bold high-contrast deep crimson red' },
  forest: { accent: '#18D879', name: 'Forest', desc: 'Calm emerald green and dark sage palette' },
  light: { accent: '#D90429', name: 'Light', desc: 'Clean high-readability developer light theme' },
};

function applyThemeToDOM(theme: ThemeConfig) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.preset);
  
  if (theme.preset === 'light') {
    root.classList.remove('dark');
  } else {
    root.classList.add('dark');
  }

  // Set CSS custom properties for dynamic accents
  root.style.setProperty('--accent-primary', theme.accentColor);
  root.style.setProperty('--density-padding', theme.density === 'compact' ? '0.5rem' : theme.density === 'comfortable' ? '1.25rem' : '0.875rem');
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: INITIAL_THEME,
  isLoading: true,

  initTheme: async () => {
    try {
      const saved = await StorageAdapter.get<ThemeConfig>('theme_config', INITIAL_THEME);
      set({ theme: saved, isLoading: false });
      applyThemeToDOM(saved);
    } catch (err) {
      console.error('[ThemeStore] Failed to load theme:', err);
      set({ theme: INITIAL_THEME, isLoading: false });
      applyThemeToDOM(INITIAL_THEME);
    }
  },

  setPreset: async (preset) => {
    const defaultAccent = PRESET_DEFAULTS[preset].accent;
    const current = get().theme;
    const updated: ThemeConfig = {
      ...current,
      preset,
      accentColor: defaultAccent,
      updatedAt: Date.now(),
    };
    set({ theme: updated });
    applyThemeToDOM(updated);
    await StorageAdapter.set('theme_config', updated);
  },

  setAccentColor: async (color) => {
    const current = get().theme;
    const updated: ThemeConfig = {
      ...current,
      accentColor: color,
      updatedAt: Date.now(),
    };
    set({ theme: updated });
    applyThemeToDOM(updated);
    await StorageAdapter.set('theme_config', updated);
  },

  setDensity: async (density) => {
    const current = get().theme;
    const updated: ThemeConfig = { ...current, density, updatedAt: Date.now() };
    set({ theme: updated });
    applyThemeToDOM(updated);
    await StorageAdapter.set('theme_config', updated);
  },

  setWallpaperPreset: async (wallpaperPreset) => {
    const current = get().theme;
    const updated: ThemeConfig = { ...current, wallpaperPreset, updatedAt: Date.now() };
    set({ theme: updated });
    await StorageAdapter.set('theme_config', updated);
  },

  setCustomWallpaperUrl: async (customWallpaperUrl) => {
    const current = get().theme;
    const updated: ThemeConfig = { ...current, wallpaperPreset: 'custom', customWallpaperUrl, updatedAt: Date.now() };
    set({ theme: updated });
    await StorageAdapter.set('theme_config', updated);
  },

  setWallpaperOpacity: async (wallpaperOpacity) => {
    const current = get().theme;
    const updated: ThemeConfig = { ...current, wallpaperOpacity, updatedAt: Date.now() };
    set({ theme: updated });
    await StorageAdapter.set('theme_config', updated);
  },

  setCardBlur: async (cardBlur) => {
    const current = get().theme;
    const updated: ThemeConfig = { ...current, cardBlur, updatedAt: Date.now() };
    set({ theme: updated });
    await StorageAdapter.set('theme_config', updated);
  },

  setAnimations: async (animations) => {
    const current = get().theme;
    const updated: ThemeConfig = { ...current, animations, updatedAt: Date.now() };
    set({ theme: updated });
    await StorageAdapter.set('theme_config', updated);
  },

  updateTheme: async (updates) => {
    const current = get().theme;
    const updated: ThemeConfig = { ...current, ...updates, updatedAt: Date.now() };
    set({ theme: updated });
    applyThemeToDOM(updated);
    await StorageAdapter.set('theme_config', updated);
  },

  resetToDefault: async () => {
    set({ theme: INITIAL_THEME });
    applyThemeToDOM(INITIAL_THEME);
    await StorageAdapter.set('theme_config', INITIAL_THEME);
  },
}));
