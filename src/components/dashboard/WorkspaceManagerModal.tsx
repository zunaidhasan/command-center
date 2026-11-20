import React, { useState } from 'react';
import {
  Briefcase,
  Code2,
  Palette,
  Bookmark,
  LayoutGrid,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';
import { CustomWorkspace } from '@/types/dashboard';

interface WorkspaceManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceManagerModal: React.FC<WorkspaceManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspace,
    createWorkspace,
    updateWorkspace,
    duplicateWorkspace,
    deleteWorkspace,
  } = useDashboardConfigStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('LayoutGrid');
  const [accentColor, setAccentColor] = useState('#1EA7FF');

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setName('');
    setDescription('');
    setIcon('LayoutGrid');
    setAccentColor('#1EA7FF');
  };

  const handleStartEdit = (ws: CustomWorkspace) => {
    setEditingId(ws.id);
    setIsCreating(false);
    setName(ws.name);
    setDescription(ws.description);
    setIcon(ws.icon || 'LayoutGrid');
    setAccentColor(ws.accentColor || '#1EA7FF');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (isCreating) {
      await createWorkspace(name.trim(), description.trim(), icon, accentColor);
      setIsCreating(false);
    } else if (editingId) {
      await updateWorkspace(editingId, {
        name: name.trim(),
        description: description.trim(),
        icon,
        accentColor,
      });
      setEditingId(null);
    }
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-4 h-4" />;
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />;
      case 'Palette':
        return <Palette className="w-4 h-4" />;
      case 'Bookmark':
        return <Bookmark className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="font-heading font-bold text-lg text-text-primary">
              Workspace Manager
            </span>
          </div>
          {!isCreating && (
            <Button size="sm" variant="primary" onClick={handleStartCreate}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Workspace</span>
            </Button>
          )}
        </div>
      }
      description="Create, customize, and switch between dynamic workspaces with independent dashboard layouts."
    >
      <div className="space-y-4 select-none">
        {/* Creation / Edit Form */}
        {(isCreating || editingId) && (
          <form
            onSubmit={handleSave}
            className="p-4 bg-surface-secondary/70 border border-primary/40 rounded-card space-y-3 text-xs"
          >
            <div className="flex items-center justify-between font-heading font-semibold text-text-primary">
              <span>{isCreating ? 'Create Custom Workspace' : 'Edit Workspace'}</span>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                }}
                className="text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary block mb-1">Workspace Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI Research Lab"
                  required
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Tagline / Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Deep learning & agent workflows"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary block mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-surface"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Icon</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-surface border border-border rounded px-2.5 py-1.5 text-text-primary"
                >
                  <option value="LayoutGrid">LayoutGrid (Default)</option>
                  <option value="Code2">Code2 (Engineering)</option>
                  <option value="Briefcase">Briefcase (Client Ops)</option>
                  <option value="Palette">Palette (Creative)</option>
                  <option value="Bookmark">Bookmark (Personal)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="submit" variant="primary" size="sm">
                {isCreating ? 'Create Workspace' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}

        {/* Existing Workspaces List */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {workspaces.map((ws) => {
            const isActive = activeWorkspaceId === ws.id;
            return (
              <div
                key={ws.id}
                className={`p-3 rounded-card border transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? 'bg-surface-secondary border-primary/50 shadow-sm'
                    : 'bg-surface-secondary/40 border-border hover:border-border-hover'
                }`}
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => setActiveWorkspace(ws.id)}
                >
                  <div
                    className="w-9 h-9 rounded-sm-card flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${ws.accentColor}18`,
                      borderColor: `${ws.accentColor}40`,
                      color: ws.accentColor,
                    }}
                  >
                    {renderIcon(ws.icon)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-semibold text-sm text-text-primary">
                        {ws.name}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/15 text-primary-light border border-primary/25">
                          Active
                        </span>
                      )}
                      {ws.isDefault && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border text-text-muted">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {ws.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    size="sm"
                    variant={isActive ? 'secondary' : 'ghost'}
                    onClick={() => setActiveWorkspace(ws.id)}
                  >
                    {isActive ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" /> : null}
                    <span>{isActive ? 'Current' : 'Switch'}</span>
                  </Button>

                  <button
                    onClick={() => duplicateWorkspace(ws.id)}
                    className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                    title="Duplicate Workspace"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleStartEdit(ws)}
                    className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                    title="Edit Workspace"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {!ws.isDefault && workspaces.length > 1 && (
                    <button
                      onClick={() => deleteWorkspace(ws.id)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                      title="Delete Workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
