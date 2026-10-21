import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { makeCtx, resetData, registerAgent, uniqueEmail, PASSWORD, adminAgent, type TestCtx } from '../helpers';

let ctx: TestCtx;
beforeAll(async () => { ctx = await makeCtx(); });
afterAll(async () => { await ctx.close(); });
beforeEach(async () => { await resetData(ctx.db); ctx.sent.length = 0; });

describe('registration & login', () => {
  it('registers, starts an HttpOnly session and returns the profile with welcome points', async () => {
    const email = uniqueEmail();
    const res = await request(ctx.app).post('/api/auth/register').send({ name: 'Ada Lovelace', email: email.toUpperCase(), password: PASSWORD });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email, name: 'Ada Lovelace', role: 'Customer', tier: 'Insider', points: 50, pointsToNextTier: 350 });
    expect(JSON.stringify(res.body)).not.toMatch(/password|hash/i);
    const cookie = String(res.headers['set-cookie']);
    expect(cookie).toMatch(/sayphora_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('stores only a salted hash, never the password', async () => {
    const { email } = await registerAgent(ctx.app);
    const { rows } = await ctx.db.query('SELECT password_hash FROM users WHERE email = $1', [email]);
    expect(rows[0].password_hash).toMatch(/^scrypt\$/);
    expect(rows[0].password_hash).not.toContain(PASSWORD);
  });

  it('validates input with field-level errors', async () => {
    const res = await request(ctx.app).post('/api/auth/register').send({ name: '', email: 'nope', password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
    expect(Object.keys(res.body.error.details)).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it('rejects duplicate emails case-insensitively', async () => {
    const { email } = await registerAgent(ctx.app);
    const res = await request(ctx.app).post('/api/auth/register').send({ name: 'X', email: email.toUpperCase(), password: PASSWORD });
    expect(res.status).toBe(409);
  });

  it('logs in with correct credentials and gives identical errors for wrong password and unknown email', async () => {
    const { email } = await registerAgent(ctx.app);
    expect((await request(ctx.app).post('/api/auth/login').send({ email, password: PASSWORD })).status).toBe(200);
    const bad = await request(ctx.app).post('/api/auth/login').send({ email, password: 'Wrong-password-1' });
    const unknown = await request(ctx.app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'Wrong-password-1' });
    expect(bad.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(bad.body.error.message).toBe(unknown.body.error.message);
  });

  it('/auth/me returns the user when signed in and null otherwise; logout clears the session', async () => {
    expect((await request(ctx.app).get('/api/auth/me')).body.user).toBeNull();
    const { agent, email } = await registerAgent(ctx.app);
    expect((await agent.get('/api/auth/me')).body.user.email).toBe(email);
    await agent.post('/api/auth/logout').expect(200);
    expect((await agent.get('/api/auth/me')).body.user).toBeNull();
  });

  it('ignores forged or garbage session cookies', async () => {
    const res = await request(ctx.app).get('/api/auth/me').set('Cookie', 'sayphora_session=eyJhbGciOiJub25lIn0.e30.');
    expect(res.body.user).toBeNull();
  });
});

describe('password change & reset', () => {
  it('changing the password signs out other sessions but keeps the current one', async () => {
    const { agent, email } = await registerAgent(ctx.app);
    const other = request.agent(ctx.app);
    await other.post('/api/auth/login').send({ email, password: PASSWORD }).expect(200);

    const bad = await agent.post('/api/me/password').send({ currentPassword: 'nope-nope-nope', newPassword: 'BrandNewPassw0rd!' });
    expect(bad.status).toBe(403);
    await agent.post('/api/me/password').send({ currentPassword: PASSWORD, newPassword: 'BrandNewPassw0rd!' }).expect(200);

    expect((await agent.get('/api/auth/me')).body.user.email).toBe(email);
    expect((await other.get('/api/auth/me')).body.user).toBeNull();
    await request(ctx.app).post('/api/auth/login').send({ email, password: PASSWORD }).expect(401);
    await request(ctx.app).post('/api/auth/login').send({ email, password: 'BrandNewPassw0rd!' }).expect(200);
  });

  it('forgot-password never reveals whether an account exists', async () => {
    const { email } = await registerAgent(ctx.app);
    const a = await request(ctx.app).post('/api/auth/forgot-password').send({ email });
    const b = await request(ctx.app).post('/api/auth/forgot-password').send({ email: 'ghost@example.com' });
    expect(a.status).toBe(200);
    expect(a.body).toEqual(b.body);
    await new Promise((r) => setTimeout(r, 50));
    expect(ctx.sent).toHaveLength(1);
    expect(ctx.sent[0].to).toBe(email);
  });

  it('reset links work once, expire, and invalidate existing sessions', async () => {
    const { agent, email } = await registerAgent(ctx.app);
    await request(ctx.app).post('/api/auth/forgot-password').send({ email });
    await new Promise((r) => setTimeout(r, 50));
    const token = /reset=([\w-]+)/.exec(ctx.sent[0].text)![1];

    await request(ctx.app).post('/api/auth/reset-password').send({ token, password: 'short' }).expect(400);
    await request(ctx.app).post('/api/auth/reset-password').send({ token, password: 'ResetPassw0rd!2026' }).expect(200);
    await request(ctx.app).post('/api/auth/reset-password').send({ token, password: 'AnotherPassw0rd!2026' }).expect(400); // single use
    expect((await agent.get('/api/auth/me')).body.user).toBeNull(); // old session revoked
    await request(ctx.app).post('/api/auth/login').send({ email, password: 'ResetPassw0rd!2026' }).expect(200);

    await request(ctx.app).post('/api/auth/forgot-password').send({ email });
    await new Promise((r) => setTimeout(r, 50));
    const t2 = /reset=([\w-]+)/.exec(ctx.sent[1].text)![1];
    await ctx.db.query("UPDATE password_resets SET expires_at = now() - interval '1 minute'");
    await request(ctx.app).post('/api/auth/reset-password').send({ token: t2, password: 'ExpiredPassw0rd!2026' }).expect(400);
  });
});

describe('authorization & request hardening', () => {
  it('protects account and admin endpoints by role', async () => {
    await request(ctx.app).get('/api/me/orders').expect(401);
    await request(ctx.app).get('/api/admin/orders').expect(401);
    const { agent } = await registerAgent(ctx.app);
    await agent.get('/api/admin/orders').expect(403);
    await agent.post('/api/admin/products').send({}).expect(403);
    const staff = await adminAgent(ctx, 'Staff');
    await staff.get('/api/admin/orders').expect(200);
    await staff.get('/api/admin/promos').expect(403); // admin-only
    const admin = await adminAgent(ctx, 'Admin');
    await admin.get('/api/admin/promos').expect(200);
  });

  it('blocks cross-origin state-changing requests (CSRF defence)', async () => {
    const res = await request(ctx.app).post('/api/auth/login').set('Origin', 'https://evil.example').send({ email: 'a@b.co', password: 'x' });
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('csrf');
    const ok = await request(ctx.app).post('/api/auth/login').set('Host', 'shop.example').set('Origin', 'https://shop.example').send({ email: 'a@b.co', password: 'x' });
    expect(ok.status).toBe(401); // reached the handler
  });

  it('returns JSON 404s for unknown API routes, sets no-store, and hides the framework', async () => {
    const res = await request(ctx.app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('rejects malformed JSON and oversized bodies without leaking internals', async () => {
    const bad = await request(ctx.app).post('/api/auth/login').set('Content-Type', 'application/json').send('{"email":');
    expect(bad.status).toBe(400);
    const big = await request(ctx.app).post('/api/auth/login').send({ email: 'a@b.co', password: 'x'.repeat(200_000) });
    expect(big.status).toBe(413);
  });

  it('removed the dangerous legacy endpoints', async () => {
    expect((await request(ctx.app).get('/api/download-zip')).status).toBe(404);
    expect((await request(ctx.app).get('/api/db/health')).status).toBe(404);
  });

  it('throttles brute-force logins per account when rate limiting is enabled', async () => {
    const limited = await makeCtx({ RATE_LIMIT_DISABLED: 'false' });
    try {
      const { email } = await registerAgent(limited.app);
      let last = 0;
      for (let i = 0; i < 12; i++) last = (await request(limited.app).post('/api/auth/login').send({ email, password: 'Wrong-password-1' })).status;
      expect(last).toBe(429);
      // a different account from the same IP is unaffected
      expect((await request(limited.app).post('/api/auth/login').send({ email: 'other@example.com', password: 'x' })).status).toBe(401);
    } finally { await limited.close(); }
  });
});

describe('health', () => {
  it('reports healthy when the database is reachable', async () => {
    const res = await request(ctx.app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'healthy', database: 'up' });
  });
  it('reports 503 when the database is down', async () => {
    const broken = await makeCtx();
    await broken.db.end();
    const res = await request(broken.app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body.status).toBe('unhealthy');
  });
});
