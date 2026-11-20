/**
 * Browser Lock domain types.
 *
 * Security model: the password is never stored. Only a PBKDF2-SHA256 derived
 * hash plus a random salt is persisted in chrome.storage.local. The lock is a
 * local access barrier for this browser profile — it is not disk encryption.
 */

export type LockReason = 'manual' | 'idle' | 'startup' | 'unknown';

export type UnlockFailureReason = 'invalid' | 'locked-out' | 'not-enabled' | 'weak-password';

export interface FailedAttempt {
  /** Unix epoch (ms) of the failed password check. */
  timestamp: number;
  /** What triggered the lock that this attempt was made against. */
  reason: LockReason;
}

export interface LockConfig {
  enabled: boolean;
  locked: boolean;
  passwordHash: string | null;
  salt: string | null;
  iterations: number;
  /** 0 disables the idle auto-lock timer. */
  autoLockMinutes: number;
  lockOnStartup: boolean;
  /** Redirect every tab back to the lock page while locked. */
  guardTabs: boolean;
  /** While locked, also redirect browser-internal (chrome://) pages. */
  blockSensitivePages: boolean;
  maxAttempts: number;
  lockoutSeconds: number;
  /** Failures since the last successful unlock — drives the lockout. */
  consecutiveFailures: number;
  /** Rolling security log (newest first, capped). */
  failedAttempts: FailedAttempt[];
  /** Epoch ms until which unlock attempts are refused. 0 = not locked out. */
  lockoutUntil: number;
  lockReason: LockReason;
  createdAt: number | null;
  lastUnlockedAt: number | null;
  updatedAt: number;
}

export interface UnlockResult {
  ok: boolean;
  reason?: UnlockFailureReason;
  attemptsLeft?: number;
  lockoutUntil?: number;
}
