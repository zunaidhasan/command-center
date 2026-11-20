import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import { useLockStore } from '@/store/useLockStore';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

const REASON_COPY: Record<string, string> = {
  manual: 'Locked manually. Enter your password to resume this session.',
  idle: 'Auto-locked after a period of inactivity.',
  startup: 'Locked on browser startup. Verify your identity to continue.',
  unknown: 'This session is protected. Enter your password to continue.',
};

/**
 * Full-screen lock barrier. Rendered instead of the dashboard whenever the
 * persisted lock state is engaged, so no workspace data mounts before the
 * password is verified.
 */
export const LockScreen: React.FC = () => {
  const { config, unlock, isBusy } = useLockStore();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [lockoutUntil, setLockoutUntil] = useState(config.lockoutUntil || 0);
  const [now, setNow] = useState(() => Date.now());
  const [capsLock, setCapsLock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    [],
  );
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }),
    [],
  );

  // Clock + lockout countdown.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const lockoutRemainingMs = Math.max(0, lockoutUntil - now);
  const isLockedOut = lockoutRemainingMs > 0;
  const failedCount = config.failedAttempts.length;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || isSubmitting || isBusy || isLockedOut) return;

    setIsSubmitting(true);
    setError(null);

    const result = await unlock(password);

    if (result.ok) {
      // The store flips `locked` to false and the dashboard takes over.
      return;
    }

    setPassword('');

    if (result.reason === 'locked-out') {
      setLockoutUntil(result.lockoutUntil ?? Date.now() + config.lockoutSeconds * 1000);
      // The countdown itself communicates the lockout; clearing the text error
      // lets the form recover automatically when the timer expires.
      setError(null);
    } else {
      setAttemptsLeft(result.attemptsLeft ?? null);
      setError('Incorrect password. Access denied.');
    }

    setIsSubmitting(false);
    inputRef.current?.focus();
  };

  const trackCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (typeof event.getModifierState === 'function') {
      setCapsLock(event.getModifierState('CapsLock'));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center overflow-hidden bg-[#05060A] px-4 py-10 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lock-screen-title"
    >
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(65% 55% at 50% 0%, rgba(239,35,60,0.16) 0%, rgba(5,6,10,0) 70%), radial-gradient(45% 45% at 85% 90%, rgba(30,167,255,0.10) 0%, rgba(5,6,10,0) 70%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 35%, transparent 75%)',
        }}
      />

      <div className="relative w-full max-w-[420px]">
        <div className="mb-8 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-white/35">
          <span>ZH Labs — Command Center</span>
          <span className="flex items-center gap-1.5 text-emerald-400/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Secured
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B0E15]/95 p-7 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-9">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 shadow-[0_0_40px_-8px_rgba(239,35,60,0.55)]">
              <LockKeyhole className="h-7 w-7 text-primary" />
              <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B0E15]">
                {config.guardTabs ? (
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ShieldOff className="h-4 w-4 text-amber-400" />
                )}
              </span>
            </div>

            <h1
              id="lock-screen-title"
              className="font-heading text-2xl font-bold tracking-tight text-white"
            >
              Browser Locked
            </h1>
            <p className="mt-2 max-w-[300px] text-xs leading-relaxed text-white/50">
              {REASON_COPY[config.lockReason] ?? REASON_COPY.unknown}
            </p>

            <div className="mt-5 flex items-baseline gap-3 font-mono">
              <span className="text-2xl font-semibold text-white/90 tabular-nums">
                {timeFormatter.format(now)}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/35">
                {dateFormatter.format(now)}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-3">
            <label htmlFor="lock-password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <Input
                ref={inputRef}
                id="lock-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyUp={trackCapsLock}
                onKeyDown={trackCapsLock}
                placeholder="Enter password"
                autoComplete="current-password"
                aria-invalid={!!error}
                aria-describedby={error ? 'lock-error' : undefined}
                icon={<KeyRound className="h-4 w-4" />}
                disabled={isLockedOut || isSubmitting}
                className="!bg-[#11151D] !border-white/10 py-2.5 pr-11 text-sm text-white placeholder:text-white/25 focus:!border-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-white/35 transition-colors hover:text-white/80"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {capsLock && !isLockedOut && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-amber-400/80">
                Caps Lock is on
              </p>
            )}

            <div id="lock-error" aria-live="polite" className="min-h-[18px]">
              {isLockedOut ? (
                <p className="flex items-center justify-between font-mono text-[11px] text-red-400">
                  <span>Too many failed attempts</span>
                  <span className="tabular-nums">
                    retry in {Math.ceil(lockoutRemainingMs / 1000)}s
                  </span>
                </p>
              ) : error ? (
                <p className="font-mono text-[11px] text-red-400">
                  {error}
                  {typeof attemptsLeft === 'number' && attemptsLeft > 0 && (
                    <span className="text-white/40"> · {attemptsLeft} attempt{attemptsLeft === 1 ? '' : 's'} left</span>
                  )}
                </p>
              ) : failedCount > 0 ? (
                <p className="font-mono text-[11px] text-white/30">
                  {failedCount} failed unlock attempt{failedCount === 1 ? '' : 's'} recorded
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              disabled={isLockedOut || isSubmitting || isBusy || password.length === 0}
            >
              {isSubmitting || isBusy ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Verifying…</span>
                </>
              ) : (
                <>
                  <LockKeyhole className="h-4 w-4" />
                  <span>Unlock Session</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 border-t border-white/5 pt-4">
            <p className="text-center font-mono text-[10px] leading-relaxed text-white/25">
              {config.guardTabs
                ? 'All tabs are suspended until unlock. '
                : ''}
              Protected locally with PBKDF2-SHA256 · no recovery without your password.
            </p>
          </div>
        </div>

        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-white/20">
          Build · Automate · Grow
        </p>
      </div>
    </div>
  );
};
