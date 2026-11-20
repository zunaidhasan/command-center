import React, { useEffect } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LockScreen } from '@/components/lock/LockScreen';
import { useLockStore } from '@/store/useLockStore';
import { useAutoLock } from '@/hooks/useAutoLock';

/**
 * Boot splash shown while the persisted lock record is read. Rendering this
 * before the dashboard guarantees no workspace data is painted until we know
 * whether the session must stay locked.
 */
const BootSplash: React.FC = () => (
  <div className="fixed inset-0 z-[200] flex min-h-screen flex-col items-center justify-center bg-[#05060A] select-none">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_40px_-10px_rgba(239,35,60,0.6)]">
      <LockKeyhole className="h-6 w-6 text-primary" />
    </div>
    <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
      Verifying secure session
    </p>
    <div className="mt-3 h-0.5 w-28 overflow-hidden rounded-full bg-white/10">
      <div className="h-full w-1/2 animate-pulse rounded-full bg-primary/70" />
    </div>
    <p className="mt-8 flex items-center gap-1.5 font-mono text-[10px] text-emerald-400/60">
      <ShieldCheck className="h-3.5 w-3.5" />
      ZH Labs Command Center
    </p>
  </div>
);

export function App() {
  const isLoading = useLockStore((state) => state.isLoading);
  const locked = useLockStore((state) => state.config.locked);
  const initLock = useLockStore((state) => state.initLock);

  useEffect(() => {
    void initLock();
  }, [initLock]);

  useAutoLock();

  if (isLoading) return <BootSplash />;
  if (locked) return <LockScreen />;

  return <AppLayout />;
}

export default App;
