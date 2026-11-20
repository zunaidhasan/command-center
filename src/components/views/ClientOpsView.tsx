import React, { useState } from 'react';
import {
  Briefcase,
  ExternalLink,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  ChevronRight,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useClientOpsStore } from '@/store/useClientOpsStore';
import { ClientLead, PipelineStage, PortfolioReference } from '@/types/client-ops';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';

export const ClientOpsView: React.FC = () => {
  const {
    leads,
    references,
    addLead,
    updateLead,
    moveLeadStage,
    deleteLead,
    addReference,
    selectedCategory,
    setSelectedCategory,
    referenceSearchQuery,
    setReferenceSearchQuery,
  } = useClientOpsStore();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'references'>('pipeline');
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ClientLead | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New lead form
  const [clientName, setClientName] = useState('');
  const [company, setCompany] = useState('');
  const [platform, setPlatform] = useState<ClientLead['platform']>('Fiverr');
  const [projectTitle, setProjectTitle] = useState('');
  const [stage, setStage] = useState<PipelineStage>('new_inquiry');
  const [value, setValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');

  const PIPELINE_COLUMNS: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'new_inquiry', label: 'New Inquiries', color: '#1EA7FF' },
    { id: 'pending_reply', label: 'Pending Reply', color: '#FFB21A' },
    { id: 'proposal_sent', label: 'Proposals Sent', color: '#B66BFF' },
    { id: 'active_order', label: 'Active Orders', color: '#18D879' },
    { id: 'in_progress', label: 'In Progress', color: '#EF233C' },
    { id: 'delivered', label: 'Delivered', color: '#10B981' },
  ];

  const CLIENT_LAUNCHERS = [
    { name: 'Fiverr Dashboard', url: 'https://fiverr.com/manage_orders', icon: 'Fi', color: '#1dbf73' },
    { name: 'Fiverr Inbox', url: 'https://fiverr.com/inbox', icon: 'In', color: '#1dbf73' },
    { name: 'LinkedIn Profile', url: 'https://www.linkedin.com/in/zunaid-ishan/', icon: 'Li', color: '#0077b5' },
    { name: 'Sardar IT Slack', url: 'https://sardarit.slack.com', icon: 'Sl', color: '#4a154b' },
    { name: 'Airtable Hub', url: 'https://airtable.com', icon: 'At', color: '#fcb400' },
  ];

  const handleOpenAddLead = (colStage: PipelineStage) => {
    setEditingLead(null);
    setClientName('');
    setCompany('');
    setPlatform('Fiverr');
    setProjectTitle('');
    setStage(colStage);
    setValue('');
    setDeadline('');
    setNotes('');
    setLeadModalOpen(true);
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !projectTitle.trim()) return;

    if (editingLead) {
      await updateLead(editingLead.id, {
        clientName: clientName.trim(),
        company: company.trim() || undefined,
        platform,
        projectTitle: projectTitle.trim(),
        stage,
        value: value.trim() || '$0',
        deadline: deadline.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else {
      await addLead({
        clientName: clientName.trim(),
        company: company.trim() || undefined,
        platform,
        projectTitle: projectTitle.trim(),
        stage,
        value: value.trim() || '$0',
        deadline: deadline.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }

    setLeadModalOpen(false);
  };

  const handleCopyPitch = (ref: PortfolioReference) => {
    const pitch = `Portfolio Reference: ${ref.projectName}\nLive URL: ${ref.url}\nTech: ${ref.technology.join(', ')}\nFeatures: ${ref.features.join('; ')}\nSummary: ${ref.description}`;
    navigator.clipboard.writeText(pitch);
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // References filtering
  const categories = ['All', ...Array.from(new Set(references.map((r) => r.category)))];
  const filteredReferences = references.filter((r) => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesQuery =
      !referenceSearchQuery ||
      r.projectName.toLowerCase().includes(referenceSearchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(referenceSearchQuery.toLowerCase()) ||
      r.technology.some((t) => t.toLowerCase().includes(referenceSearchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
            Client Operations & Sales Pipeline
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage inquiries, active Fiverr contracts, proposals, and Sardar IT reference showcases.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-sm-card text-xs font-medium transition-all ${
              activeTab === 'pipeline'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            Sales Pipeline
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`px-3 py-1.5 rounded-sm-card text-xs font-medium transition-all ${
              activeTab === 'references'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            Sardar IT Reference Engine
          </button>
        </div>
      </div>

      {/* Quick Launchers Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {CLIENT_LAUNCHERS.map((launcher, i) => (
          <a
            key={i}
            href={launcher.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-card bg-surface/90 hover:bg-surface border border-border hover:border-accent-client/40 transition-all shadow-subtle group"
          >
            <div
              className="w-8 h-8 rounded-sm-card flex items-center justify-center font-heading font-bold text-xs text-white shrink-0 group-hover:scale-105 transition-transform"
              style={{ backgroundColor: launcher.color }}
            >
              {launcher.icon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-medium text-text-primary truncate block group-hover:text-accent-client transition-colors">
                {launcher.name}
              </span>
              <span className="text-[10px] font-mono text-text-muted flex items-center gap-1">
                <span>Launch</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </span>
            </div>
          </a>
        ))}
      </div>

      {/* TAB 1: Sales Pipeline Kanban */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-text-muted">
              Drag or move cards across stages to track active client deal flows.
            </span>
            <Button variant="primary" size="sm" onClick={() => handleOpenAddLead('new_inquiry')}>
              <Plus className="w-4 h-4" />
              <span>Add Deal / Inquiry</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-4">
            {PIPELINE_COLUMNS.map((col) => {
              const colLeads = leads.filter((l) => l.stage === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-surface/70 border border-border/80 rounded-card p-3 flex flex-col justify-between min-h-[420px]"
                >
                  <div>
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: col.color }}
                        />
                        <span className="text-xs font-heading font-semibold text-text-primary">
                          {col.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-surface-secondary text-text-muted px-1.5 py-0.2 rounded">
                        {colLeads.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2">
                      {colLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="p-2.5 rounded-sm-card bg-surface-secondary/80 hover:bg-surface-secondary border border-border/80 hover:border-accent-client/40 transition-all text-xs shadow-subtle group"
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <span className="font-heading font-semibold text-text-primary truncate">
                              {lead.clientName}
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold shrink-0">
                              {lead.value}
                            </span>
                          </div>

                          <p className="text-[11px] text-text-secondary truncate mb-2">
                            {lead.projectTitle}
                          </p>

                          <div className="flex items-center justify-between text-[10px] font-mono text-text-muted pt-1 border-t border-border/40">
                            <span className="bg-surface px-1.5 py-0.5 rounded text-text-secondary">
                              {lead.platform}
                            </span>
                            {lead.deadline && <span>{lead.deadline}</span>}
                          </div>

                          {/* Quick Stage Mover buttons on hover */}
                          <div className="pt-2 mt-2 border-t border-border/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <select
                              value={lead.stage}
                              onChange={(e) =>
                                moveLeadStage(lead.id, e.target.value as PipelineStage)
                              }
                              className="text-[10px] bg-surface text-text-secondary rounded px-1.5 py-0.5 border border-border"
                            >
                              {PIPELINE_COLUMNS.map((c) => (
                                <option key={c.id} value={c.id}>
                                  Move: {c.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => deleteLead(lead.id)}
                              className="text-[10px] text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}

                      {colLeads.length === 0 && (
                        <div className="py-8 text-center text-[11px] text-text-muted border border-dashed border-border/60 rounded-sm-card">
                          No items
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Add button inside column */}
                  <button
                    onClick={() => handleOpenAddLead(col.id)}
                    className="w-full mt-2 py-1 text-center text-[11px] font-medium text-text-muted hover:text-text-primary hover:bg-surface-secondary rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Sardar IT Reference Engine */}
      {activeTab === 'references' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-80">
              <Input
                value={referenceSearchQuery}
                onChange={(e) => setReferenceSearchQuery(e.target.value)}
                placeholder="Search portfolio cases & tech stacks..."
                icon={<Search className="w-4 h-4" />}
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* References Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredReferences.map((ref) => {
              const isCopied = copiedId === ref.id;

              return (
                <div
                  key={ref.id}
                  className="bg-surface/90 border border-border hover:border-accent-client/40 rounded-card p-5 shadow-card transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-heading font-bold text-base text-text-primary">
                        {ref.projectName}
                      </h4>
                      <span className="text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-pill">
                        {ref.status}
                      </span>
                    </div>

                    <p className="text-xs text-text-secondary mb-3 leading-relaxed">
                      {ref.description}
                    </p>

                    {/* Features checklist */}
                    <div className="space-y-1 mb-3">
                      {ref.features.map((feat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-[11px] text-text-muted"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-client" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ref.technology.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono bg-surface-secondary text-text-secondary px-2 py-0.5 rounded border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-surface-secondary hover:bg-surface text-text-primary text-xs font-medium border border-border transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Site</span>
                    </a>

                    <Button
                      variant={isCopied ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleCopyPitch(ref)}
                      className="text-xs"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Pitch Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Client Pitch</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {leadModalOpen && (
        <Modal
          isOpen={leadModalOpen}
          onClose={() => setLeadModalOpen(false)}
          title={editingLead ? 'Edit Client Deal' : 'Add Client Deal'}
          description="Track incoming project opportunities and milestones."
          maxWidth="sm"
        >
          <form onSubmit={handleSaveLead} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Client / Contact Name
              </label>
              <Input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Alexander Vance"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Project Title / Scope
              </label>
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. AI Video Upscaling Dashboard"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as ClientLead['platform'])}
                  className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="Fiverr">Fiverr</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Slack">Slack</option>
                  <option value="Direct">Direct Client</option>
                  <option value="Referral">Referral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Estimated Value
                </label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="$500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Pipeline Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as PipelineStage)}
                  className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2 focus:outline-none focus:border-primary"
                >
                  {PIPELINE_COLUMNS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Deadline
                </label>
                <Input
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="2025-11-25"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Notes / Next Action
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Client approved wireframe, waiting on API keys."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setLeadModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingLead ? 'Save Changes' : 'Create Deal'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
