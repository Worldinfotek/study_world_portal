import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const PREFIX = 'scrypt$';

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 32).toString('hex');
  return `${PREFIX}${salt}$${hash}`;
}

export function isHashedPassword(stored: string): boolean {
  return String(stored || '').startsWith(PREFIX);
}

export function verifyPassword(plain: string, stored: string): boolean {
  const value = String(stored || '');
  if (!plain || !value) return false;
  if (!value.startsWith(PREFIX)) {
    return value === plain;
  }
  const rest = value.slice(PREFIX.length);
  const sep = rest.indexOf('$');
  if (sep < 0) return false;
  const salt = rest.slice(0, sep);
  const hash = rest.slice(sep + 1);
  const actual = scryptSync(plain, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
