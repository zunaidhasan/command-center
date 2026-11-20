import React, { useState } from 'react';
import {
  Search,
  Plus,
  Clock,
  Activity,
  CheckSquare,
  Bookmark,
  Code2,
  Palette,
  Briefcase,
  Quote,
  ShieldCheck,
  Zap,
  TrendingUp,
  Wrench,
  Timer,
  Globe,
  CloudSun,
  Calculator,
  LayoutGrid,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { WIDGET_REGISTRY, WIDGET_CATEGORIES } from '@/services/widget-registry';
import { WidgetType, WidgetCategory } from '@/types/dashboard';
import { useDashboardConfigStore } from '@/store/useDashboardConfigStore';

interface WidgetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetLibraryModal: React.FC<WidgetLibraryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addWidget } = useDashboardConfigStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WidgetCategory | 'all'>('all');
  const [addedWidgetType, setAddedWidgetType] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Clock':
        return <Clock className="w-5 h-5 text-sky-400" />;
      case 'Activity':
        return <Activity className="w-5 h-5 text-emerald-400" />;
      case 'CheckSquare':
        return <CheckSquare className="w-5 h-5 text-primary" />;
      case 'Bookmark':
        return <Bookmark className="w-5 h-5 text-amber-400" />;
      case 'Code2':
        return <Code2 className="w-5 h-5 text-sky-400" />;
      case 'Palette':
        return <Palette className="w-5 h-5 text-purple-400" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-emerald-400" />;
      case 'Quote':
        return <Quote className="w-5 h-5 text-primary" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Wrench':
        return <Wrench className="w-5 h-5 text-sky-400" />;
      case 'Timer':
        return <Timer className="w-5 h-5 text-red-400" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-purple-400" />;
      case 'CloudSun':
        return <CloudSun className="w-5 h-5 text-amber-400" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-teal-400" />;
      default:
        return <LayoutGrid className="w-5 h-5 text-text-primary" />;
    }
  };

  const handleAdd = (type: WidgetType) => {
    addWidget(type);
    setAddedWidgetType(type);
    setTimeout(() => setAddedWidgetType(null), 1500);
  };

  const allItems = Object.values(WIDGET_REGISTRY);

  const filteredItems = allItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="font-heading font-bold text-lg text-text-primary">
            Widget Library
          </span>
        </div>
      }
      description="Add customizable productivity tools, clocks, developer utilities, and bookmark hubs to your dashboard."
    >
      <div className="space-y-4 select-none">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search widgets by name or capability..."
              className="w-full bg-surface-secondary border border-border rounded-sm-card pl-9 pr-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            {WIDGET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {filteredItems.map((item) => {
            const isAdded = addedWidgetType === item.type;
            return (
              <div
                key={item.type}
                className="p-3.5 rounded-card bg-surface-secondary/50 hover:bg-surface-secondary border border-border hover:border-border-hover transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-sm-card bg-surface border border-border/80 flex items-center justify-center shrink-0">
                        {getIcon(item.iconName)}
                      </div>
                      <span className="font-heading font-semibold text-sm text-text-primary">
                        {item.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-text-muted uppercase px-1.5 py-0.5 rounded bg-surface border border-border/60">
                      {item.defaultColSpan === 12
                        ? 'Full Width'
                        : item.defaultColSpan === 6
                        ? 'Half Row'
                        : `${item.defaultColSpan} Cols`}
                    </span>
                  </div>

                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-text-muted capitalize">
                    {item.category.replace('-', ' ')}
                  </span>

                  <Button
                    size="sm"
                    variant={isAdded ? 'secondary' : 'primary'}
                    onClick={() => handleAdd(item.type)}
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    <span>{isAdded ? 'Added to Grid!' : 'Add Widget'}</span>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
