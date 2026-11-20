import React from 'react';
import { TrendingUp, ArrowUpRight } from 'lucide-react';

export const QuickStatsChart: React.FC = () => {
  return (
    <div className="bg-surface/80 rounded-card border border-border/80 p-3.5 flex flex-col justify-between h-full shadow-subtle group hover:border-emerald-500/40 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Quick Stats</span>
        </div>
        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="my-2">
        <div className="font-heading font-bold text-2xl text-emerald-400 tracking-tight">
          +24%
        </div>
        <p className="text-[11px] font-mono text-text-muted">This Month</p>
      </div>

      {/* SVG Glowing Sparkline */}
      <div className="w-full h-10 mt-1 relative overflow-hidden">
        <svg
          className="w-full h-full overflow-visible"
          viewBox="0 0 160 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18D879" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#18D879" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#18D879" floodOpacity="0.6" />
            </filter>
          </defs>
          {/* Gradient Area under line */}
          <path
            d="M0 32 Q 30 35, 55 24 T 110 18 T 160 8 L 160 40 L 0 40 Z"
            fill="url(#sparklineGrad)"
          />
          {/* Glowing Line */}
          <path
            d="M0 32 Q 30 35, 55 24 T 110 18 T 160 8"
            stroke="#18D879"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#glowGreen)"
          />
        </svg>
      </div>
    </div>
  );
};
