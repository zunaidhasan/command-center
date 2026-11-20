export type ThemePreset = 'midnight' | 'cyber' | 'violet' | 'crimson' | 'forest' | 'light';

export type InterfaceDensity = 'compact' | 'default' | 'comfortable';

export interface ThemeConfig {
  preset: ThemePreset;
  accentColor: string;
  customBgColor?: string;
  customCardColor?: string;
  customBorderColor?: string;
  wallpaperPreset: 'midnight-mountain' | 'cyber-grid' | 'deep-space' | 'gradient' | 'minimal' | 'custom';
  customWallpaperUrl?: string;
  wallpaperOpacity: number;
  cardBlur: boolean;
  fontHeading: string;
  fontBody: string;
  density: InterfaceDensity;
  animations: boolean;
  updatedAt: number;
}
