import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock3,
  History,
  KeyRound,
  ListChecks,
  LoaderCircle,
  Lock,
  LockKeyhole,
  MonitorOff,
  ShieldCheck,
  ShieldOff,
  TimerReset,
  Trash2,
} from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useLockStore } from '@/store/useLockStore';
import { passwordStrength } from '@/services/lock';
import { StorageAdapter } from '@/services/storage';
import { LockReason } from '@/types/lock';

const AUTO_LOCK_OPTIONS = [
  { value: 0, label: 'Off' },
  { value: 1, label: '1 min' },
  { value: 5, label: '5 min' },
  { value: 10, label: '10 min' },
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 60, label: '60 min' },
];

const REASON_LABEL: Record<LockReason, string> = {
  manual: 'Manual lock',
  idle: 'Idle timeout',
  startup: 'Startup lock',
  unknown: 'Locked session',
};

function formatAttemptTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const Toggle: React.FC<{
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors disabled:opacity-40 ${
      checked ? 'border-primary bg-primary' : 'border-border bg-surface-tertiary'
    }`}
  >
    <span
      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-[18px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const SettingRow: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}> = ({ icon: Icon, title, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-4 rounded-card border border-border bg-surface-secondary/40 p-3.5">
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
      <div>
        <span className="block text-xs font-semibold text-text-primary">{title}</span>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-secondary">{description}</p>
      </div>
    </div>
    <Toggle checked={checked} onChange={onChange} label={title} />
  </div>
);

/**
 * Browser Lock control panel, rendered inside Settings → Browser Lock & Security.
 */
export const SecuritySettings: React.FC = () => {
  const {
    config,
    isBusy,
    enableLock,
    disableLock,
    changePassword,
    lockNow,
    setAutoLockMinutes,
    setLockOnStartup,
    setGuardTabs,
    setBlockSensitivePages,
    clearFailedAttempts,
    clearLockout,
  } = useLockStore();

  const [enablePassword, setEnablePassword] = useState('');
  const [enableConfirmation, setEnableConfirmation] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newConfirmation, setNewConfirmation] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const isExtension = StorageAdapter.isExtension();
  const lockoutRemainingMs = Math.max(0, config.lockoutUntil - now);
  const strength = passwordStrength(enablePassword);

  useEffect(() => {
    if (!config.lockoutUntil) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [config.lockoutUntil]);

  const resetFeedback = () => setFeedback(null);

  const handleEnable = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (enablePassword !== enableConfirmation) {
      setFeedback({ kind: 'error', message: 'Passwords do not match.' });
      return;
    }

    const result = await enableLock(enablePassword, enableConfirmation);
    if (result.ok) {
      setEnablePassword('');
      setEnableConfirmation('');
      setFeedback({ kind: 'success', message: 'Browser lock enabled. Your password hash is stored locally.' });
    } else if (result.reason === 'weak-password') {
      setFeedback({ kind: 'error', message: 'Use at least 6 characters for the lock password.' });
    } else {
      setFeedback({ kind: 'error', message: 'Could not enable the browser lock.' });
    }
  };

  const handleDisable = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    const result = await disableLock(disablePassword);
    if (result.ok) {
      setDisablePassword('');
      setFeedback({ kind: 'success', message: 'Browser lock disabled.' });
    } else if (result.reason === 'locked-out') {
      setFeedback({ kind: 'error', message: 'Too many failed attempts. Wait for the lockout to expire.' });
    } else {
      setFeedback({ kind: 'error', message: 'Incorrect password.' });
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    resetFeedback();

    if (newPassword !== newConfirmation) {
      setFeedback({ kind: 'error', message: 'New passwords do not match.' });
      return;
    }

    const result = await changePassword(currentPassword, newPassword, newConfirmation);
    if (result.ok) {
      setCurrentPassword('');
      setNewPassword('');
      setNewConfirmation('');
      setShowChangeForm(false);
      setFeedback({ kind: 'success', message: 'Lock password updated.' });
    } else if (result.reason === 'weak-password') {
      setFeedback({ kind: 'error', message: 'New password must be at least 6 characters.' });
    } else if (result.reason === 'locked-out') {
      setFeedback({ kind: 'error', message: 'Too many failed attempts. Wait for the lockout to expire.' });
    } else {
      setFeedback({ kind: 'error', message: 'Current password is incorrect.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h3 className="font-heading font-bold text-lg text-text-primary">Browser Lock & Security</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Password-protect this browser session, guard tabs, and monitor unlock attempts.
          </p>
        </div>
        {config.enabled && !config.locked && (
          <Button variant="primary" size="sm" onClick={() => lockNow('manual')}>
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Now</span>
          </Button>
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-3 rounded-card border text-xs font-mono flex items-start gap-2 ${
            feedback.kind === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {feedback.kind === 'success' ? (
            <ShieldCheck className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {!isExtension && (
        <div className="p-3 rounded-card border border-amber-500/30 bg-amber-500/10 text-[11px] leading-relaxed text-amber-300 flex items-start gap-2">
          <MonitorOff className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Running in web mode. The password barrier and idle timer work, but tab guarding, browser
            startup locking, and sensitive-page blocking require the installed Chrome extension.
          </span>
        </div>
      )}

      {/* Status */}
      <div className="flex flex-wrap items-center gap-4 rounded-card border border-border bg-surface-secondary/40 p-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
            config.enabled
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-border bg-surface text-text-muted'
          }`}
        >
          {config.enabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-text-primary">
              {config.enabled ? 'Browser Lock Armed' : 'Browser Lock Disabled'}
            </span>
            <Badge variant={config.enabled ? 'success' : 'outline'}>
              {config.enabled ? (config.locked ? 'Locked' : 'Unlocked') : 'Off'}
            </Badge>
          </div>
          <p className="mt-0.5 text-[11px] text-text-secondary">
            {config.enabled
              ? `PBKDF2-SHA256 · ${config.iterations.toLocaleString()} iterations · ${
                  config.autoLockMinutes > 0 ? `auto-lock ${config.autoLockMinutes}m` : 'idle timer off'
                }`
              : 'Set a password below to enable the session barrier.'}
          </p>
        </div>
        {config.enabled && config.lastUnlockedAt && (
          <div className="text-right font-mono text-[10px] text-text-muted">
            <div className="uppercase tracking-wider">Last unlocked</div>
            <div>{new Date(config.lastUnlockedAt).toLocaleString()}</div>
          </div>
        )}
      </div>

      {/* Enable form */}
      {!config.enabled && (
        <form
          onSubmit={handleEnable}
          className="space-y-4 rounded-card border border-border bg-surface-secondary/40 p-4"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <KeyRound className="w-4 h-4 text-primary" />
            <span>Set Lock Password</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-text-muted mb-1 uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                value={enablePassword}
                onChange={(event) => setEnablePassword(event.target.value)}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-text-muted mb-1 uppercase tracking-wider">
                Confirm password
              </label>
              <Input
                type="password"
                value={enableConfirmation}
                onChange={(event) => setEnableConfirmation(event.target.value)}
                placeholder="Repeat password"
                autoComplete="new-password"
              />
            </div>
          </div>
          {enablePassword && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((index) => (
                  <span
                    key={index}
                    className={`h-1 w-8 rounded-full ${
                      index < strength.score
                        ? strength.score >= 3
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                        : 'bg-surface-tertiary'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
                {strength.label}
              </span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-text-muted">
              Only a salted hash is stored. There is no password recovery.
            </p>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isBusy || enablePassword.length === 0}
            >
              {isBusy ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              <span>Enable Browser Lock</span>
            </Button>
          </div>
        </form>
      )}

      {/* Auto-lock + protection */}
      {config.enabled && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TimerReset className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-semibold text-text-primary">Idle Auto-Lock Timer</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AUTO_LOCK_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAutoLockMinutes(option.value)}
                  className={`px-3 py-1.5 rounded-sm-card border text-xs font-medium transition-all ${
                    config.autoLockMinutes === option.value
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface-secondary text-text-secondary border-border hover:text-text-primary'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted">
              Locks the session after {config.autoLockMinutes > 0 ? `${config.autoLockMinutes} minutes` : 'inactivity is disabled'} of
              no keyboard or pointer activity.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-text-muted" />
              <span className="text-xs font-semibold text-text-primary">Protection Layers</span>
            </div>
            <SettingRow
              icon={MonitorOff}
              title="Lock on browser startup"
              description="Require the password the first time Chrome opens, before any workspace data is shown."
              checked={config.lockOnStartup}
              onChange={setLockOnStartup}
            />
            <SettingRow
              icon={LockKeyhole}
              title="Guard tabs & sessions"
              description="While locked, redirect every tab back to the lock screen. Original tab URLs are restored after unlock."
              checked={config.guardTabs}
              onChange={setGuardTabs}
            />
            <SettingRow
              icon={ShieldOff}
              title="Block sensitive Chrome pages"
              description="Deny chrome:// settings, history, passwords, extensions, and other browser-internal pages while locked."
              checked={config.blockSensitivePages}
              onChange={setBlockSensitivePages}
            />
          </div>

          {/* Password management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-card border border-border bg-surface-secondary/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <KeyRound className="w-4 h-4 text-text-muted" />
                  Change Password
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChangeForm((value) => !value);
                    resetFeedback();
                  }}
                >
                  {showChangeForm ? 'Cancel' : 'Update'}
                </Button>
              </div>
              {showChangeForm ? (
                <form onSubmit={handleChangePassword} className="space-y-2.5">
                  <Input
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Current password"
                    autoComplete="current-password"
                  />
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="New password"
                    autoComplete="new-password"
                  />
                  <Input
                    type="password"
                    value={newConfirmation}
                    onChange={(event) => setNewConfirmation(event.target.value)}
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isBusy || !currentPassword || !newPassword}
                  >
                    Save New Password
                  </Button>
                </form>
              ) : (
                <p className="text-[11px] leading-relaxed text-text-secondary">
                  Rotate the lock password. The salt is regenerated and prior failed-attempt lockouts
                  are cleared.
                </p>
              )}
            </div>

            <form
              onSubmit={handleDisable}
              className="rounded-card border border-red-500/25 bg-red-500/5 p-4 space-y-3"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-red-400">
                <ShieldOff className="w-4 h-4" />
                Disable Browser Lock
              </span>
              <p className="text-[11px] leading-relaxed text-text-muted">
                Confirm your password to remove the session barrier and delete the stored hash.
              </p>
              <Input
                type="password"
                value={disablePassword}
                onChange={(event) => setDisablePassword(event.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={isBusy || !disablePassword}
              >
                Disable Lock
              </Button>
            </form>
          </div>

          {/* Failed attempt monitoring */}
          <div className="rounded-card border border-border bg-surface-secondary/40 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                <ListChecks className="w-4 h-4 text-text-muted" />
                Failed Unlock Attempts
              </span>
              <div className="flex items-center gap-2">
                <Badge variant={config.consecutiveFailures > 0 ? 'warning' : 'default'}>
                  {config.consecutiveFailures}/{config.maxAttempts} until lockout
                </Badge>
                {config.failedAttempts.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFailedAttempts}>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </Button>
                )}
              </div>
            </div>

            {lockoutRemainingMs > 0 && (
              <div className="flex items-center justify-between rounded-sm-card border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-[11px] text-red-400">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Locked out after repeated failures
                </span>
                <span className="tabular-nums">{Math.ceil(lockoutRemainingMs / 1000)}s</span>
              </div>
            )}

            {config.failedAttempts.length === 0 && lockoutRemainingMs === 0 ? (
              <div className="flex items-center gap-2 rounded-sm-card border border-border/70 bg-surface/60 px-3 py-3 text-[11px] text-text-muted">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No failed unlock attempts recorded.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                {config.failedAttempts.slice(0, 8).map((attempt, index) => (
                  <div
                    key={`${attempt.timestamp}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-sm-card border border-border/70 bg-surface/60 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Clock3 className="w-3.5 h-3.5 shrink-0 text-red-400/80" />
                      <span className="truncate font-mono text-[11px] text-text-secondary">
                        Failed password check
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 font-mono text-[10px] text-text-muted">
                      <span className="hidden sm:inline">{REASON_LABEL[attempt.reason]}</span>
                      <span>{formatAttemptTime(attempt.timestamp)}</span>
                    </div>
                  </div>
                ))}
                {config.failedAttempts.length > 8 && (
                  <p className="pt-1 text-center font-mono text-[10px] text-text-muted">
                    +{config.failedAttempts.length - 8} older attempts
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <p className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <History className="w-3 h-3" />
                Log capped at 50 entries and stored on this device only.
              </p>
              {lockoutRemainingMs > 0 && (
                <Button variant="outline" size="sm" onClick={clearLockout}>
                  Clear lockout
                </Button>
              )}
            </div>
          </div>
        </>
      )}

      <p className="text-[11px] leading-relaxed text-text-muted">
        <span className="font-semibold text-text-secondary">Security scope:</span> this is a local
        session barrier, not disk encryption. It cannot block OS-level shortcuts such as
        <code className="mx-1 text-text-secondary">Ctrl+W</code> or DevTools, but every new tab,
        refreshed tab, and browser-internal page is immediately re-locked while the barrier is
        engaged.
      </p>
    </div>
  );
};
