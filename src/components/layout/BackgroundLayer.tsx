import React from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export const BackgroundLayer: React.FC = () => {
  const { theme } = useThemeStore();
  const { wallpaperPreset, customWallpaperUrl, wallpaperOpacity } = theme;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Dynamic Background Presets */}
      {wallpaperPreset === 'midnight-mountain' && (
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: wallpaperOpacity }}
        >
          {/* Subtle Red Celestial Glow */}
          <div className="absolute top-[8%] left-[62%] w-[420px] h-[420px] rounded-full bg-primary/20 blur-[130px] pointer-events-none" />
          <div className="absolute top-[2%] left-[68%] w-[120px] h-[120px] rounded-full bg-red-600/30 blur-[40px] pointer-events-none" />

          {/* Atmospheric Mountain Silhouette SVG */}
          <svg
            className="absolute bottom-0 w-full h-[65vh] object-cover text-[#07090D] opacity-90"
            viewBox="0 0 1440 600"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="mtnGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#141923" stop-opacity="0.85" />
                <stop offset="100%" stop-color="#090B10" stop-opacity="1" />
              </linearGradient>
              <linearGradient id="mtnGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0E121A" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#06070B" stop-opacity="1" />
              </linearGradient>
            </defs>
            {/* Back Mountain Peaks */}
            <path
              d="M0 320L120 280L240 340L360 260L480 330L600 220L720 290L840 210L960 270L1080 180L1200 260L1320 200L1440 270V600H0V320Z"
              fill="url(#mtnGrad1)"
            />
            {/* Front Mountain Peaks */}
            <path
              d="M0 420L160 360L320 440L480 340L640 410L800 300L960 380L1120 290L1280 390L1440 330V600H0V420Z"
              fill="url(#mtnGrad2)"
            />
          </svg>
        </div>
      )}

      {wallpaperPreset === 'cyber-grid' && (
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,#1f293d15_1px,transparent_1px),linear-gradient(to_bottom,#1f293d15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
          style={{ opacity: wallpaperOpacity }}
        />
      )}

      {wallpaperPreset === 'deep-space' && (
        <div
          className="absolute inset-0"
          style={{
            opacity: wallpaperOpacity,
            backgroundImage:
              'radial-gradient(1px 1px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(1.5px 1.5px at 150px 80px, #EF233C, rgba(0,0,0,0)), radial-gradient(1px 1px at 300px 220px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 450px 140px, #1EA7FF, rgba(0,0,0,0))',
            backgroundSize: '500px 500px',
          }}
        />
      )}

      {wallpaperPreset === 'gradient' && (
        <div
          className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-accent-engineering/10"
          style={{ opacity: wallpaperOpacity }}
        />
      )}

      {wallpaperPreset === 'custom' && customWallpaperUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
          style={{
            backgroundImage: `url(${customWallpaperUrl})`,
            opacity: wallpaperOpacity,
          }}
        />
      )}

      {/* Subtle top ambient vignette */}
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-background/90 to-transparent pointer-events-none" />
    </div>
  );
};
