import React, { useState, useEffect } from 'react';
import { Clock, Globe, CloudSun, Settings, Sliders } from 'lucide-react';
import { ClockSettings } from '@/types/dashboard';

interface DigitalClockWidgetProps {
  settings?: Partial<ClockSettings>;
  onOpenSettings?: () => void;
  isEditMode?: boolean;
}

const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  mode: 'expanded',
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
  size: 'lg',
};

export const DigitalClockWidget: React.FC<DigitalClockWidgetProps> = ({
  settings = {},
  onOpenSettings,
  isEditMode = false,
}) => {
  const mergedSettings: ClockSettings = { ...DEFAULT_CLOCK_SETTINGS, ...settings };
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHours = (date: Date) => {
    let hours = date.getHours();
    if (mergedSettings.format === '12h') {
      hours = hours % 12 || 12;
    }
    return hours.toString().padStart(2, '0');
  };

  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';

  // Format date: "Fri, Nov 20, 2026"
  const dateFormatted = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate world clocks safely using Intl.DateTimeFormat
  const getWorldClockTime = (tz: string) => {
    try {
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: 'numeric',
        hour12: mergedSettings.format === '12h',
      }).format(time);
      return formatted;
    } catch {
      return '--:--';
    }
  };

  // ==========================================
  // 1. MINIMAL MODE
  // ==========================================
  if (mergedSettings.mode === 'minimal') {
    return (
      <div className="bg-surface/90 hover:bg-surface border border-border hover:border-primary/40 rounded-card p-4 transition-all duration-200 shadow-subtle select-none flex items-center justify-between group relative h-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-border/80 bg-surface-secondary flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shrink-0">
            <Clock className="w-5 h-5 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 font-heading font-bold text-2xl text-text-primary tracking-tight">
              <span>{formatHours(time)}:{minutes}</span>
              {mergedSettings.showSeconds && (
                <span className="text-xs font-mono text-text-muted">:{seconds}</span>
              )}
              {mergedSettings.format === '12h' && (
                <span className="text-xs font-mono font-semibold text-primary ml-1">{ampm}</span>
              )}
            </div>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {dateFormatted}
              {mergedSettings.showTimezone && ` • ${mergedSettings.timezone}`}
            </p>
          </div>
        </div>

        {onOpenSettings && isEditMode && (
          <button
            onClick={onOpenSettings}
            className="p-1 rounded bg-surface-secondary hover:bg-surface text-text-muted hover:text-text-primary"
            title="Configure Clock"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // ==========================================
  // 2. STANDARD MODE
  // ==========================================
  if (mergedSettings.mode === 'standard') {
    return (
      <div className="bg-surface/90 hover:bg-surface border border-border hover:border-primary/40 rounded-card p-4 transition-all duration-200 shadow-subtle select-none flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border border-border/80 bg-surface-secondary flex items-center justify-center text-text-muted group-hover:text-primary transition-colors shrink-0">
            <Clock className="w-6 h-6 stroke-[1.75]" />
          </div>

          <div>
            <div className="flex items-baseline gap-1.5 font-heading">
              <span className="font-bold text-3xl lg:text-4xl text-text-primary tracking-tight">
                {formatHours(time)}:{minutes}
              </span>
              {mergedSettings.showSeconds && (
                <span className="text-sm font-mono text-text-muted">:{seconds}</span>
              )}
              {mergedSettings.format === '12h' && (
                <span className="text-xs font-mono font-semibold text-primary ml-1.5 px-1.5 py-0.5 bg-primary/10 rounded border border-primary/20">
                  {ampm}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
              <span>{dateFormatted}</span>
              {mergedSettings.showTimezone && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="text-[11px] font-mono text-text-muted">
                    {mergedSettings.timezone} (GMT+6)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* World Clocks Row */}
        {mergedSettings.showWorldClocks && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {mergedSettings.worldClocks.map((wc) => (
              <div
                key={wc.city}
                className="px-2.5 py-1 rounded bg-surface-secondary/70 border border-border/60 text-xs font-mono flex items-center gap-1.5"
              >
                <span className="text-text-muted">{wc.city}:</span>
                <span className="text-text-primary font-semibold">{getWorldClockTime(wc.timezone)}</span>
              </div>
            ))}
          </div>
        )}

        {onOpenSettings && isEditMode && (
          <button
            onClick={onOpenSettings}
            className="absolute top-3 right-3 p-1 rounded bg-surface-secondary hover:bg-surface text-text-muted hover:text-text-primary"
            title="Configure Clock"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }

  // ==========================================
  // 3. EXPANDED HERO MODE (Default at top of Dashboard)
  // ==========================================
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-surface/95 via-surface-secondary/40 to-surface/95 border border-border/80 hover:border-primary/40 rounded-card p-5 lg:p-6 transition-all duration-300 shadow-card select-none group">
      {/* Background Graphic Watermark */}
      <div className="absolute right-4 -bottom-4 font-mono font-black text-8xl text-surface-secondary/20 pointer-events-none select-none">
        {formatHours(time)}:{minutes}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Time & Greeting */}
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-card bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-glow-primary/20">
            <Clock className="w-7 h-7 stroke-[2]" />
          </div>

          <div>
            <div className="flex items-baseline gap-2 font-heading">
              <span className="font-black text-4xl lg:text-5xl text-text-primary tracking-tight">
                {formatHours(time)}:{minutes}
              </span>
              {mergedSettings.showSeconds && (
                <span className="text-lg lg:text-xl font-mono text-text-muted font-bold">
                  :{seconds}
                </span>
              )}
              {mergedSettings.format === '12h' && (
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/15 border border-primary/25 ml-1">
                  {ampm}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mt-1.5 text-xs text-text-secondary">
              <span className="font-medium text-text-primary">{dateFormatted}</span>
              {mergedSettings.showTimezone && (
                <>
                  <span className="text-text-muted">•</span>
                  <span className="font-mono text-[11px] text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border/60">
                    {mergedSettings.timezone} (GMT+6)
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Weather & World Clocks */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-stretch md:self-auto justify-end">
          {/* Weather Widget */}
          {mergedSettings.showWeather && (
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-card bg-surface-secondary/60 border border-border/70 text-xs">
              <CloudSun className="w-5 h-5 text-amber-400" />
              <div>
                <div className="font-bold text-text-primary font-mono">{mergedSettings.weatherTemp}</div>
                <div className="text-[10px] text-text-muted truncate">Dhaka, Bangladesh</div>
              </div>
            </div>
          )}

          {/* World Clocks Pills */}
          {mergedSettings.showWorldClocks && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {mergedSettings.worldClocks.map((wc) => (
                <div
                  key={wc.city}
                  className="px-2.5 py-1.5 rounded-sm-card bg-surface-secondary/80 border border-border/70 text-xs font-mono flex flex-col"
                >
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    {wc.city}
                  </span>
                  <span className="text-text-primary font-semibold mt-0.5">
                    {getWorldClockTime(wc.timezone)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Settings Trigger in Edit Mode */}
          {onOpenSettings && isEditMode && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-sm-card bg-surface-secondary hover:bg-surface text-text-muted hover:text-text-primary border border-border transition-colors self-end sm:self-center"
              title="Configure Clock Widget"
            >
              <Sliders className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
