import React, { useState } from 'react';
import {
  Rocket,
  ShieldCheck,
  DollarSign,
  Clock,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Activity,
  Terminal,
  CheckSquare,
  Zap,
  Sparkles,
  Server,
} from 'lucide-react';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useProductivityStore } from '@/store/useProductivityStore';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { KPICardConfig, KPIIcon, KPIColor } from '@/types/dashboard';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export const MetricCardsRow: React.FC = () => {
  const { kpis, isEditMode, moveKPI, toggleKPIVisibility, updateKPI, addKPI, deleteKPI } =
    useDashboardConfigStore();
  const { projects } = useProjectStore();
  const { tasks } = useProductivityStore();
  const { bookmarks } = useBookmarkStore();

  const [editingKPI, setEditingKPI] = useState<KPICardConfig | null>(null);
  const [isAddingKPI, setIsAddingKPI] = useState(false);

  // Form states
  const [editLabel, setEditLabel] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editSubtext, setEditSubtext] = useState('');
  const [editIcon, setEditIcon] = useState<KPIIcon>('rocket');
  const [editColor, setEditColor] = useState<KPIColor>('red');
  const [editDataMode, setEditDataMode] = useState<'manual' | 'computed'>('manual');
  const [editComputedSource, setEditComputedSource] = useState<
    'projects-count' | 'tasks-count' | 'bookmarks-count' | 'focus-hours'
  >('projects-count');

  const handleOpenEdit = (kpi: KPICardConfig, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingKPI(kpi);
    setIsAddingKPI(false);
    setEditLabel(kpi.label);
    setEditValue(kpi.value);
    setEditBadge(kpi.badge || '');
    setEditSubtext(kpi.subtext || '');
    setEditIcon(kpi.icon);
    setEditColor(kpi.color);
    setEditDataMode(kpi.dataMode);
    setEditComputedSource(kpi.computedSource || 'projects-count');
  };

  const handleOpenAdd = () => {
    setEditingKPI(null);
    setIsAddingKPI(true);
    setEditLabel('New Metric');
    setEditValue('0');
    setEditBadge('+5%');
    setEditSubtext('Tracked metric');
    setEditIcon('activity');
    setEditColor('blue');
    setEditDataMode('manual');
    setEditComputedSource('projects-count');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLabel.trim()) return;

    if (isAddingKPI) {
      await addKPI({
        label: editLabel.trim(),
        value: editValue.trim(),
        badge: editBadge.trim() || undefined,
        subtext: editSubtext.trim() || undefined,
        icon: editIcon,
        color: editColor,
        dataMode: editDataMode,
        computedSource: editDataMode === 'computed' ? editComputedSource : undefined,
        visible: true,
      });
      setIsAddingKPI(false);
    } else if (editingKPI) {
      await updateKPI(editingKPI.id, {
        label: editLabel.trim(),
        value: editValue.trim(),
        badge: editBadge.trim() || undefined,
        subtext: editSubtext.trim() || undefined,
        icon: editIcon,
        color: editColor,
        dataMode: editDataMode,
        computedSource: editDataMode === 'computed' ? editComputedSource : undefined,
      });
      setEditingKPI(null);
    }
  };

  const getComputedValue = (kpi: KPICardConfig): string => {
    if (kpi.dataMode !== 'computed') return kpi.value;
    switch (kpi.computedSource) {
      case 'projects-count':
        return `${projects.length}/${projects.length} Prod`;
      case 'tasks-count': {
        const pending = tasks.filter((t) => !t.completed).length;
        return `${pending} Pending`;
      }
      case 'bookmarks-count':
        return `${bookmarks.length} Links`;
      case 'focus-hours':
        return '38.5 hrs';
      default:
        return kpi.value;
    }
  };

  const renderIcon = (icon: KPIIcon) => {
    const iconClass = 'w-5 h-5';
    switch (icon) {
      case 'rocket':
        return <Rocket className={iconClass} />;
      case 'shield':
        return <ShieldCheck className={iconClass} />;
      case 'dollar':
        return <DollarSign className={iconClass} />;
      case 'clock':
        return <Clock className={iconClass} />;
      case 'activity':
        return <Activity className={iconClass} />;
      case 'terminal':
        return <Terminal className={iconClass} />;
      case 'check':
        return <CheckSquare className={iconClass} />;
      case 'zap':
        return <Zap className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'server':
        return <Server className={iconClass} />;
      default:
        return <Rocket className={iconClass} />;
    }
  };

  const getColorStyles = (color: KPIColor) => {
    switch (color) {
      case 'red':
        return {
          iconBg: 'bg-primary/20 text-primary-light border-primary/30',
          badgeText: 'text-primary-light bg-primary/10 border-primary/20',
        };
      case 'green':
        return {
          iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          badgeText: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          badgeText: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
        };
      case 'blue':
        return {
          iconBg: 'bg-sky-500/20 text-sky-400 border-sky-500/30',
          badgeText: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          badgeText: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
        };
    }
  };

  const sortedKPIs = [...kpis].sort((a, b) => a.order - b.order);
  const visibleKPIs = isEditMode ? sortedKPIs : sortedKPIs.filter((k) => k.visible);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 select-none">
        {visibleKPIs.map((kpi, index) => {
          const styles = getColorStyles(kpi.color);
          const displayValue = getComputedValue(kpi);

          return (
            <div
              key={kpi.id}
              onClick={() => handleOpenEdit(kpi)}
              className={`relative group bg-surface/90 hover:bg-surface border ${
                kpi.visible ? 'border-border' : 'border-dashed border-border/50 opacity-60'
              } hover:border-border-hover rounded-card p-4 transition-all duration-200 cursor-pointer shadow-subtle flex items-center gap-3.5`}
            >
              {/* Left Circular Icon */}
              <div
                className={`w-11 h-11 rounded-full border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${styles.iconBg}`}
              >
                {renderIcon(kpi.icon)}
              </div>

              {/* Metric Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-xl lg:text-2xl text-text-primary tracking-tight">
                    {displayValue}
                  </span>
                  {kpi.badge && (
                    <span
                      className={`text-[9px] font-mono font-medium px-1.5 py-0.2 rounded border ${styles.badgeText}`}
                    >
                      {kpi.badge}
                    </span>
                  )}
                  {kpi.dataMode === 'computed' && (
                    <span className="text-[9px] font-mono px-1 py-0.2 bg-surface-secondary text-accent-engineering rounded border border-border/60">
                      live
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-secondary font-medium truncate mt-0.5">
                  {kpi.label}
                </p>
              </div>

              {/* Edit Hover Actions */}
              {!isEditMode && (
                <div className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-text-primary transition-opacity p-1">
                  <Edit2 className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Edit Mode Controls */}
              {isEditMode && (
                <div
                  className="absolute -top-2.5 right-2 flex items-center gap-1 bg-surface-secondary border border-border px-1.5 py-0.5 rounded shadow-elevated z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => moveKPI(kpi.id, 'left')}
                    disabled={index === 0}
                    className="p-1 hover:text-text-primary text-text-muted disabled:opacity-30"
                    title="Move Left"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveKPI(kpi.id, 'right')}
                    disabled={index === visibleKPIs.length - 1}
                    className="p-1 hover:text-text-primary text-text-muted disabled:opacity-30"
                    title="Move Right"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => toggleKPIVisibility(kpi.id)}
                    className="p-1 hover:text-text-primary text-text-muted"
                    title={kpi.visible ? 'Hide KPI' : 'Show KPI'}
                  >
                    {kpi.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(kpi)}
                    className="p-1 hover:text-text-primary text-text-muted"
                    title="Edit KPI"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteKPI(kpi.id)}
                    className="p-1 hover:text-red-400 text-text-muted"
                    title="Delete KPI"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add KPI Button in Edit Mode */}
        {isEditMode && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 p-4 border border-dashed border-border/80 hover:border-primary/50 rounded-card text-xs text-text-secondary hover:text-text-primary bg-surface/50 transition-colors"
          >
            <Plus className="w-4 h-4 text-primary" />
            <span>Add KPI Card</span>
          </button>
        )}
      </div>

      {/* KPI Edit / Add Modal */}
      {(editingKPI || isAddingKPI) && (
        <Modal
          isOpen={!!editingKPI || isAddingKPI}
          onClose={() => {
            setEditingKPI(null);
            setIsAddingKPI(false);
          }}
          title={isAddingKPI ? 'Add New KPI Metric Card' : `Edit KPI: ${editingKPI?.label}`}
          description="Customize the metric value, icon, accent color, and data calculation mode."
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary font-medium block mb-1">Card Label</label>
                <Input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  placeholder="e.g. DeshVox Deployments"
                  required
                />
              </div>

              <div>
                <label className="text-text-secondary font-medium block mb-1">
                  Value {editDataMode === 'computed' && '(Override / Fallback)'}
                </label>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="e.g. 4/4 Prod or $8.4k"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary font-medium block mb-1">Badge Text (Optional)</label>
                <Input
                  value={editBadge}
                  onChange={(e) => setEditBadge(e.target.value)}
                  placeholder="e.g. +24%, Live, Top 5%"
                />
              </div>

              <div>
                <label className="text-text-secondary font-medium block mb-1">Subtext (Optional)</label>
                <Input
                  value={editSubtext}
                  onChange={(e) => setEditSubtext(e.target.value)}
                  placeholder="e.g. Trailing 30-day billing"
                />
              </div>
            </div>

            {/* Data Mode Selection */}
            <div className="p-3 bg-surface-secondary/60 rounded-card border border-border/70 space-y-2">
              <label className="text-text-secondary font-medium block">Data Calculation Mode</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dataMode"
                    value="manual"
                    checked={editDataMode === 'manual'}
                    onChange={() => setEditDataMode('manual')}
                    className="accent-primary"
                  />
                  <span className="text-text-primary">Static / Manual Value</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="dataMode"
                    value="computed"
                    checked={editDataMode === 'computed'}
                    onChange={() => setEditDataMode('computed')}
                    className="accent-primary"
                  />
                  <span className="text-text-primary">Live Computed Source</span>
                </label>
              </div>

              {editDataMode === 'computed' && (
                <div className="pt-2">
                  <label className="text-text-muted block mb-1">Select Data Source:</label>
                  <select
                    value={editComputedSource}
                    onChange={(e) => setEditComputedSource(e.target.value as any)}
                    className="w-full bg-surface-secondary border border-border rounded px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="projects-count">Active Projects Count (from Project Store)</option>
                    <option value="tasks-count">Pending Tasks Count (from Productivity Store)</option>
                    <option value="bookmarks-count">Total Bookmarks Saved (from Bookmark Store)</option>
                    <option value="focus-hours">Logged Focus Hours (38.5 hrs)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Icon & Color Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary font-medium block mb-1">Icon</label>
                <select
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value as KPIIcon)}
                  className="w-full bg-surface-secondary border border-border rounded px-2.5 py-2 text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="rocket">Rocket (Deployments)</option>
                  <option value="shield">Shield (Security/Contracts)</option>
                  <option value="dollar">Dollar (Revenue/Billing)</option>
                  <option value="clock">Clock (Time/Focus)</option>
                  <option value="activity">Activity (Health/Pulse)</option>
                  <option value="terminal">Terminal (Engineering)</option>
                  <option value="check">Check (Tasks)</option>
                  <option value="zap">Zap (Speed/Performance)</option>
                  <option value="sparkles">Sparkles (AI/Special)</option>
                  <option value="server">Server (Infrastructure)</option>
                </select>
              </div>

              <div>
                <label className="text-text-secondary font-medium block mb-1">Accent Theme</label>
                <select
                  value={editColor}
                  onChange={(e) => setEditColor(e.target.value as KPIColor)}
                  className="w-full bg-surface-secondary border border-border rounded px-2.5 py-2 text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="red">Signature Crimson (Red)</option>
                  <option value="green">Client Emerald (Green)</option>
                  <option value="amber">Warm Gold (Amber)</option>
                  <option value="blue">Engineering Cyan (Blue)</option>
                  <option value="purple">Creative Amethyst (Purple)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingKPI(null);
                  setIsAddingKPI(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isAddingKPI ? 'Add KPI Card' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};
