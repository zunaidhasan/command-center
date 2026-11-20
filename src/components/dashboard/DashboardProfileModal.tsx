import React, { useState, useRef } from 'react';
import {
  Layers,
  Plus,
  Check,
  Copy,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useDashboardConfigStore, PRESET_PROFILES } from '@/store/useDashboardConfigStore';
import { DashboardProfile } from '@/types/dashboard';

interface DashboardProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DashboardProfileModal: React.FC<DashboardProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profiles,
    activeProfileId,
    setActiveProfile,
    createProfile,
    duplicateProfile,
    deleteProfile,
    exportConfig,
    importConfig,
    resetToDefault,
  } = useDashboardConfigStore();

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProfile(name.trim(), description.trim());
    setIsCreating(false);
    setName('');
    setDescription('');
    showNotification('Profile created!');
  };

  const handleExport = () => {
    const data = exportConfig();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zh-command-center-profile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Profile exported to JSON!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const res = await importConfig(parsed);
        if (res.success) {
          showNotification('Profile imported successfully!');
        } else {
          showNotification(`Import failed: ${res.error}`);
        }
      } catch (err: any) {
        showNotification(`Invalid JSON: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const PRESETS: { id: string; name: string; desc: string }[] = [
    { id: 'default', name: 'Default Complete', desc: '10-tier full hierarchy with Top Clock, Focus, KPIs, 4 Hubs, Utilities' },
    { id: 'minimal', name: 'Minimal Focus', desc: 'Large Clock, Universal Search, and Quick Links only' },
    { id: 'developer', name: 'Developer Power-User', desc: 'Clock, AI & Coding Hub full width, Dev Tools, Deployments KPI' },
    { id: 'client-operations', name: 'Agency & Revenue', desc: 'Clock, Client Pipeline, Sales Stats, Revenue KPI, Client Ops' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-lg text-text-primary">
              Dashboard Profiles & Presets
            </span>
          </div>
          <Button size="sm" variant="primary" onClick={() => setIsCreating(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Save New Profile</span>
          </Button>
        </div>
      }
      description="Save and switch between full dashboard presets and custom layout profiles."
    >
      <div className="space-y-4 select-none">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Create Profile Form */}
        {isCreating && (
          <form
            onSubmit={handleCreate}
            className="p-3.5 bg-surface-secondary/80 border border-primary/40 rounded-card space-y-3 text-xs"
          >
            <div className="flex items-center justify-between font-heading font-semibold text-text-primary">
              <span>Save Current Layout as Profile</span>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary block mb-1">Profile Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deep Work Morning"
                  required
                />
              </div>
              <div>
                <label className="text-text-secondary block mb-1">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Minimalist focus session"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" variant="primary" size="sm">
                Save Profile
              </Button>
            </div>
          </form>
        )}

        {/* Profiles List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {profiles.map((profile) => {
            const isActive = activeProfileId === profile.id;
            return (
              <div
                key={profile.id}
                className={`p-3 rounded-card border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-surface-secondary border-primary/50 shadow-sm'
                    : 'bg-surface-secondary/40 border-border hover:border-border-hover'
                }`}
              >
                <div
                  className="min-w-0 flex-1 cursor-pointer"
                  onClick={() => setActiveProfile(profile.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-semibold text-sm text-text-primary">
                      {profile.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/15 text-primary-light border border-primary/25">
                        Active Profile
                      </span>
                    )}
                    {profile.isPreset && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted">
                        Preset
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary truncate mt-0.5">
                    {profile.description}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant={isActive ? 'secondary' : 'ghost'}
                    onClick={() => setActiveProfile(profile.id)}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : null}
                    <span>{isActive ? 'Current' : 'Switch'}</span>
                  </Button>

                  <button
                    onClick={() => duplicateProfile(profile.id)}
                    className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                    title="Duplicate Profile"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {!profile.isPreset && profiles.length > 1 && (
                    <button
                      onClick={() => deleteProfile(profile.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Backup / Export / Import Action Row */}
        <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-accent-engineering" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-accent-client" />
              <span>Import JSON</span>
            </button>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        {notification && (
          <div className="text-center text-xs font-mono text-emerald-400 py-1">
            {notification}
          </div>
        )}
      </div>
    </Modal>
  );
};
