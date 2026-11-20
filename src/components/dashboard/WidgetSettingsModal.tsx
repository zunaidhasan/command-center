import React, { useState, useEffect } from 'react';
import { Sliders, Check } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { DashboardWidget, WidgetColSpan } from '@/types/dashboard';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';

interface WidgetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widget: DashboardWidget | null;
}

export const WidgetSettingsModal: React.FC<WidgetSettingsModalProps> = ({
  isOpen,
  onClose,
  widget,
}) => {
  const { updateWidgetSettings, setWidgetColSpan, toggleWidgetVisibility } =
    useDashboardConfigStore();
  const { folders } = useBookmarkStore();

  const [title, setTitle] = useState('');
  const [colSpan, setColSpan] = useState<WidgetColSpan>(6);
  const [visible, setVisible] = useState(true);

  // Clock specific states
  const [clockMode, setClockMode] = useState<'minimal' | 'standard' | 'expanded'>('expanded');
  const [clockFormat, setClockFormat] = useState<'12h' | '24h'>('12h');
  const [showSeconds, setShowSeconds] = useState(true);
  const [clockTimezone, setClockTimezone] = useState('Asia/Dhaka');
  const [showWorldClocks, setShowWorldClocks] = useState(true);
  const [showWeather, setShowWeather] = useState(true);

  // Hub specific states
  const [hubAccent, setHubAccent] = useState('#1EA7FF');
  const [hubSideWidget, setHubSideWidget] = useState<string>('none');
  const [hubFolderIds, setHubFolderIds] = useState<string[]>([]);

  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setColSpan(widget.colSpan);
      setVisible(widget.visible);

      if (widget.type === 'clock' && widget.settings) {
        setClockMode(widget.settings.mode || 'expanded');
        setClockFormat(widget.settings.format || '12h');
        setShowSeconds(widget.settings.showSeconds !== false);
        setClockTimezone(widget.settings.timezone || 'Asia/Dhaka');
        setShowWorldClocks(widget.settings.showWorldClocks !== false);
        setShowWeather(widget.settings.showWeather !== false);
      }

      if (widget.type.startsWith('hub-') && widget.settings) {
        setHubAccent(widget.settings.accentColor || '#1EA7FF');
        setHubSideWidget(widget.settings.sideWidget || 'none');
        setHubFolderIds(widget.settings.folderIds || []);
      }
    }
  }, [widget]);

  if (!widget) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    setWidgetColSpan(widget.id, colSpan);
    if (visible !== widget.visible) {
      toggleWidgetVisibility(widget.id);
    }

    const settingsUpdate: Record<string, any> = { ...widget.settings };

    if (widget.type === 'clock') {
      settingsUpdate.mode = clockMode;
      settingsUpdate.format = clockFormat;
      settingsUpdate.showSeconds = showSeconds;
      settingsUpdate.timezone = clockTimezone;
      settingsUpdate.showWorldClocks = showWorldClocks;
      settingsUpdate.showWeather = showWeather;
    }

    if (widget.type.startsWith('hub-')) {
      settingsUpdate.accentColor = hubAccent;
      settingsUpdate.sideWidget = hubSideWidget;
      settingsUpdate.folderIds = hubFolderIds;
    }

    updateWidgetSettings(widget.id, settingsUpdate);
    onClose();
  };

  const toggleFolder = (fId: string) => {
    if (hubFolderIds.includes(fId)) {
      setHubFolderIds(hubFolderIds.filter((id) => id !== fId));
    } else {
      setHubFolderIds([...hubFolderIds, fId]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-primary" />
          <span className="font-heading font-semibold text-lg text-text-primary">
            Widget Settings: {widget.title}
          </span>
        </div>
      }
      description="Configure dimensions, visibility, behavior, and appearance parameters."
    >
      <form onSubmit={handleSave} className="space-y-4 text-xs select-none">
        <div>
          <label className="text-text-secondary font-medium block mb-1">Widget Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-text-secondary font-medium block mb-1">Grid Column Span</label>
            <select
              value={colSpan}
              onChange={(e) => setColSpan(Number(e.target.value) as WidgetColSpan)}
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value={3}>Small (3 Cols / 25% width)</option>
              <option value={4}>Medium-Small (4 Cols / 33% width)</option>
              <option value={6}>Medium (6 Cols / 50% width)</option>
              <option value={8}>Large (8 Cols / 66% width)</option>
              <option value={12}>Full Width (12 Cols / 100% width)</option>
            </select>
          </div>

          <div>
            <label className="text-text-secondary font-medium block mb-1">Visibility State</label>
            <select
              value={visible ? 'visible' : 'hidden'}
              onChange={(e) => setVisible(e.target.value === 'visible')}
              className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
            >
              <option value="visible">Visible on Dashboard</option>
              <option value="hidden">Hidden from Dashboard</option>
            </select>
          </div>
        </div>

        {/* ======================================================== */}
        {/* Clock-Specific Settings */}
        {/* ======================================================== */}
        {widget.type === 'clock' && (
          <div className="p-3.5 bg-surface-secondary/50 rounded-card border border-border space-y-3">
            <span className="font-heading font-semibold text-text-primary block">
              Clock Display Options
            </span>

            <div>
              <label className="text-text-secondary block mb-1">Display Style Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {(['minimal', 'standard', 'expanded'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setClockMode(m)}
                    className={`py-1.5 px-2 rounded text-xs capitalize transition-colors font-medium border ${
                      clockMode === m
                        ? 'bg-primary/20 border-primary text-primary-light'
                        : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary block mb-1">Time Format</label>
                <select
                  value={clockFormat}
                  onChange={(e) => setClockFormat(e.target.value as any)}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-text-primary"
                >
                  <option value="12h">12-Hour (AM / PM)</option>
                  <option value="24h">24-Hour (Military)</option>
                </select>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Timezone</label>
                <select
                  value={clockTimezone}
                  onChange={(e) => setClockTimezone(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2 py-1 text-text-primary"
                >
                  <option value="Asia/Dhaka">Asia/Dhaka (GMT+6)</option>
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="America/New_York">New York (EST/EDT)</option>
                  <option value="Europe/London">London (GMT/BST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSeconds}
                  onChange={(e) => setShowSeconds(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-text-secondary">Show Seconds (:ss)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWorldClocks}
                  onChange={(e) => setShowWorldClocks(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-text-secondary">Show World Clocks (London, NYC, Tokyo)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showWeather}
                  onChange={(e) => setShowWeather(e.target.checked)}
                  className="accent-primary"
                />
                <span className="text-text-secondary">Show Weather Preview (Dhaka)</span>
              </label>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* Hub-Specific Settings */}
        {/* ======================================================== */}
        {widget.type.startsWith('hub-') && (
          <div className="p-3.5 bg-surface-secondary/50 rounded-card border border-border space-y-3">
            <span className="font-heading font-semibold text-text-primary block">
              Bookmark Hub Configuration
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary block mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={hubAccent}
                    onChange={(e) => setHubAccent(e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-surface"
                  />
                  <Input
                    value={hubAccent}
                    onChange={(e) => setHubAccent(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Embedded Side Widget</label>
                <select
                  value={hubSideWidget}
                  onChange={(e) => setHubSideWidget(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2.5 py-1 text-text-primary"
                >
                  <option value="none">None (Full width for tiles)</option>
                  <option value="quick-stats">Quick Stats Sparkline</option>
                  <option value="quick-tools">Quick Tools Launcher</option>
                  <option value="todo-notes">Todo / Notes Mini Checklist</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-text-secondary block mb-1">Bookmark Folders</label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {folders.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => toggleFolder(f.id)}
                    className="flex items-center justify-between p-1.5 rounded bg-surface border border-border/50 cursor-pointer"
                  >
                    <span className="text-text-primary">{f.name}</span>
                    <input
                      type="checkbox"
                      checked={hubFolderIds.includes(f.id)}
                      onChange={() => toggleFolder(f.id)}
                      className="accent-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Settings
          </Button>
        </div>
      </form>
    </Modal>
  );
};
