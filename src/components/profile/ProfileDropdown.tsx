import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Palette,
  Sliders,
  MessageSquare,
  LogOut,
  Camera,
  Check,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useProfileStore } from '@/store/useProfileStore';
import { useThemeStore, PRESET_DEFAULTS } from '@/store/useThemeStore';
import { useUIStore } from '@/store/useUIStore';
import { ThemePreset } from '@/types/theme';

export const ProfileDropdown: React.FC = () => {
  const { profile } = useProfileStore();
  const { theme, setPreset } = useThemeStore();
  const { setProfileModalOpen, setActiveView } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowThemePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditProfile = () => {
    setIsOpen(false);
    setShowThemePicker(false);
    setProfileModalOpen(true);
  };

  const handleGoSettings = () => {
    setIsOpen(false);
    setShowThemePicker(false);
    setActiveView('settings');
  };

  const handleSelectPreset = async (preset: ThemePreset) => {
    await setPreset(preset);
  };

  const THEME_PREVIEWS: { id: ThemePreset; name: string; bg: string; accent: string }[] = [
    { id: 'midnight', name: 'Midnight', bg: '#090B10', accent: '#EF233C' },
    { id: 'cyber', name: 'Cyber', bg: '#050811', accent: '#00F0FF' },
    { id: 'violet', name: 'Violet', bg: '#0A0612', accent: '#B66BFF' },
    { id: 'crimson', name: 'Crimson', bg: '#0D0507', accent: '#FF2E4D' },
    { id: 'forest', name: 'Forest', bg: '#060B08', accent: '#18D879' },
    { id: 'light', name: 'Light', bg: '#F4F6F9', accent: '#D90429' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-0.5 rounded-full border border-border hover:border-primary/80 transition-colors focus:outline-none"
        title="Account & Profile Settings"
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-surface-secondary flex items-center justify-center font-heading font-semibold text-text-primary text-sm">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white font-bold">
              {profile.displayName.charAt(0)}
            </div>
          )}
        </div>
        {/* Status Indicator Dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
      </button>

      {/* Profile Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-surface/95 backdrop-blur-xl border border-border rounded-card shadow-elevated z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="p-4 border-b border-border/70 flex items-center gap-3 bg-surface-secondary/40">
            <div className="relative group">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-secondary flex items-center justify-center border border-border">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-primary to-orange-500 flex items-center justify-center text-white text-lg font-bold">
                    {profile.displayName.charAt(0)}
                  </div>
                )}
              </div>
              <button
                onClick={handleEditProfile}
                title="Change Avatar"
                className="absolute bottom-0 right-0 p-1 bg-primary text-white rounded-full shadow-sm hover:scale-110 transition-transform"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-text-primary text-sm truncate">
                {profile.displayName}
              </h4>
              <p className="text-xs font-mono text-text-muted truncate">{profile.username}</p>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>{profile.status}</span>
              </div>
            </div>
          </div>

          {/* Quick Menu Actions */}
          <div className="p-2 space-y-1">
            <button
              onClick={handleEditProfile}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-sm-card transition-colors"
            >
              <User className="w-4 h-4 text-text-muted" />
              <span>Edit Profile</span>
            </button>

            {/* Pick Theme Toggle */}
            <div>
              <button
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-sm-card transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Palette className="w-4 h-4 text-text-muted" />
                  <span>Pick Theme</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-text-muted font-mono">
                  <span className="capitalize">{theme.preset}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      showThemePicker ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Collapsible Theme Cards preview */}
              {showThemePicker && (
                <div className="px-2 py-2 bg-surface-darker/60 rounded-sm-card mt-1 mb-1 border border-border/50">
                  <div className="grid grid-cols-3 gap-2">
                    {THEME_PREVIEWS.map((item) => {
                      const isSelected = theme.preset === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectPreset(item.id)}
                          className={`relative flex flex-col items-center p-2 rounded-sm-card border transition-all ${
                            isSelected
                              ? 'border-primary ring-1 ring-primary/40 bg-surface'
                              : 'border-border/60 hover:border-text-muted bg-surface/40'
                          }`}
                        >
                          <div
                            className="w-full h-7 rounded border border-border/80 flex items-center justify-center relative overflow-hidden"
                            style={{ backgroundColor: item.bg }}
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.accent }}
                            />
                            {isSelected && (
                              <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-primary flex items-center justify-center text-white">
                                <Check className="w-2 h-2" />
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-text-secondary mt-1">
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setActiveView('settings');
                    }}
                    className="w-full text-center text-[10px] text-primary hover:underline mt-2 block"
                  >
                    More Themes & Customizer →
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleGoSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-sm-card transition-colors"
            >
              <Sliders className="w-4 h-4 text-text-muted" />
              <span>Dashboard Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                window.open('https://github.com/zunaidhasan', '_blank');
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary rounded-sm-card transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4 text-text-muted" />
                <span>Feedback & Support</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-border/70 bg-surface-secondary/20">
            <button
              onClick={() => {
                setIsOpen(false);
                alert('Session locked. Refresh or click anywhere to continue.');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-sm-card transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / Lock</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
