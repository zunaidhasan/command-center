import React, { useState } from 'react';
import { Zap, Plus, ExternalLink, ChevronRight, X } from 'lucide-react';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { QuickLink } from '@/types/analytics';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

export const QuickLinksStrip: React.FC = () => {
  const { quickLinks, addQuickLink, deleteQuickLink } = useAnalyticsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    await addQuickLink({
      title: newTitle.trim(),
      url,
    });
    setNewTitle('');
    setNewUrl('');
  };

  return (
    <>
      <div className="bg-surface/90 hover:bg-surface border border-border hover:border-amber-500/40 rounded-card p-4 transition-all duration-200 shadow-subtle flex flex-col justify-between group select-none h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            <span className="text-xs font-semibold text-text-primary">
              Quick Links
            </span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            title="Manage Quick Links"
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Link Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 max-w-full">
          {quickLinks.slice(0, 4).map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-sm-card bg-surface-secondary/80 hover:bg-surface-secondary border border-border/80 hover:border-amber-500/40 text-xs font-medium text-text-secondary hover:text-text-primary transition-all whitespace-nowrap shadow-sm hover:shadow"
            >
              {link.title}
            </a>
          ))}
        </div>

        <div className="flex items-center justify-between text-[11px] font-mono text-text-muted pt-1 border-t border-border/40">
          <span>{quickLinks.length} configured</span>
          <button
            onClick={() => setModalOpen(true)}
            className="hover:text-primary transition-colors"
          >
            Edit list →
          </button>
        </div>
      </div>

      {/* Quick Links Manager Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Quick Links Shortcuts"
          description="Manage your fast access URLs on the bottom dashboard strip."
          maxWidth="sm"
        >
          <div className="space-y-4">
            {/* Add new link form */}
            <form onSubmit={handleAddLink} className="space-y-2 pb-3 border-b border-border">
              <span className="text-xs font-medium text-text-secondary">Add New Quick Link</span>
              <div className="flex gap-2">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Title (e.g. Jira)"
                  className="flex-1"
                />
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="URL (e.g. jira.com)"
                  className="flex-1"
                />
                <Button type="submit" variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Existing links list */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {quickLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 rounded-sm-card bg-surface-secondary/50 border border-border/60 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-medium text-text-primary truncate">{link.title}</div>
                    <div className="text-[10px] font-mono text-text-muted truncate">{link.url}</div>
                  </div>
                  <button
                    onClick={() => deleteQuickLink(link.id)}
                    className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
