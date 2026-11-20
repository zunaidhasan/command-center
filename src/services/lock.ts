import { FailedAttempt, LockConfig, LockReason } from '@/types/lock';
import { StorageAdapter } from '@/services/storage';

/**
 * Browser Lock persistence + crypto helpers.
 *
 * Key material never leaves the device: passwords are stretched with
 * PBKDF2-SHA256 (Web Crypto) using a per-install random salt.
 */

export const LOCK_STORAGE_KEY = 'lock_config';
export const DEFAULT_ITERATIONS = 210_000;
export const PASSWORD_MIN_LENGTH = 6;
export const MAX_TRACKED_ATTEMPTS = 50;

export const DEFAULT_LOCK_CONFIG: LockConfig = {
  enabled: false,
  locked: false,
  passwordHash: null,
  salt: null,
  iterations: DEFAULT_ITERATIONS,
  autoLockMinutes: 5,
  lockOnStartup: true,
  guardTabs: true,
  blockSensitivePages: true,
  maxAttempts: 5,
  lockoutSeconds: 60,
  consecutiveFailures: 0,
  failedAttempts: [],
  lockoutUntil: 0,
  lockReason: 'unknown',
  createdAt: null,
  lastUnlockedAt: null,
  updatedAt: 0,
};

const encoder = new TextEncoder();

/* ------------------------------------------------------------------ */
/* Base64 / crypto primitives                                          */
/* ------------------------------------------------------------------ */

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function getSubtle(): SubtleCrypto {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error(
      'Web Crypto is unavailable. The browser lock requires a secure context (chrome-extension:// or https).',
    );
  }
  return subtle;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return bytesToBase64(bytes);
}

export async function derivePasswordHash(
  password: string,
  salt: string,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<string> {
  const subtle = getSubtle();
  const keyMaterial = await subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );

  const bits = await subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBytes(salt) as unknown as BufferSource,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );

  return bytesToBase64(new Uint8Array(bits));
}

export async function createPasswordRecord(
  password: string,
  iterations: number = DEFAULT_ITERATIONS,
): Promise<{ salt: string; passwordHash: string; iterations: number }> {
  const salt = generateSalt();
  const passwordHash = await derivePasswordHash(password, salt, iterations);
  return { salt, passwordHash, iterations };
}

export async function verifyPassword(password: string, config: LockConfig): Promise<boolean> {
  if (!config.passwordHash || !config.salt) return false;
  const candidate = await derivePasswordHash(password, config.salt, config.iterations);
  return timingSafeEqual(candidate, config.passwordHash);
}

/* ------------------------------------------------------------------ */
/* Validation + pure state helpers                                     */
/* ------------------------------------------------------------------ */

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }
  if (password.length > 200) {
    return 'Password must be 200 characters or fewer.';
  }
  return null;
}

export function passwordStrength(password: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

  const labels = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'] as const;
  const clamped = Math.min(score, 4) as 0 | 1 | 2 | 3 | 4;
  return { score: clamped, label: labels[clamped] };
}

export function getRemainingLockoutMs(config: LockConfig, now: number = Date.now()): number {
  if (!config.lockoutUntil) return 0;
  return Math.max(0, config.lockoutUntil - now);
}

/** Applies a failed unlock attempt, including lockout escalation. */
export function applyFailedAttempt(
  config: LockConfig,
  reason: LockReason,
  now: number = Date.now(),
): LockConfig {
  const attempt: FailedAttempt = { timestamp: now, reason };
  const failedAttempts = [attempt, ...config.failedAttempts].slice(0, MAX_TRACKED_ATTEMPTS);
  const consecutiveFailures = config.consecutiveFailures + 1;
  const lockedOut = consecutiveFailures >= config.maxAttempts;

  return {
    ...config,
    failedAttempts,
    consecutiveFailures: lockedOut ? 0 : consecutiveFailures,
    lockoutUntil: lockedOut ? now + config.lockoutSeconds * 1000 : config.lockoutUntil,
    updatedAt: now,
  };
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

export function normalizeLockConfig(saved: Partial<LockConfig> | null | undefined): LockConfig {
  const merged: LockConfig = { ...DEFAULT_LOCK_CONFIG, ...(saved ?? {}) };

  // Guard against corrupt / partial records.
  merged.failedAttempts = Array.isArray(merged.failedAttempts)
    ? merged.failedAttempts.filter((a) => typeof a?.timestamp === 'number').slice(0, MAX_TRACKED_ATTEMPTS)
    : [];
  merged.iterations = Number.isFinite(merged.iterations) && merged.iterations > 0
    ? merged.iterations
    : DEFAULT_ITERATIONS;
  merged.maxAttempts = Math.max(1, Number(merged.maxAttempts) || DEFAULT_LOCK_CONFIG.maxAttempts);
  merged.lockoutSeconds = Math.max(5, Number(merged.lockoutSeconds) || DEFAULT_LOCK_CONFIG.lockoutSeconds);
  merged.autoLockMinutes = Math.max(0, Number(merged.autoLockMinutes) || 0);

  // A lock cannot be considered enabled without a password record.
  if (!merged.passwordHash || !merged.salt) {
    merged.enabled = false;
    merged.locked = false;
  }

  return merged;
}

export async function loadLockConfig(): Promise<LockConfig> {
  const saved = await StorageAdapter.get<Partial<LockConfig> | null>(LOCK_STORAGE_KEY, null);
  return normalizeLockConfig(saved);
}

export async function saveLockConfig(config: LockConfig): Promise<LockConfig> {
  const next = { ...config, updatedAt: Date.now() };
  await StorageAdapter.set(LOCK_STORAGE_KEY, next);
  return next;
}
