import React, { useState } from 'react';
import {
  User,
  Palette,
  HardDrive,
  Upload,
  Download,
  RotateCcw,
  Check,
  Camera,
  ExternalLink,
  Shield,
  Trash2,
} from 'lucide-react';
import { ChromeIcon } from '@/components/common/BrandIcons';
import { useProfileStore } from '@/store/useProfileStore';
import { useThemeStore, PRESET_DEFAULTS } from '@/store/useThemeStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { ThemePreset, InterfaceDensity } from '@/types/theme';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { SecuritySettings } from '@/components/lock/SecuritySettings';
import { LockKeyhole } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, updateAvatar, removeAvatar, resetToDefault: resetProfile } =
    useProfileStore();
  const {
    theme,
    setPreset,
    setAccentColor,
    setDensity,
    setWallpaperPreset,
    setCustomWallpaperUrl,
    setWallpaperOpacity,
    setCardBlur,
    setAnimations,
    resetToDefault: resetTheme,
  } = useThemeStore();
  const { exportData, importData } = useBookmarkStore();

  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'theme' | 'storage' | 'extension'>('profile');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Profile form state
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [username, setUsername] = useState(profile.username);
  const [brand, setBrand] = useState(profile.brand);
  const [tagline, setTagline] = useState(profile.tagline);
  const [bio, setBio] = useState(profile.bio || '');
  const [status, setStatus] = useState(profile.status);
  const [github, setGithub] = useState(profile.socialLinks.github || '');
  const [linkedin, setLinkedin] = useState(profile.socialLinks.linkedin || '');
  const [fiverr, setFiverr] = useState(profile.socialLinks.fiverr || '');
  const [slack, setSlack] = useState(profile.socialLinks.slack || '');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      displayName,
      username,
      brand,
      tagline,
      bio,
      status,
      socialLinks: {
        github,
        linkedin,
        fiverr,
        slack,
      },
    });
    setSaveStatus('Profile updated successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      await updateAvatar(dataUrl);
      setSaveStatus('Avatar updated successfully!');
      setTimeout(() => setSaveStatus(null), 3000);
    };
    reader.readAsDataURL(file);
  };

  const handleExportAll = async () => {
    const data = await exportData();
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile,
      theme,
      bookmarksData: data,
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zh-labs-full-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.bookmarksData) {
          await importData(json.bookmarksData);
        }
        if (json.profile) {
          await updateProfile(json.profile);
        }
        setSaveStatus('Backup restored successfully!');
      } catch (err: any) {
        alert(`Failed to restore backup: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
          System Settings & Customizer
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Personalize user identity, visual theme engine, storage persistence, and Chrome Extension options.
        </p>
      </div>

      {saveStatus && (
        <div className="p-3 rounded-card bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 font-mono flex items-center justify-between animate-in fade-in">
          <span>{saveStatus}</span>
          <button onClick={() => setSaveStatus(null)} className="text-text-muted hover:text-white">
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation */}
        <div className="lg:col-span-1 space-y-1">
          {[
            { id: 'profile', label: 'User Profile & Identity', icon: User },
            { id: 'security', label: 'Browser Lock & Security', icon: LockKeyhole },
            { id: 'theme', label: 'Theme & Appearance', icon: Palette },
            { id: 'storage', label: 'Storage & Backup', icon: HardDrive },
            { id: 'extension', label: 'Chrome Extension MV3', icon: ChromeIcon },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-card text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary/15 text-white border border-primary/40 font-semibold'
                    : 'bg-surface/80 text-text-secondary hover:text-text-primary hover:bg-surface border border-border/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-text-muted'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Work Area */}
        <div className="lg:col-span-3 bg-surface/90 border border-border rounded-card p-6 shadow-card">
          {/* ========================================================= */}
          {/* 1. PROFILE SETTINGS */}
          {/* ========================================================= */}
          {activeSection === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  User Profile & Brand Identity
                </h3>
                <Button type="submit" variant="primary" size="sm">
                  Save Profile
                </Button>
              </div>

              {/* Avatar Section */}
              <div className="flex items-center gap-5 p-4 rounded-card bg-surface-secondary/40 border border-border">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-secondary border-2 border-primary/30 flex items-center justify-center font-heading font-bold text-xl text-white">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profile.displayName.charAt(0)
                    )}
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-text-primary block">
                    Custom Avatar Picture
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                      <span className="px-2.5 py-1 rounded-sm-card text-xs font-medium bg-surface hover:bg-surface-hover text-text-primary border border-border inline-block">
                        Upload Image
                      </span>
                    </label>
                    {profile.avatarUrl && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        className="px-2.5 py-1 rounded-sm-card text-xs text-red-400 hover:bg-red-500/10 border border-transparent"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-text-muted">
                    Stored locally in browser storage. JPG, PNG, WebP supported.
                  </p>
                </div>
              </div>

              {/* Identity Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Username
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Brand Name
                  </label>
                  <Input value={brand} onChange={(e) => setBrand(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Tagline
                  </label>
                  <Input value={tagline} onChange={(e) => setTagline(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Status Indicator
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2"
                >
                  <option value="Online">Online (Ready)</option>
                  <option value="In the zone">In the zone (Focus)</option>
                  <option value="Coding">Coding (Building)</option>
                  <option value="In client meeting">In client meeting</option>
                  <option value="Away">Away</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Professional Bio
                </label>
                <Input value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              {/* Social Links */}
              <div className="pt-2 border-t border-border space-y-3">
                <span className="text-xs font-semibold text-text-primary block">
                  Social & Workspace Links
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      GITHUB PROFILE
                    </label>
                    <Input
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="https://github.com/zunaidhasan"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      LINKEDIN URL
                    </label>
                    <Input
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="https://linkedin.com/in/zunaid-ishan/"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      FIVERR PROFILE
                    </label>
                    <Input
                      value={fiverr}
                      onChange={(e) => setFiverr(e.target.value)}
                      placeholder="https://fiverr.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-text-muted mb-1">
                      SLACK WORKSPACE
                    </label>
                    <Input
                      value={slack}
                      onChange={(e) => setSlack(e.target.value)}
                      placeholder="https://sardarit.slack.com"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* 2. BROWSER LOCK & SECURITY */}
          {/* ========================================================= */}
          {activeSection === 'security' && <SecuritySettings />}

          {/* ========================================================= */}
          {/* 3. THEME SETTINGS */}
          {/* ========================================================= */}
          {activeSection === 'theme' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Theme Engine & Appearance
                </h3>
                <Button variant="outline" size="sm" onClick={resetTheme}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Restore Default Theme</span>
                </Button>
              </div>

              {/* 6 Theme Presets */}
              <div>
                <span className="text-xs font-semibold text-text-primary block mb-3">
                  Theme Presets
                </span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.keys(PRESET_DEFAULTS) as ThemePreset[]).map((presetKey) => {
                    const preset = PRESET_DEFAULTS[presetKey];
                    const isSelected = theme.preset === presetKey;

                    return (
                      <button
                        key={presetKey}
                        onClick={() => setPreset(presetKey)}
                        className={`p-3.5 rounded-card border text-left transition-all ${
                          isSelected
                            ? 'bg-surface-secondary border-primary ring-1 ring-primary/40 shadow-sm'
                            : 'bg-surface border-border/80 hover:border-text-muted'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-heading font-semibold text-sm text-text-primary capitalize">
                            {preset.name}
                          </span>
                          <span
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        <p className="text-[11px] text-text-secondary leading-snug">
                          {preset.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color Customizer */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-2">
                  Custom Primary Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme.accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-12 h-9 rounded border border-border bg-surface p-1 cursor-pointer"
                  />
                  <Input
                    value={theme.accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-36 font-mono text-sm"
                  />
                  <span className="text-xs font-mono text-text-muted">
                    Current Accent: {theme.accentColor}
                  </span>
                </div>
              </div>

              {/* Wallpaper Presets */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-2">
                  Atmospheric Wallpaper
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'midnight-mountain', label: 'Midnight Peaks' },
                    { id: 'cyber-grid', label: 'Cyber Grid' },
                    { id: 'deep-space', label: 'Deep Space' },
                    { id: 'gradient', label: 'Soft Aura' },
                    { id: 'minimal', label: 'Minimalist' },
                  ].map((wp) => (
                    <button
                      key={wp.id}
                      onClick={() => setWallpaperPreset(wp.id as any)}
                      className={`p-2.5 rounded-sm-card text-xs font-medium border text-center transition-all ${
                        theme.wallpaperPreset === wp.id
                          ? 'bg-primary text-white border-primary'
                          : 'bg-surface-secondary text-text-secondary hover:text-text-primary border-border'
                      }`}
                    >
                      {wp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex justify-between text-xs font-medium text-text-secondary mb-1">
                  <span>Wallpaper Opacity</span>
                  <span className="font-mono">{Math.round(theme.wallpaperOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={theme.wallpaperOpacity}
                  onChange={(e) => setWallpaperOpacity(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Density and effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-2">
                    Interface Density
                  </label>
                  <div className="flex gap-2">
                    {(['compact', 'default', 'comfortable'] as InterfaceDensity[]).map((d) => (
                      <button
                        key={d}
                        onClick={() => setDensity(d)}
                        className={`flex-1 py-1.5 rounded-sm-card text-xs font-medium capitalize border transition-all ${
                          theme.density === d
                            ? 'bg-primary text-white border-primary'
                            : 'bg-surface-secondary text-text-secondary border-border'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-text-primary">
                    Visual Effects
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="cardBlur"
                      checked={theme.cardBlur}
                      onChange={(e) => setCardBlur(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="cardBlur" className="text-xs text-text-secondary">
                      Glassmorphism Backdrop Blur
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="animations"
                      checked={theme.animations}
                      onChange={(e) => setAnimations(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <label htmlFor="animations" className="text-xs text-text-secondary">
                      Enable Smooth Motion & Hover Transitions
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. STORAGE & BACKUP */}
          {/* ========================================================= */}
          {activeSection === 'storage' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-border">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Data Persistence & Backups
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Export and restore complete backups of your bookmarks, projects, tasks, and settings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-card border border-border bg-surface-secondary/40 space-y-3">
                  <div className="flex items-center gap-2 text-text-primary font-heading font-semibold text-sm">
                    <Download className="w-4 h-4 text-accent-engineering" />
                    <span>Export Full System Backup</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Downloads an encrypted-ready JSON file containing all 5 bookmark zones, custom folders, active projects, tasks, and profile settings.
                  </p>
                  <Button variant="primary" size="sm" onClick={handleExportAll}>
                    Download Backup JSON
                  </Button>
                </div>

                <div className="p-4 rounded-card border border-border bg-surface-secondary/40 space-y-3">
                  <div className="flex items-center gap-2 text-text-primary font-heading font-semibold text-sm">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Restore From Backup</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Select a previously exported JSON backup to safely restore your workspace without losing customized configurations.
                  </p>
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                    <span className="px-3 py-1.5 rounded-sm-card text-xs font-medium bg-surface text-text-primary border border-border inline-block hover:bg-surface-hover">
                      Select JSON File
                    </span>
                  </label>
                </div>
              </div>

              <div className="p-4 rounded-card border border-red-500/30 bg-red-500/5 space-y-2">
                <span className="text-xs font-semibold text-red-400 block">
                  Danger Zone: Factory Reset
                </span>
                <p className="text-xs text-text-muted">
                  Restore default preconfigured bookmarks, reset local profiles, and clear cached tasks.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (
                      confirm(
                        'Are you sure you want to restore default bookmarks and profile settings?'
                      )
                    ) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  Reset All to Factory Defaults
                </Button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. CHROME EXTENSION MV3 */}
          {/* ========================================================= */}
          {activeSection === 'extension' && (
            <div className="space-y-6">
              <div className="pb-3 border-b border-border">
                <h3 className="font-heading font-bold text-lg text-text-primary">
                  Chrome Extension Installation & Manifest V3
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  How to load ZH Labs Command Center as your official Chrome New Tab replacement.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-card border border-border bg-surface-secondary/50 space-y-2">
                  <span className="text-xs font-semibold text-text-primary font-mono block">
                    STEP-BY-STEP INSTALLATION GUIDE:
                  </span>
                  <ol className="list-decimal list-inside space-y-2 text-xs text-text-secondary leading-relaxed font-mono">
                    <li>
                      Build the production extension by executing{' '}
                      <code className="text-primary bg-surface px-1.5 py-0.5 rounded">
                        npm run build
                      </code>
                    </li>
                    <li>
                      Open Google Chrome and navigate to{' '}
                      <code className="text-accent-engineering bg-surface px-1.5 py-0.5 rounded">
                        chrome://extensions
                      </code>
                    </li>
                    <li>
                      Toggle on{' '}
                      <span className="text-text-primary font-bold">"Developer mode"</span> in the
                      top-right corner.
                    </li>
                    <li>
                      Click the{' '}
                      <span className="text-text-primary font-bold">"Load unpacked"</span> button
                      in the top-left toolbar.
                    </li>
                    <li>
                      Select the{' '}
                      <code className="text-emerald-400 bg-surface px-1.5 py-0.5 rounded">
                        dist
                      </code>{' '}
                      folder in your project directory.
                    </li>
                    <li>
                      Open a new browser tab (<code className="text-primary">Ctrl + T</code>) to enjoy your new command center!
                    </li>
                  </ol>
                </div>

                <div className="p-4 rounded-card border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <span className="font-semibold text-text-primary block">
                      Minimal Permission Architecture
                    </span>
                    <span className="text-text-secondary">
                      ZH Labs Command Center requests only <code className="text-emerald-300">storage</code> and optional <code className="text-emerald-300">bookmarks</code> permissions. No browsing history, cookies, or remote tracking are ever accessed.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
