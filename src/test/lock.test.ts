import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_LOCK_CONFIG,
  MAX_TRACKED_ATTEMPTS,
  applyFailedAttempt,
  createPasswordRecord,
  getRemainingLockoutMs,
  normalizeLockConfig,
  passwordStrength,
  validatePassword,
  verifyPassword,
} from '@/services/lock';
import { useLockStore } from '@/store/useLockStore';
import { LockConfig } from '@/types/lock';

const TEST_ITERATIONS = 1_000;

function configWith(overrides: Partial<LockConfig> = {}): LockConfig {
  return { ...DEFAULT_LOCK_CONFIG, enabled: true, ...overrides };
}

function resetStore(): void {
  useLockStore.setState({
    config: { ...DEFAULT_LOCK_CONFIG, failedAttempts: [] },
    isLoading: false,
    isBusy: false,
  });
}

describe('Lock crypto', () => {
  it('hashes passwords with PBKDF2 and verifies only the correct one', async () => {
    const record = await createPasswordRecord('correct horse', TEST_ITERATIONS);
    const config = configWith(record);

    expect(record.salt).toBeTruthy();
    expect(record.passwordHash).toBeTruthy();
    expect(record.passwordHash).not.toContain('correct horse');

    await expect(verifyPassword('correct horse', config)).resolves.toBe(true);
    await expect(verifyPassword('wrong horse', config)).resolves.toBe(false);
  });

  it('produces a unique salt and hash for identical passwords', async () => {
    const first = await createPasswordRecord('same-password', TEST_ITERATIONS);
    const second = await createPasswordRecord('same-password', TEST_ITERATIONS);

    expect(first.salt).not.toBe(second.salt);
    expect(first.passwordHash).not.toBe(second.passwordHash);
  });

  it('rejects verification when the stored record is missing', async () => {
    await expect(verifyPassword('anything', configWith())).resolves.toBe(false);
  });
});

describe('Password validation', () => {
  it('enforces the minimum length', () => {
    expect(validatePassword('12345')).toMatch(/at least/i);
    expect(validatePassword('123456')).toBeNull();
    expect(validatePassword('a'.repeat(201))).toMatch(/200/);
  });

  it('scores password strength', () => {
    expect(passwordStrength('ab').score).toBe(0);
    expect(passwordStrength('abcdefgh').score).toBe(1);
    expect(passwordStrength('Abcdefgh1234').score).toBe(4);
    expect(passwordStrength('Abcdefgh1234').label).toBe('Excellent');
  });
});

describe('Failed attempt handling', () => {
  it('tracks attempts and escalates into a lockout', () => {
    const base = configWith({ maxAttempts: 3, lockoutSeconds: 60 });

    const first = applyFailedAttempt(base, 'idle', 1_000);
    expect(first.consecutiveFailures).toBe(1);
    expect(first.failedAttempts[0]).toEqual({ timestamp: 1_000, reason: 'idle' });

    const second = applyFailedAttempt(first, 'idle', 2_000);
    expect(second.consecutiveFailures).toBe(2);
    expect(second.lockoutUntil).toBe(0);

    const third = applyFailedAttempt(second, 'idle', 3_000);
    expect(third.consecutiveFailures).toBe(0);
    expect(third.lockoutUntil).toBe(63_000);
    expect(third.failedAttempts).toHaveLength(3);

    expect(getRemainingLockoutMs(third, 3_000)).toBe(60_000);
    expect(getRemainingLockoutMs(third, 62_999)).toBe(1);
    expect(getRemainingLockoutMs(third, 63_000)).toBe(0);
  });

  it('caps the persisted log', () => {
    let config = configWith({ maxAttempts: 999 });
    for (let i = 0; i < MAX_TRACKED_ATTEMPTS + 15; i += 1) {
      config = applyFailedAttempt(config, 'manual', 1_000 + i);
    }
    expect(config.failedAttempts).toHaveLength(MAX_TRACKED_ATTEMPTS);
    expect(config.failedAttempts[0].timestamp).toBe(1_000 + MAX_TRACKED_ATTEMPTS + 14);
  });
});

describe('Config normalization', () => {
  it('disables the lock when no password record exists', () => {
    const normalized = normalizeLockConfig({ enabled: true, locked: true });
    expect(normalized.enabled).toBe(false);
    expect(normalized.locked).toBe(false);
  });

  it('repairs out-of-range values and drops corrupt attempts', () => {
    const normalized = normalizeLockConfig({
      enabled: true,
      passwordHash: 'hash',
      salt: 'salt',
      autoLockMinutes: -5,
      maxAttempts: 0,
      lockoutSeconds: 1,
      iterations: 0,
      failedAttempts: [{ bogus: true }, { timestamp: 42, reason: 'manual' }] as never,
    });

    expect(normalized.autoLockMinutes).toBe(0);
    expect(normalized.maxAttempts).toBe(DEFAULT_LOCK_CONFIG.maxAttempts);
    expect(normalized.lockoutSeconds).toBe(5);
    expect(normalized.iterations).toBe(DEFAULT_LOCK_CONFIG.iterations);
    expect(normalized.failedAttempts).toEqual([{ timestamp: 42, reason: 'manual' }]);
  });
});

describe('Lock store', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('enables, locks, records failures, and unlocks the session', async () => {
    const state = useLockStore.getState;

    const enabled = await state().enableLock('sup3r-secret', 'sup3r-secret');
    expect(enabled.ok).toBe(true);
    expect(state().config.enabled).toBe(true);
    expect(state().config.passwordHash).toBeTruthy();
    expect(state().config.passwordHash).not.toContain('sup3r-secret');

    await state().lockNow('manual');
    expect(state().config.locked).toBe(true);
    expect(state().config.lockReason).toBe('manual');

    const rejected = await state().unlock('nope-nope');
    expect(rejected.ok).toBe(false);
    expect(rejected.attemptsLeft).toBe(DEFAULT_LOCK_CONFIG.maxAttempts - 1);
    expect(state().config.failedAttempts).toHaveLength(1);
    expect(state().config.locked).toBe(true);

    const accepted = await state().unlock('sup3r-secret');
    expect(accepted.ok).toBe(true);
    expect(state().config.locked).toBe(false);
    expect(state().config.lockReason).toBe('unknown');
    expect(state().config.consecutiveFailures).toBe(0);
    expect(state().config.lastUnlockedAt).toBeTypeOf('number');
  });

  it('refuses weak or mismatched passwords', async () => {
    const state = useLockStore.getState;

    await expect(state().enableLock('abc', 'abc')).resolves.toMatchObject({
      ok: false,
      reason: 'weak-password',
    });
    await expect(state().enableLock('long-enough', 'different')).resolves.toMatchObject({
      ok: false,
      reason: 'invalid',
    });
    expect(state().config.enabled).toBe(false);
  });

  it('locks out after repeated failures and blocks valid passwords too', async () => {
    const state = useLockStore.getState;

    await state().enableLock('sup3r-secret', 'sup3r-secret');
    await state().lockNow('manual');
    useLockStore.setState({ config: { ...state().config, maxAttempts: 3 } });

    expect((await state().unlock('bad-1')).attemptsLeft).toBe(2);
    expect((await state().unlock('bad-2')).attemptsLeft).toBe(1);

    const lockedOut = await state().unlock('bad-3');
    expect(lockedOut.ok).toBe(false);
    expect(lockedOut.attemptsLeft).toBe(0);
    expect(lockedOut.lockoutUntil).toBeGreaterThan(Date.now());

    const duringLockout = await state().unlock('sup3r-secret');
    expect(duringLockout).toMatchObject({ ok: false, reason: 'locked-out' });

    await state().clearLockout();
    expect((await state().unlock('sup3r-secret')).ok).toBe(true);
  });

  it('requires the password to disable the lock and wipes key material', async () => {
    const state = useLockStore.getState;

    await state().enableLock('sup3r-secret', 'sup3r-secret');

    const denied = await state().disableLock('wrong-password');
    expect(denied.ok).toBe(false);
    expect(state().config.enabled).toBe(true);
    expect(state().config.failedAttempts).toHaveLength(1);

    const disabled = await state().disableLock('sup3r-secret');
    expect(disabled.ok).toBe(true);
    expect(state().config.enabled).toBe(false);
    expect(state().config.locked).toBe(false);
    expect(state().config.passwordHash).toBeNull();
    expect(state().config.salt).toBeNull();
  });

  it('rotates the password only after the current one is verified', async () => {
    const state = useLockStore.getState;

    await state().enableLock('sup3r-secret', 'sup3r-secret');
    await state().lockNow('manual');

    await expect(
      state().changePassword('not-the-password', 'next-secret', 'next-secret'),
    ).resolves.toMatchObject({ ok: false, reason: 'invalid' });

    const changed = await state().changePassword('sup3r-secret', 'next-secret', 'next-secret');
    expect(changed.ok).toBe(true);

    expect((await state().unlock('sup3r-secret')).ok).toBe(false);
    expect((await state().unlock('next-secret')).ok).toBe(true);
  });

  it('persists only a salted hash to storage', async () => {
    await useLockStore.getState().enableLock('sup3r-secret', 'sup3r-secret');

    const raw = localStorage.getItem('zh_lock_config');
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('sup3r-secret');
    expect(JSON.parse(raw as string).passwordHash).toBeTruthy();
    expect(JSON.parse(raw as string).salt).toBeTruthy();
  });
});
