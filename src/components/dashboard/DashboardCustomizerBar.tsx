import React, { useRef, useState } from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Download,
  Upload,
  Check,
  LayoutGrid,
  Code2,
  Briefcase,
  Palette,
  Bookmark,
  Plus,
  Layers,
  Eye,
  Sliders,
  X,
  Save,
  Wrench,
} from 'lucide-react';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';
import { WorkspaceManagerModal } from '@/components/dashboard/WorkspaceManagerModal';
import { WidgetLibraryModal } from '@/components/dashboard/WidgetLibraryModal';
import { DashboardProfileModal } from '@/components/dashboard/DashboardProfileModal';
import { AppearanceSettingsModal } from '@/components/dashboard/AppearanceSettingsModal';
import { Button } from '@/components/common/Button';

export const DashboardCustomizerBar: React.FC = () => {
  const {
    isEditMode,
    toggleEditMode,
    saveChanges,
    cancelChanges,
    resetToDefault,
    hasUnsavedChanges,
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
  } = useDashboardConfigStore();

  const [widgetLibraryOpen, setWidgetLibraryOpen] = useState(false);
  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [appearanceModalOpen, setAppearanceModalOpen] = useState(false);

  const handleReset = async () => {
    if (window.confirm('Reset all dashboard cards, widgets, and layout to default?')) {
      await resetToDefault();
    }
  };

  return (
    <>
      <div className="space-y-2 select-none">
        {/* Workspace Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-surface/80 border border-border/80 rounded-card p-2.5 backdrop-blur-md">
          {/* Left: Dynamic Workspaces */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span className="text-[11px] font-mono text-text-muted px-1 hidden sm:inline">
              Workspace:
            </span>
            {workspaces.map((ws) => {
              const isActive = activeWorkspaceId === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm-card text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-surface-secondary text-text-primary border border-primary/50 shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/50'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ws.accentColor }}
                  />
                  <span>{ws.name}</span>
                </button>
              );
            })}

            <button
              onClick={() => setWorkspaceModalOpen(true)}
              className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
              title="Manage & Add Workspaces"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm-card bg-surface-secondary/70 border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              title="Dashboard Profiles & Presets"
            >
              <Layers className="w-3.5 h-3.5 text-accent-engineering" />
              <span>Profiles</span>
            </button>

            <button
              onClick={() => setAppearanceModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm-card bg-surface-secondary/70 border border-border text-xs text-text-secondary hover:text-text-primary transition-colors"
              title="Appearance & Themes"
            >
              <Palette className="w-3.5 h-3.5 text-accent-creative" />
              <span>Appearance</span>
            </button>

            {/* Customize Mode Toggle */}
            <button
              onClick={toggleEditMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm-card text-xs font-medium transition-all ${
                isEditMode
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary hover:bg-surface-secondary/80 border border-border'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isEditMode ? 'Exit Editor' : 'Customize Dashboard'}</span>
            </button>
          </div>
        </div>

        {/* Compact Full Dashboard Editing Toolbar when Edit Mode is active */}
        {isEditMode && (
          <div className="p-3 bg-gradient-to-r from-primary/15 via-surface/95 to-surface/95 border border-primary/40 rounded-card flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150 shadow-elevated">
            {/* Left: Status & Action buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 font-heading font-semibold text-text-primary mr-1">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Editor Active
              </span>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setWidgetLibraryOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Widget
              </Button>

              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors"
              >
                <Layers className="w-3.5 h-3.5 text-accent-engineering" />
                <span>Layout Presets</span>
              </button>

              <button
                onClick={() => setAppearanceModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors"
              >
                <Palette className="w-3.5 h-3.5 text-accent-creative" />
                <span>Appearance</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-amber-400 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Reset Layout</span>
              </button>
            </div>

            {/* Right: Save / Cancel modifications */}
            <div className="flex items-center gap-2">
              <button
                onClick={cancelChanges}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text-primary transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>

              <button
                onClick={saveChanges}
                className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors font-medium"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {widgetLibraryOpen && (
        <WidgetLibraryModal
          isOpen={widgetLibraryOpen}
          onClose={() => setWidgetLibraryOpen(false)}
        />
      )}

      {workspaceModalOpen && (
        <WorkspaceManagerModal
          isOpen={workspaceModalOpen}
          onClose={() => setWorkspaceModalOpen(false)}
        />
      )}

      {profileModalOpen && (
        <DashboardProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      {appearanceModalOpen && (
        <AppearanceSettingsModal
          isOpen={appearanceModalOpen}
          onClose={() => setAppearanceModalOpen(false)}
        />
      )}
    </>
  );
};
