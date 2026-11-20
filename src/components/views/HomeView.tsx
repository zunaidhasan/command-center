import React, { useState } from 'react';
import {
  Code2,
  Briefcase,
  Palette,
  Bookmark as BookmarkIcon,
  Plus,
  ArrowRight,
  ChevronRight,
  Pipette,
  FileCode2,
  Minimize2,
  Image as ImageIcon,
  GripVertical,
  Sliders,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Maximize2,
  Terminal,
  Activity,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { useBookmarkStore } from '@/store/useBookmarkStore';
import { useUIStore } from '@/store/useUIStore';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';
import { DigitalClockWidget } from '@/components/widgets/DigitalClockWidget';
import { MetricCardsRow } from '@/components/widgets/MetricCardsRow';
import { BookmarkCard } from '@/components/bookmarks/BookmarkCard';
import { QuickStatsChart } from '@/components/widgets/QuickStatsChart';
import { MiniTodoWidget } from '@/components/productivity/MiniTodoWidget';
import { DailyQuoteWidget } from '@/components/widgets/DailyQuoteWidget';
import { SystemStatusWidget } from '@/components/widgets/SystemStatusWidget';
import { QuickLinksStrip } from '@/components/widgets/QuickLinksStrip';
import { BookmarkModal } from '@/components/bookmarks/BookmarkModal';
import { QuickToolsModal } from '@/components/tools/QuickToolsModal';
import { DashboardCustomizerBar } from '@/components/dashboard/DashboardCustomizerBar';
import { WidgetSettingsModal } from '@/components/dashboard/WidgetSettingsModal';
import { Bookmark } from '@/types/bookmark';
import { DashboardWidget, WidgetColSpan } from '@/types/dashboard';

export const HomeView: React.FC = () => {
  const { folders, bookmarks } = useBookmarkStore();
  const { setActiveView } = useUIStore();
  const {
    widgets,
    draftWidgets,
    isEditMode,
    reorderWidgets,
    setWidgetColSpan,
    toggleWidgetVisibility,
    removeWidget,
    duplicateWidget,
  } = useDashboardConfigStore();

  // Modals state
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [targetFolderId, setTargetFolderId] = useState('folder-1');

  const [quickToolModalOpen, setQuickToolModalOpen] = useState(false);
  const [selectedQuickToolId, setSelectedQuickToolId] = useState<string>('color-picker');

  const [settingsWidget, setSettingsWidget] = useState<DashboardWidget | null>(null);

  // Drag and drop state
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  const handleAddBookmark = (folderId: string) => {
    setEditingBookmark(null);
    setTargetFolderId(folderId);
    setBookmarkModalOpen(true);
  };

  const handleEditBookmark = (bm: Bookmark) => {
    setEditingBookmark(bm);
    setBookmarkModalOpen(true);
  };

  const handleOpenQuickTool = (toolId: string) => {
    setSelectedQuickToolId(toolId);
    setQuickToolModalOpen(true);
  };

  const getFolderBookmarks = (folderId?: string) => {
    if (!folderId) return [];
    return bookmarks.filter((b) => b.folderId === folderId);
  };

  // Drag and Drop event handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isEditMode) return;
    setDraggedWidgetId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (!isEditMode || !draggedWidgetId || draggedWidgetId === id) return;
    e.preventDefault();
    setDragOverWidgetId(id);
  };

  const handleDragLeave = () => {
    setDragOverWidgetId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!isEditMode || !draggedWidgetId || draggedWidgetId === targetId) return;
    e.preventDefault();

    const currentList = isEditMode ? draftWidgets : widgets;
    const fromIndex = currentList.findIndex((w) => w.id === draggedWidgetId);
    const toIndex = currentList.findIndex((w) => w.id === targetId);

    if (fromIndex !== -1 && toIndex !== -1) {
      reorderWidgets(fromIndex, toIndex);
    }

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  const getColSpanClass = (span: WidgetColSpan) => {
    switch (span) {
      case 3:
        return 'col-span-12 md:col-span-6 lg:col-span-3';
      case 4:
        return 'col-span-12 md:col-span-6 lg:col-span-4';
      case 6:
        return 'col-span-12 md:col-span-6';
      case 8:
        return 'col-span-12 md:col-span-8';
      case 9:
        return 'col-span-12 md:col-span-9';
      case 12:
      default:
        return 'col-span-12';
    }
  };

  // Render Hub Card Component
  const renderBookmarkHub = (
    widget: DashboardWidget,
    defaultFolders: string[],
    defaultAccent: string,
    defaultSideWidget: string,
    defaultIcon: React.ReactNode
  ) => {
    const hubSettings = widget.settings || {};
    const folderIds: string[] = hubSettings.folderIds || defaultFolders;
    const accentColor: string = hubSettings.accentColor || defaultAccent;
    const sideWidget: string = hubSettings.sideWidget || defaultSideWidget;
    const hasSideWidget = sideWidget !== 'none';
    const cardFolders = folders.filter((f) => folderIds.includes(f.id));

    return (
      <div
        className="bg-surface/90 border border-border/80 rounded-card p-4 lg:p-5 shadow-card h-full flex flex-col justify-between"
        style={{ borderColor: `${accentColor}30` }}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border/60 mb-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-sm-card border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${accentColor}18`,
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                }}
              >
                {defaultIcon}
              </div>
              <h3 className="font-heading font-bold text-base lg:text-lg text-text-primary tracking-tight">
                {widget.title}
              </h3>
            </div>

            <button
              onClick={() => setActiveView('bookmarks')}
              className="text-xs font-mono hover:underline flex items-center gap-1 group"
              style={{ color: accentColor }}
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Hub Body */}
          <div className={`grid grid-cols-1 ${hasSideWidget ? 'md:grid-cols-3' : 'md:grid-cols-1'} gap-3`}>
            <div className={hasSideWidget ? 'md:col-span-2 space-y-4' : 'md:col-span-1 space-y-4'}>
              {cardFolders.map((folder) => {
                const folderBookmarks = getFolderBookmarks(folder.id);
                return (
                  <div key={folder.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-medium text-text-secondary flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: accentColor }}
                        />
                        {folder.name}
                      </span>
                      <button
                        onClick={() => handleAddBookmark(folder.id)}
                        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary text-xs flex items-center gap-1"
                        title={`Add link to ${folder.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {folderBookmarks.slice(0, 5).map((bm) => (
                        <BookmarkCard
                          key={bm.id}
                          bookmark={bm}
                          onEdit={handleEditBookmark}
                          accentColor={accentColor}
                          folderName={folder.name}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasSideWidget && (
              <div className="md:col-span-1 min-h-[140px]">
                {sideWidget === 'quick-stats' && <QuickStatsChart />}
                {sideWidget === 'todo-notes' && <MiniTodoWidget />}
                {sideWidget === 'quick-tools' && (
                  <div className="bg-surface/80 rounded-card border border-border/80 p-3 flex flex-col justify-between h-full">
                    <span className="text-xs font-semibold text-text-primary mb-2 block">
                      Quick Tools
                    </span>
                    <div className="space-y-1.5 flex-1">
                      {[
                        { id: 'color-picker', name: 'Color Picker', icon: Pipette, color: '#EF233C' },
                        { id: 'json-formatter', name: 'JSON Formatter', icon: FileCode2, color: '#1EA7FF' },
                        { id: 'svg-optimizer', name: 'SVG Optimizer', icon: Minimize2, color: '#18D879' },
                        { id: 'image-converter', name: 'Image Converter', icon: ImageIcon, color: '#FFB21A' },
                      ].map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleOpenQuickTool(tool.id)}
                          className="w-full flex items-center justify-between p-1.5 rounded-sm-card text-xs text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tool.color }}
                            />
                            <span>{tool.name}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Widget Content Switcher
  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'clock':
        return (
          <DigitalClockWidget
            settings={widget.settings}
            onOpenSettings={() => setSettingsWidget(widget)}
            isEditMode={isEditMode}
          />
        );
      case 'metrics':
        return <MetricCardsRow />;
      case 'productivity-focus':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-surface/90 border border-border rounded-card p-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/60 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-text-primary">
                      Daily Focus Mission
                    </h4>
                    <p className="text-[11px] text-text-secondary">
                      Finalize DeshVox real-time audio gateway & deliver Sardar IT proposal
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Priority 1
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Verify DeshVox WebSocket gateway latency under load (Sub-100ms)</span>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Deliver Sardar IT Phase 2 Milestone proposal document</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-1">
              <MiniTodoWidget />
            </div>
          </div>
        );
      case 'hub-personal':
        return renderBookmarkHub(
          widget,
          ['folder-5'],
          '#FFB21A',
          'todo-notes',
          <BookmarkIcon className="w-4 h-4" />
        );
      case 'hub-engineering':
        return renderBookmarkHub(
          widget,
          ['folder-1', 'folder-2'],
          '#1EA7FF',
          'none',
          <Code2 className="w-4 h-4" />
        );
      case 'hub-creative':
        return renderBookmarkHub(
          widget,
          ['folder-4'],
          '#B66BFF',
          'quick-tools',
          <Palette className="w-4 h-4" />
        );
      case 'hub-client-ops':
        return renderBookmarkHub(
          widget,
          ['folder-3'],
          '#18D879',
          'quick-stats',
          <Briefcase className="w-4 h-4" />
        );
      case 'quote':
        return <DailyQuoteWidget />;
      case 'system-status':
        return <SystemStatusWidget />;
      case 'quick-links':
        return <QuickLinksStrip />;
      case 'quick-stats':
        return <QuickStatsChart />;
      case 'quick-tools':
        return (
          <div className="bg-surface/90 border border-border rounded-card p-4 h-full flex flex-col justify-between">
            <span className="font-heading font-semibold text-xs text-text-primary mb-2">
              Quick Tools
            </span>
            <div className="space-y-1.5">
              {[
                { id: 'color-picker', name: 'Color Picker', icon: Pipette, color: '#EF233C' },
                { id: 'json-formatter', name: 'JSON Formatter', icon: FileCode2, color: '#1EA7FF' },
                { id: 'svg-optimizer', name: 'SVG Optimizer', icon: Minimize2, color: '#18D879' },
                { id: 'image-converter', name: 'Image Converter', icon: ImageIcon, color: '#FFB21A' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleOpenQuickTool(tool.id)}
                  className="w-full flex items-center justify-between p-2 rounded-sm-card text-xs text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tool.color }} />
                    <span>{tool.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-surface/90 border border-border rounded-card text-xs text-text-muted">
            {widget.title}
          </div>
        );
    }
  };

  const currentWidgets = isEditMode ? draftWidgets : widgets;
  const sortedWidgets = [...currentWidgets].sort((a, b) => a.order - b.order);
  const displayWidgets = isEditMode ? sortedWidgets : sortedWidgets.filter((w) => w.visible);

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* 1. Header & Workspace Selector Bar */}
      <DashboardCustomizerBar />

      {/* 2. Responsive 12-Column Layout Engine */}
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        {displayWidgets.map((widget) => {
          const isDragging = draggedWidgetId === widget.id;
          const isDragOver = dragOverWidgetId === widget.id;

          return (
            <div
              key={widget.id}
              draggable={isEditMode}
              onDragStart={(e) => handleDragStart(e, widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, widget.id)}
              onDragEnd={handleDragEnd}
              className={`relative transition-all duration-200 ${getColSpanClass(widget.colSpan)} ${
                isDragging ? 'opacity-30 scale-95' : 'opacity-100'
              } ${isDragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}
            >
              {/* Edit Mode Overlay Toolbar */}
              {isEditMode && (
                <div className="absolute -top-3 left-2 right-2 flex items-center justify-between px-2 py-1 bg-surface-secondary/95 backdrop-blur-md border border-primary/50 rounded shadow-elevated z-30 text-xs">
                  {/* Drag Handle */}
                  <div className="flex items-center gap-1 cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary">
                    <GripVertical className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono text-[10px] text-text-muted">{widget.title}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Span selector */}
                    <select
                      value={widget.colSpan}
                      onChange={(e) =>
                        setWidgetColSpan(widget.id, Number(e.target.value) as WidgetColSpan)
                      }
                      className="bg-surface border border-border/80 rounded px-1.5 py-0.5 text-[10px] font-mono text-text-primary"
                    >
                      <option value={3}>1/4 (3c)</option>
                      <option value={4}>1/3 (4c)</option>
                      <option value={6}>Half (6c)</option>
                      <option value={8}>Wide (8c)</option>
                      <option value={12}>Full (12c)</option>
                    </select>

                    <button
                      onClick={() => setSettingsWidget(widget)}
                      className="p-1 text-text-muted hover:text-text-primary"
                      title="Widget Settings"
                    >
                      <Sliders className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => duplicateWidget(widget.id)}
                      className="p-1 text-text-muted hover:text-text-primary"
                      title="Duplicate Widget"
                    >
                      <Copy className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className="p-1 text-text-muted hover:text-text-primary"
                      title={widget.visible ? 'Hide' : 'Show'}
                    >
                      {widget.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3 text-red-400" />}
                    </button>

                    <button
                      onClick={() => removeWidget(widget.id)}
                      className="p-1 text-text-muted hover:text-red-400"
                      title="Remove Widget"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Rendered Widget */}
              <div className={!widget.visible && isEditMode ? 'opacity-50 border border-dashed border-border rounded-card p-1' : ''}>
                {renderWidgetContent(widget)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bookmark Modal */}
      {bookmarkModalOpen && (
        <BookmarkModal
          isOpen={bookmarkModalOpen}
          onClose={() => setBookmarkModalOpen(false)}
          initialBookmark={editingBookmark}
          defaultFolderId={targetFolderId}
        />
      )}

      {/* Quick Tools Interactive Modal */}
      {quickToolModalOpen && (
        <QuickToolsModal
          isOpen={quickToolModalOpen}
          onClose={() => setQuickToolModalOpen(false)}
          initialToolId={selectedQuickToolId}
        />
      )}

      {/* Widget Settings Modal */}
      {settingsWidget && (
        <WidgetSettingsModal
          isOpen={!!settingsWidget}
          onClose={() => setSettingsWidget(null)}
          widget={settingsWidget}
        />
      )}
    </div>
  );
};
