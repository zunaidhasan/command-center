import React, { useState } from 'react';
import { Quote, RefreshCw } from 'lucide-react';

const QUOTES = [
  {
    text: 'Great things happen when engineering meets purpose.',
    author: 'Zunaid Ishan',
  },
  {
    text: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
  },
  {
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
  },
  {
    text: 'Software is a great combination between artistry & engineering.',
    author: 'Bill Gates',
  },
  {
    text: 'Build. Automate. Grow.',
    author: 'ZH Labs Philosophy',
  },
];

export const DailyQuoteWidget: React.FC = () => {
  const [index, setIndex] = useState(0);

  const nextQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const current = QUOTES[index];

  return (
    <div
      onClick={nextQuote}
      className="relative overflow-hidden bg-surface/90 hover:bg-surface border border-border hover:border-border-hover rounded-card p-4 transition-all duration-200 shadow-subtle select-none flex items-center justify-between gap-3 group cursor-pointer h-full"
      title="Click to see next quote"
    >
      {/* Background Subtle Mountain peaks */}
      <svg
        className="absolute right-0 bottom-0 h-full w-48 text-[#141A25] opacity-35 pointer-events-none"
        viewBox="0 0 200 100"
        fill="currentColor"
        preserveAspectRatio="none"
      >
        <path d="M0 100 L40 60 L80 85 L120 40 L160 70 L200 20 L200 100 Z" />
      </svg>

      <div className="flex items-start gap-3 min-w-0 z-10">
        <div className="shrink-0 mt-0.5 text-primary font-serif font-black text-2xl leading-none">
          “
        </div>
        <div className="min-w-0">
          <p className="text-xs lg:text-sm font-medium text-text-primary italic leading-relaxed truncate-2-lines">
            "{current.text}"
          </p>
          <p className="text-[11px] font-mono text-text-muted mt-1">
            — {current.author}
          </p>
        </div>
      </div>

      <button
        onClick={nextQuote}
        title="Next quote"
        className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors shrink-0 z-10 opacity-0 group-hover:opacity-100"
      >
        <RefreshCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
