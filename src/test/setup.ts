import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';

/**
 * jsdom ships a partial `crypto` object without `subtle`. The browser lock
 * derives passwords with PBKDF2, so expose Node's Web Crypto implementation
 * while tests are running.
 */
if (!globalThis.crypto?.subtle) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}
