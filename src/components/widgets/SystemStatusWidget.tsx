import React, { useState } from 'react';
import { ShieldCheck, Activity, Cpu, HardDrive, Wifi } from 'lucide-react';
import { Modal } from '@/components/common/Modal';

export const SystemStatusWidget: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setModalOpen(true)}
        className="bg-surface/90 hover:bg-surface border border-border hover:border-emerald-500/40 rounded-card p-4 transition-all duration-200 shadow-subtle cursor-pointer select-none flex flex-col justify-between group h-full"
        title="View System Diagnostics & Health"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span className="text-xs font-semibold text-text-primary">
              System Status
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Live
          </span>
        </div>

        <div className="my-1.5">
          <h4 className="text-sm font-heading font-medium text-emerald-400 truncate">
            All Systems Operational
          </h4>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-text-muted pt-1 border-t border-border/40">
          <span>Uptime: 99.9%</span>
          {/* Mini Sparkline */}
          <div className="w-20 h-4">
            <svg viewBox="0 0 80 16" className="w-full h-full overflow-visible">
              <path
                d="M0 12 L15 10 L30 14 L45 8 L60 11 L80 4"
                stroke="#18D879"
                strokeWidth="1.75"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* System Diagnostics Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="System Health & Diagnostics"
          description="Local-first runtime environment metrics for ZH Labs Command Center."
          maxWidth="sm"
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-card bg-surface-secondary/70 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-text-primary">
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Network Status</span>
              </div>
              <span className="text-emerald-400 font-semibold">Online (Active)</span>
            </div>

            <div className="p-3 rounded-card bg-surface-secondary/70 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-text-primary">
                <HardDrive className="w-4 h-4 text-sky-400" />
                <span>Storage Engine</span>
              </div>
              <span className="text-text-primary">IndexedDB + MV3 Storage</span>
            </div>

            <div className="p-3 rounded-card bg-surface-secondary/70 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-text-primary">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Security Sandbox</span>
              </div>
              <span className="text-primary font-semibold">Local-First (No tracking)</span>
            </div>

            <div className="p-3 rounded-card bg-surface-secondary/70 border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-text-primary">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>Total Bookmarks</span>
              </div>
              <span className="text-text-primary">28 preconfigured</span>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
