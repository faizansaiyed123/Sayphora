import { Router } from 'express';
import { z } from 'zod';
import type { AppDeps } from '../types';
import { ah, parse } from '../http';
import type { Limiters } from '../middleware/rateLimit';
import { beautyConsultant, shadeMatch, skincareRoutine, SKIN_DEPTHS, type AiSource } from '../services/aiFeatures';

export function aiRouter(deps: AppDeps, limiters: Limiters): Router {
  const r = Router();
  const { db } = deps;
  r.use('/ai', limiters.ai);

  const logger = (kind: string, userId?: string) => async (e: { source: AiSource; detail?: string }) => {
    await db.query('INSERT INTO ai_events (kind, source, user_id, detail) VALUES ($1,$2,$3,$4)', [kind, e.source, userId ?? null, e.detail ?? null])
      .catch((err) => deps.logger.warn({ err }, 'failed to record ai event'));
  };

  r.post('/ai/shade-match', ah(async (req, res) => {
    const body = parse(z.object({
      skinDepth: z.enum(SKIN_DEPTHS),
      veinUndertone: z.enum(['Cool', 'Warm', 'Neutral', 'Olive']),
      sunReaction: z.string().max(40).default('both'),
      coveragePref: z.string().max(40).default('Medium')
    }), req.body);
    res.json(await shadeMatch(db, deps.ai, body, logger('shade-match', req.user?.id)));
  }));

  r.post('/ai/skincare-routine', ah(async (req, res) => {
    const body = parse(z.object({
      skinType: z.string().trim().min(1).max(30),
      concerns: z.array(z.string().trim().max(60)).max(8).default([]),
      climate: z.string().trim().max(60).default('Urban')
    }), req.body);
    res.json(await skincareRoutine(db, deps.ai, body, logger('skincare-routine', req.user?.id)));
  }));

  r.post('/ai/beauty-consultant', ah(async (req, res) => {
    const { prompt } = parse(z.object({ prompt: z.string().trim().min(2, 'Ask a question first.').max(500, 'Please keep questions under 500 characters.') }), req.body);
    res.json(await beautyConsultant(db, deps.ai, prompt, logger('beauty-consultant', req.user?.id)));
  }));

  r.post('/ai/store-locator', ah(async (req, res) => {
    const body = parse(z.object({
      query: z.string().trim().max(200).optional(),
      latitude: z.coerce.number().min(-90).max(90).optional(),
      longitude: z.coerce.number().min(-180).max(180).optional(),
      brand: z.string().trim().max(120).optional(),
      service: z.string().trim().max(120).optional(),
      city: z.string().trim().max(80).optional()
    }), req.body);
    const log = logger('store-locator', req.user?.id);
    const latLng = body.latitude !== undefined && body.longitude !== undefined ? { latitude: body.latitude, longitude: body.longitude } : undefined;
    const cityFilter = body.city && body.city !== 'All' ? body.city : undefined;

    const ai = deps.ai;
    if (ai) {
      try {
        const where = [body.query || 'luxury beauty boutique, cosmetics store or beauty counter', body.brand ? `stocking ${body.brand}` : '', body.service ? `offering ${body.service}` : '',
          cityFilter ? `in ${cityFilter}` : latLng ? 'near my current location' : 'in major shopping districts'].filter(Boolean).join(' ');
        const out = await ai.searchMaps({ prompt: `Find cosmetics stores, beauty boutiques and counters for: "${where}". Describe store names, addresses, shade-matching services and visiting tips in concise bullet points.`, latLng });
        const places = out.chunks.flatMap((c, i) => {
          if (c.maps) {
            const snippets = (c.maps.placeAnswerSources?.reviewSnippets ?? []).map((s: any) => s.snippet).filter(Boolean);
            return [{ id: `maps-${i}`, name: c.maps.title ?? `Boutique ${i + 1}`, address: c.maps.address, uri: c.maps.uri ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.maps.title ?? '')}`,
              snippets, reviewSources: (c.maps.placeAnswerSources?.reviewSnippets ?? []).filter((s: any) => s.uri).map((s: any) => ({ uri: s.uri, snippet: s.snippet, author: s.author })), source: 'maps_grounding' }];
          }
          return [];
        });
        if (places.length) {
          await log({ source: 'gemini' });
          return res.json({ summary: out.text || 'Boutiques found with Google Maps.', places, searchQueries: out.queries, source: 'google_maps_grounding' });
        }
      } catch (err) {
        deps.logger.warn({ err }, 'maps grounding failed; using boutique directory');
      }
    }
    const { rows } = await db.query(
      `SELECT id, name, address, city, map_uri AS uri, rating, reviews_count AS "reviewsCount", phone, services, snippets, in_stock_items AS "inStockItems"
       FROM boutiques WHERE is_active AND ($1::text IS NULL OR lower(city) = lower($1)) ORDER BY rating DESC NULLS LAST`, [cityFilter ?? null]
    );
    const places = rows.length ? rows : (await db.query(`SELECT id, name, address, city, map_uri AS uri, rating, reviews_count AS "reviewsCount", phone, services, snippets, in_stock_items AS "inStockItems" FROM boutiques WHERE is_active ORDER BY rating DESC NULLS LAST`)).rows;
    await log({ source: 'fallback' });
    res.json({
      summary: cityFilter && rows.length ? `Sayphora boutiques in ${cityFilter}.` : cityFilter ? `We have no boutique in ${cityFilter} yet — here are all our locations.` : 'Sayphora boutiques worldwide.',
      places: places.map((p) => ({ ...p, rating: p.rating === null ? undefined : Number(p.rating), source: 'verified_atelier' })),
      source: 'verified_catalog'
    });
  }));

  return r;
}
