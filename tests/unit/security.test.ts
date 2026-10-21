import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateResetToken, sha256 } from '../../server/services/passwords';
import { createTokenService } from '../../server/services/tokens';
import { loadConfig } from '../../server/config';
import { escapeLike } from '../../server/http';
import { escapeHtml } from '../../server/services/email';
import { SignJWT } from 'jose';

describe('password hashing', () => {
  it('verifies the right password and rejects wrong ones', async () => {
    const h = await hashPassword('correct horse battery', 10);
    expect(h.startsWith('scrypt$10$')).toBe(true);
    expect(await verifyPassword('correct horse battery', h)).toBe(true);
    expect(await verifyPassword('wrong', h)).toBe(false);
  });
  it('salts every hash', async () => {
    expect(await hashPassword('same', 10)).not.toBe(await hashPassword('same', 10));
  });
  it('rejects malformed or tampered hashes instead of throwing', async () => {
    expect(await verifyPassword('x', 'garbage')).toBe(false);
    expect(await verifyPassword('x', 'scrypt$99$AAAA$BBBB')).toBe(false);
    expect(await verifyPassword('x', 'bcrypt$10$AAAA$BBBB')).toBe(false);
  });
  it('generates unguessable reset tokens and stores only their hash', () => {
    const a = generateResetToken(); const b = generateResetToken();
    expect(a.token).not.toBe(b.token);
    expect(a.token.length).toBeGreaterThanOrEqual(40);
    expect(a.hash).toBe(sha256(a.token));
    expect(a.hash).not.toContain(a.token);
  });
});

describe('session tokens', () => {
  const svc = createTokenService('x'.repeat(40), 7);
  it('round-trips claims', async () => {
    const t = await svc.sign({ userId: 'u1', tokenVersion: 3 });
    expect(await svc.verify(t)).toEqual({ userId: 'u1', tokenVersion: 3 });
  });
  it('rejects tokens signed with another secret, tampering, expiry, and alg=none', async () => {
    const other = createTokenService('y'.repeat(40), 7);
    expect(await svc.verify(await other.sign({ userId: 'u1', tokenVersion: 0 }))).toBeNull();
    const t = await svc.sign({ userId: 'u1', tokenVersion: 0 });
    expect(await svc.verify(t.slice(0, -3) + 'abc')).toBeNull();
    expect(await svc.verify('not.a.jwt')).toBeNull();
    const expired = await new SignJWT({ tv: 0 }).setProtectedHeader({ alg: 'HS256' }).setSubject('u1').setIssuer('sayphora').setExpirationTime(Math.floor(Date.now() / 1000) - 60).sign(new TextEncoder().encode('x'.repeat(40)));
    expect(await svc.verify(expired)).toBeNull();
    const none = Buffer.from('{"alg":"none"}').toString('base64url') + '.' + Buffer.from('{"sub":"u1","tv":0,"iss":"sayphora"}').toString('base64url') + '.';
    expect(await svc.verify(none)).toBeNull();
  });
});

describe('configuration', () => {
  const base = { DATABASE_URL: 'postgresql://x', JWT_SECRET: 'a-very-long-random-secret-0123456789abcdef' };
  it('fails fast with a readable message when required values are missing', () => {
    expect(() => loadConfig({} as NodeJS.ProcessEnv)).toThrow(/DATABASE_URL/);
    expect(() => loadConfig({ DATABASE_URL: 'x', JWT_SECRET: 'short' } as NodeJS.ProcessEnv)).toThrow(/JWT_SECRET/);
  });
  it('refuses placeholder secrets in production', () => {
    expect(() => loadConfig({ ...base, NODE_ENV: 'production', JWT_SECRET: 'change-me-change-me-change-me-change-me' } as NodeJS.ProcessEnv)).toThrow(/placeholder/);
  });
  it('defaults to secure cookies in production only', () => {
    expect(loadConfig({ ...base, NODE_ENV: 'production' } as NodeJS.ProcessEnv).COOKIE_SECURE).toBe(true);
    expect(loadConfig({ ...base, NODE_ENV: 'development' } as NodeJS.ProcessEnv).COOKIE_SECURE).toBe(false);
    expect(loadConfig({ ...base, NODE_ENV: 'production', COOKIE_SECURE: 'false' } as NodeJS.ProcessEnv).COOKIE_SECURE).toBe(false);
  });
  it('treats blank optional values as unset', () => {
    const c = loadConfig({ ...base, GEMINI_API_KEY: '', APP_URL: '', SMTP_HOST: '' } as NodeJS.ProcessEnv);
    expect(c.GEMINI_API_KEY).toBeUndefined();
    expect(c.APP_URL).toBeUndefined();
  });
});

describe('escaping helpers', () => {
  it('escapes LIKE wildcards', () => { expect(escapeLike('50%_off\\')).toBe('50\\%\\_off\\\\'); });
  it('escapes HTML in emails', () => { expect(escapeHtml('<script>"a"&\'b\'</script>')).toBe('&lt;script&gt;&quot;a&quot;&amp;&#39;b&#39;&lt;/script&gt;'); });
});
