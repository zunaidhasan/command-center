import React, { useState } from 'react';
import { Palette, Check, Sparkles, Sliders } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useThemeStore, PRESET_DEFAULTS } from '@/store/useThemeStore';
import { ThemePreset, InterfaceDensity } from '@/types/theme';

interface AppearanceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppearanceSettingsModal: React.FC<AppearanceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    theme,
    setPreset,
    setAccentColor,
    setDensity,
    setWallpaperPreset,
    setWallpaperOpacity,
    setCardBlur,
    setAnimations,
  } = useThemeStore();

  const [activeTab, setActiveTab] = useState<'themes' | 'surfaces' | 'density'>('themes');

  const THEMES: { id: ThemePreset; name: string; accent: string; desc: string }[] = [
    { id: 'midnight', name: 'Midnight', accent: '#EF233C', desc: 'Obsidian dark with signature crimson accent' },
    { id: 'cyber', name: 'Cyber', accent: '#00F0FF', desc: 'Neon cyan tech aesthetic with deep blue' },
    { id: 'violet', name: 'Violet', accent: '#B66BFF', desc: 'Atmospheric amethyst purple with indigo' },
    { id: 'crimson', name: 'Crimson', accent: '#FF2E4D', desc: 'Bold high-contrast deep crimson red' },
    { id: 'forest', name: 'Forest', accent: '#18D879', desc: 'Emerald green and dark sage palette' },
    { id: 'light', name: 'Light', accent: '#D90429', desc: 'Clean high-readability developer light theme' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-lg text-text-primary">
            Appearance & Theme Settings
          </span>
        </div>
      }
      description="Customize theme presets, dynamic accent highlights, card backdrop opacity, and dashboard density."
    >
      <div className="space-y-4 select-none text-xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-secondary/70 border border-border/70 rounded-sm-card">
          <button
            onClick={() => setActiveTab('themes')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'themes'
                ? 'bg-surface text-text-primary shadow-subtle border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Theme Presets & Accents
          </button>
          <button
            onClick={() => setActiveTab('surfaces')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'surfaces'
                ? 'bg-surface text-text-primary shadow-subtle border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Cards & Backdrop
          </button>
          <button
            onClick={() => setActiveTab('density')}
            className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'density'
                ? 'bg-surface text-text-primary shadow-subtle border border-border'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Density & Motion
          </button>
        </div>

        {/* Tab 1: Theme Presets */}
        {activeTab === 'themes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {THEMES.map((t) => {
                const isSelected = theme.preset === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setPreset(t.id)}
                    className={`p-3 rounded-card border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-surface-secondary border-primary shadow-glow-primary/20'
                        : 'bg-surface-secondary/40 border-border hover:border-border-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-heading font-semibold text-text-primary">
                        {t.name}
                      </span>
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20"
                        style={{ backgroundColor: t.accent }}
                      />
                    </div>
                    <p className="text-[11px] text-text-secondary leading-snug">{t.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Custom Accent Color Picker */}
            <div className="p-3 bg-surface-secondary/50 rounded-card border border-border space-y-2">
              <label className="text-text-secondary font-medium block">
                Custom Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded border border-border cursor-pointer bg-surface"
                />
                <Input
                  value={theme.accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 font-mono uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Surfaces & Card Backdrop */}
        {activeTab === 'surfaces' && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-secondary/50 rounded-card border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-text-primary font-medium block">Card Backdrop Blur</span>
                  <p className="text-[11px] text-text-secondary mt-0.5">
                    Applies subtle frosted glass backdrop-blur filter to containers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={theme.cardBlur}
                  onChange={(e) => setCardBlur(e.target.checked)}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-border/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-text-primary font-medium">Wallpaper Opacity</span>
                  <span className="font-mono text-text-muted">
                    {Math.round(theme.wallpaperOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={theme.wallpaperOpacity}
                  onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Density & Motion */}
        {activeTab === 'density' && (
          <div className="space-y-4">
            <div className="p-3 bg-surface-secondary/50 rounded-card border border-border space-y-3">
              <span className="text-text-primary font-medium block">Interface Spacing Density</span>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'comfortable', 'spacious'] as InterfaceDensity[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDensity(d)}
                    className={`py-2 px-3 rounded text-xs capitalize font-medium border transition-colors ${
                      theme.density === d
                        ? 'bg-primary/20 border-primary text-primary-light'
                        : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-surface-secondary/50 rounded-card border border-border flex items-center justify-between">
              <div>
                <span className="text-text-primary font-medium block">Interface Animations</span>
                <p className="text-[11px] text-text-secondary mt-0.5">
                  Enable smooth CSS transitions, glowing pulses, and micro-interactions
                </p>
              </div>
              <input
                type="checkbox"
                checked={theme.animations}
                onChange={(e) => setAnimations(e.target.checked)}
                className="accent-primary w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
