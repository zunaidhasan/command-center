import React from 'react';
import {
  BarChart2,
  TrendingUp,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  GitCommit,
} from 'lucide-react';
import { GithubIcon } from '@/components/common/BrandIcons';
import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useProductivityStore } from '@/store/useProductivityStore';
import { useProjectStore } from '@/store/useProjectStore';
import { MetricCardsRow } from '@/components/widgets/MetricCardsRow';

export const AnalyticsView: React.FC = () => {
  const { metrics } = useAnalyticsStore();
  const { tasks, pomodoroSessionsCompleted } = useProductivityStore();
  const { projects } = useProjectStore();

  const completedTasksCount = tasks.filter((t) => t.completed).length;
  const pendingTasksCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="pb-4 border-b border-border">
        <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
          Operational Analytics & Insights
        </h2>
        <p className="text-xs text-text-secondary mt-0.5">
          High-level performance monitoring, delivery velocity, and local telemetry.
        </p>
      </div>

      {/* Main Metric Cards */}
      <MetricCardsRow />

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Productivity Completion Rate */}
        <div className="bg-surface/90 border border-border rounded-card p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base text-text-primary">
              Task Velocity & Completion
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              {tasks.length > 0
                ? `${Math.round((completedTasksCount / tasks.length) * 100)}% Completed`
                : '0%'}
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-surface-secondary overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{
                width: `${tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
            <div className="p-3 rounded-card bg-surface-secondary/50 border border-border/60">
              <span className="text-text-muted block text-[10px] font-mono">TOTAL TASKS</span>
              <span className="font-heading font-bold text-lg text-text-primary">
                {tasks.length}
              </span>
            </div>
            <div className="p-3 rounded-card bg-surface-secondary/50 border border-border/60">
              <span className="text-text-muted block text-[10px] font-mono">COMPLETED</span>
              <span className="font-heading font-bold text-lg text-emerald-400">
                {completedTasksCount}
              </span>
            </div>
            <div className="p-3 rounded-card bg-surface-secondary/50 border border-border/60">
              <span className="text-text-muted block text-[10px] font-mono">PENDING</span>
              <span className="font-heading font-bold text-lg text-amber-400">
                {pendingTasksCount}
              </span>
            </div>
          </div>
        </div>

        {/* Focus Sessions & Deep Work */}
        <div className="bg-surface/90 border border-border rounded-card p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base text-text-primary">
              Deep Work & Focus Time
            </h3>
            <span className="text-xs font-mono text-primary">
              {pomodoroSessionsCompleted * 25} Minutes Recorded
            </span>
          </div>

          <p className="text-xs text-text-secondary leading-relaxed">
            Completed Pomodoro focus sprints for today. Research demonstrates that uninterrupted 25-minute sprints enhance code architecture and problem-solving quality.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-card bg-surface-secondary/50 border border-border/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                {pomodoroSessionsCompleted}
              </div>
              <div>
                <span className="text-[10px] font-mono text-text-muted block">POMO SESSIONS</span>
                <span className="text-xs font-medium text-text-primary">Completed Today</span>
              </div>
            </div>

            <div className="p-3 rounded-card bg-surface-secondary/50 border border-border/60 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                {projects.length}
              </div>
              <div>
                <span className="text-[10px] font-mono text-text-muted block">LIVE DEPLOYMENTS</span>
                <span className="text-xs font-medium text-text-primary">Monitored</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Activity Overview */}
      <div className="bg-surface/90 border border-border rounded-card p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GithubIcon className="w-5 h-5 text-text-primary" />
            <h3 className="font-heading font-semibold text-base text-text-primary">
              GitHub Engineering Velocity (@zunaidhasan)
            </h3>
          </div>
          <a
            href="https://github.com/zunaidhasan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-accent-engineering hover:underline flex items-center gap-1"
          >
            <span>Open Profile</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Activity Heatmap Grid Simulation */}
        <div>
          <span className="text-[11px] font-mono text-text-muted block mb-2">
            Recent Commit Cadence (Simulated Matrix)
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {Array.from({ length: 28 }).map((_, i) => {
              const intensity = (i * 7) % 5;
              const bgColors = [
                'bg-surface-secondary',
                'bg-emerald-950 text-emerald-300',
                'bg-emerald-800 text-emerald-200',
                'bg-emerald-600 text-white',
                'bg-emerald-400 text-black',
              ];
              return (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-sm ${bgColors[intensity]} shrink-0 transition-transform hover:scale-125`}
                  title={`Day ${i + 1}: ${intensity * 3} contributions`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
