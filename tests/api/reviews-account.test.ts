import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { makeCtx, resetData, registerAgent, adminAgent, orderBody, type TestCtx } from '../helpers';

let ctx: TestCtx;
beforeAll(async () => { ctx = await makeCtx(); });
afterAll(async () => { await ctx.close(); });
beforeEach(async () => { await resetData(ctx.db); });

const PID = 'tatcha-water-cream';
const review = { rating: 5, title: 'Love it', comment: 'Absolutely beautiful texture and glow.' };

describe('reviews', () => {
  it('requires sign-in, validates, and computes verified purchase from real orders', async () => {
    await request(ctx.app).post(`/api/products/${PID}/reviews`).send(review).expect(401);
    const { agent } = await registerAgent(ctx.app, { name: 'Sophia Laurent' });
    expect((await agent.post(`/api/products/${PID}/reviews`).send({ ...review, rating: 6 })).status).toBe(400);
    expect((await agent.post(`/api/products/${PID}/reviews`).send({ ...review, comment: 'short' })).status).toBe(400);
    expect((await agent.post(`/api/products/${PID}/reviews`).send({ ...review, photos: ['http://insecure.example/a.jpg'] })).status).toBe(400);
    expect((await agent.post('/api/products/ghost/reviews').send(review)).status).toBe(404);

    const first = await agent.post(`/api/products/${PID}/reviews`).send(review);
    expect(first.status).toBe(201);
    expect(first.body.review).toMatchObject({ userName: 'Sophia L.', verifiedPurchase: false });
    expect((await agent.post(`/api/products/${PID}/reviews`).send(review)).status).toBe(409); // one per product

    const buyer = await registerAgent(ctx.app);
    await buyer.agent.post('/api/orders').send(orderBody([{ productId: PID, quantity: 1 }])).expect(201);
    const verified = await buyer.agent.post(`/api/products/${PID}/reviews`).send({ ...review, rating: 3 });
    expect(verified.body.review).toMatchObject({ verifiedPurchase: true, userBadge: 'Verified Buyer' });
  });

  it('keeps product rating and review count in sync, including after deletion', async () => {
    const a = await registerAgent(ctx.app); const b = await registerAgent(ctx.app);
    await a.agent.post(`/api/products/${PID}/reviews`).send({ ...review, rating: 5 }).expect(201);
    const rb = await b.agent.post(`/api/products/${PID}/reviews`).send({ ...review, rating: 2 });
    let p = (await request(ctx.app).get(`/api/products/${PID}`)).body.product;
    expect(p).toMatchObject({ rating: 3.5, reviewCount: 2 });
    await b.agent.delete(`/api/reviews/${rb.body.review.id}`).expect(200);
    p = (await request(ctx.app).get(`/api/products/${PID}`)).body.product;
    expect(p).toMatchObject({ rating: 5, reviewCount: 1 });
  });

  it('lists reviews newest-first and marks the caller\'s vote', async () => {
    const a = await registerAgent(ctx.app); const b = await registerAgent(ctx.app);
    const rid = (await a.agent.post(`/api/products/${PID}/reviews`).send(review)).body.review.id;
    await b.agent.post(`/api/reviews/${rid}/vote`).send({ vote: 'helpful' }).expect(200);
    const seenByB = (await b.agent.get(`/api/products/${PID}/reviews`)).body.reviews[0];
    expect(seenByB).toMatchObject({ helpfulCount: 1, userVotedHelpful: true, userVotedUnhelpful: false });
    expect((await request(ctx.app).get(`/api/products/${PID}/reviews`)).body.reviews[0].userVotedHelpful).toBe(false);
  });

  it('voting toggles and switches without double counting; self-votes are rejected', async () => {
    const a = await registerAgent(ctx.app); const b = await registerAgent(ctx.app);
    const rid = (await a.agent.post(`/api/products/${PID}/reviews`).send(review)).body.review.id;
    const vote = async (v: string) => (await b.agent.post(`/api/reviews/${rid}/vote`).send({ vote: v })).body.review;
    expect(await vote('helpful')).toMatchObject({ helpfulCount: 1, unhelpfulCount: 0 });
    expect(await vote('helpful')).toMatchObject({ helpfulCount: 1, unhelpfulCount: 0 }); // idempotent
    expect(await vote('unhelpful')).toMatchObject({ helpfulCount: 0, unhelpfulCount: 1 });
    expect(await vote('none')).toMatchObject({ helpfulCount: 0, unhelpfulCount: 0 });
    await a.agent.post(`/api/reviews/${rid}/vote`).send({ vote: 'helpful' }).expect(403);
    await b.agent.post(`/api/reviews/${rid}/vote`).send({ vote: 'bogus' }).expect(400);
    await request(ctx.app).post(`/api/reviews/${rid}/vote`).send({ vote: 'helpful' }).expect(401);
  });

  it('only the author or staff can delete a review', async () => {
    const a = await registerAgent(ctx.app); const b = await registerAgent(ctx.app);
    const staff = await adminAgent(ctx, 'Staff');
    const rid = (await a.agent.post(`/api/products/${PID}/reviews`).send(review)).body.review.id;
    await b.agent.delete(`/api/reviews/${rid}`).expect(403);
    expect((await staff.get('/api/admin/reviews')).body.reviews[0]).toMatchObject({ id: rid, productTitle: expect.any(String) });
    await staff.delete(`/api/reviews/${rid}`).expect(200);
    await a.agent.delete(`/api/reviews/${rid}`).expect(404);
  });
});

describe('account', () => {
  it('updates the profile and beauty profile', async () => {
    const { agent } = await registerAgent(ctx.app);
    const res = await agent.patch('/api/me').send({ name: 'Sophia L', phone: '+1 555 0100', beautyProfile: { skinType: 'Dry', concerns: ['Hydration'] } });
    expect(res.body.user).toMatchObject({ name: 'Sophia L', phone: '+1 555 0100', beautyProfile: { skinType: 'Dry', concerns: ['Hydration'], undertone: 'Neutral' } });
    expect((await agent.patch('/api/me').send({ name: '' })).status).toBe(400);
    await request(ctx.app).patch('/api/me').send({ name: 'x' }).expect(401);
  });

  it('manages saved addresses privately and caps their number', async () => {
    const a = await registerAgent(ctx.app); const b = await registerAgent(ctx.app);
    const addr = { fullName: 'S L', street: '1 Rue X', city: 'Paris', zipCode: '75001', country: 'France' };
    const created = await a.agent.post('/api/me/addresses').send(addr);
    expect(created.status).toBe(201);
    expect((await a.agent.get('/api/auth/me')).body.user.savedAddresses).toHaveLength(1);
    await b.agent.delete(`/api/me/addresses/${created.body.address.id}`).expect(404); // not yours
    await a.agent.post('/api/me/addresses').send({ ...addr, street: '' }).expect(400);
    for (let i = 0; i < 9; i++) await a.agent.post('/api/me/addresses').send(addr).expect(201);
    await a.agent.post('/api/me/addresses').send(addr).expect(409);
    await a.agent.delete(`/api/me/addresses/${created.body.address.id}`).expect(200);
  });

  it('persists the wishlist per user and merges a guest list on sign-in', async () => {
    const a = await registerAgent(ctx.app); const b = await registerAgent(ctx.app);
    await a.agent.put(`/api/me/wishlist/${PID}`).expect(200);
    await a.agent.put(`/api/me/wishlist/${PID}`).expect(200); // idempotent
    await a.agent.put('/api/me/wishlist/ghost').expect(404);
    expect((await a.agent.get('/api/me/wishlist')).body.productIds).toEqual([PID]);
    expect((await b.agent.get('/api/me/wishlist')).body.productIds).toEqual([]);
    const merged = await a.agent.post('/api/me/wishlist/merge').send({ productIds: ['fenty-pro-filtr-foundation', 'ghost', PID] });
    expect(merged.body.productIds.sort()).toEqual(['fenty-pro-filtr-foundation', PID].sort());
    await a.agent.delete(`/api/me/wishlist/${PID}`).expect(200);
    expect((await a.agent.get('/api/me/wishlist')).body.productIds).toEqual(['fenty-pro-filtr-foundation']);
  });
});
