import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { makeCtx, resetData, type TestCtx } from '../helpers';

let ctx: TestCtx;
beforeAll(async () => { ctx = await makeCtx(); });
afterAll(async () => { await ctx.close(); });
beforeEach(async () => { await resetData(ctx.db); });

describe('recruiter demo sessions', () => {
  it('creates a unique synthetic customer without signup', async () => {
    const first = request.agent(ctx.app);
    const second = request.agent(ctx.app);

    const a = await first.post('/api/demo/session').expect(201);
    const b = await second.post('/api/demo/session').expect(201);

    expect(a.body.user).toMatchObject({
      role: 'Customer',
      isDemo: true,
      name: 'Recruiter Guest'
    });
    expect(a.body.expiresAt).toBeTruthy();
    expect(a.headers['set-cookie']).toBeTruthy();

    expect(b.body.user.isDemo).toBe(true);
    expect(b.body.user.id).not.toBe(a.body.user.id);

    const me = await first.get('/api/auth/me').expect(200);
    expect(me.body.user.id).toBe(a.body.user.id);
    expect(me.body.user.isDemo).toBe(true);
  });

  it('expires demo sessions server-side even when the cookie is still present', async () => {
    const agent = request.agent(ctx.app);
    const session = await agent.post('/api/demo/session').expect(201);

    await ctx.db.query(
      "UPDATE users SET demo_expires_at = now() - interval '1 minute' WHERE id = $1",
      [session.body.user.id]
    );

    const me = await agent.get('/api/auth/me').expect(200);
    expect(me.body.user).toBeNull();
  });

  it('end-demo deletes the temporary customer and clears access', async () => {
    const agent = request.agent(ctx.app);
    const session = await agent.post('/api/demo/session').expect(201);
    const userId = session.body.user.id;

    await agent.delete('/api/demo/session').expect(204);

    expect((await agent.get('/api/auth/me')).body.user).toBeNull();
    const { rows } = await ctx.db.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    expect(rows).toHaveLength(0);
  });

  it('cleanup deletes expired demo customers but does not touch normal customers', async () => {
    const normalEmail = 'normal@example.com';
    await ctx.db.query(
      `INSERT INTO users (email, password_hash, name, role) VALUES ($1, 'hash', 'Normal Customer', 'Customer')`,
      [normalEmail]
    );

    const demo = await request(ctx.app).post('/api/demo/session').expect(201);
    await ctx.db.query(
      "UPDATE users SET demo_expires_at = now() - interval '1 minute' WHERE id = $1",
      [demo.body.user.id]
    );

    await request(ctx.app).post('/api/demo/session').expect(201);

    const normal = await ctx.db.query('SELECT id FROM users WHERE email = $1', [normalEmail]);
    expect(normal.rows).toHaveLength(1);
    const expired = await ctx.db.query('SELECT id FROM users WHERE id = $1', [demo.body.user.id]);
    expect(expired.rows).toHaveLength(0);
  });
});
