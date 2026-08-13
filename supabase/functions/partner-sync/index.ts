import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';
import { syncSamoSources } from './samo.ts';
import { syncPegas } from './pegas.ts';
import type { PartnerTour, SyncResult } from './types.ts';

const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Используйте POST' }, 405);
  if (!url || !key) return json({ error: 'Синхронизация не настроена' }, 503);
  const payload = await request.json().catch(() => ({})) as { manual?: boolean };
  const manual = payload.manual === true && request.headers.get('authorization') === `Bearer ${key}`;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: running } = await db.from('partner_sync_state').select('last_started_at').eq('source', 'all').maybeSingle();
  if (!manual && running?.last_started_at && Date.now() - new Date(running.last_started_at).getTime() < 45 * 60 * 1000) return json({ ok: true, skipped: true });

  const startedAt = new Date().toISOString();
  await db.from('partner_sync_state').upsert({ source: 'all', last_started_at: startedAt, status: 'running', error: null });
  try {
    const results = [...await syncSamoSources(), await syncPegas()] as SyncResult[];
    const { data: controls } = await db.from('partner_offer_controls').select('*');
    const storedPhotoRows: Array<{ id: string; data: unknown }> = [];
    for (let from = 0; ; from += 1000) {
      const { data: page, error: pageError } = await db.from('app_tours').select('id,data').like('id', 'partner-%').range(from, from + 999);
      if (pageError) throw pageError;
      storedPhotoRows.push(...(page ?? []));
      if (!page || page.length < 1000) break;
    }
    const storedPhotos = new Map(storedPhotoRows.map(row => [row.id, (row.data as PartnerTour)?.images]).filter((entry): entry is [string, string[]] => Boolean(entry[1]?.some(image => !image.includes('images.unsplash.com')))));
    const controlMap = new Map((controls ?? []).map(control => [control.external_id, control]));
    const collectedTours = results.flatMap(result => result.tours).filter(tour => !controlMap.get(tour.externalOfferId)?.hidden).map(tour => {
      const override = controlMap.get(tour.externalOfferId)?.override_data as Partial<PartnerTour> | undefined;
      const withStoredPhotos = storedPhotos.has(tour.id) ? { ...tour, images: storedPhotos.get(tour.id)! } : tour;
      return override ? { ...withStoredPhotos, ...override, id: tour.id, externalOfferId: tour.externalOfferId, syncedAt: tour.syncedAt, priceCheckedAt: tour.priceCheckedAt } : withStoredPhotos;
    });
    const tours = [...new Map(collectedTours.map(tour => [tour.id, tour])).values()];
    for (let index = 0; index < tours.length; index += 200) {
      const rows = tours.slice(index, index + 200).map(tour => ({ id: tour.id, data: tour, updated_at: tour.syncedAt }));
      const { error } = await db.from('app_tours').upsert(rows); if (error) throw error;
    }
    const staleBefore = new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString();
    const { error: staleError } = await db.from('app_tours').delete().lt('updated_at', staleBefore).like('id', 'partner-%');
    if (staleError) throw staleError;
    for (const result of results) await db.from('partner_sync_state').upsert({ source: result.source, last_started_at: startedAt, last_completed_at: new Date().toISOString(), status: result.error ? 'error' : 'ok', offers_count: result.tours.length, error: result.error ?? null });
    const errors = results.filter(result => result.error).map(result => `${result.source}: ${result.error}`);
    await db.from('partner_sync_state').upsert({ source: 'all', last_started_at: startedAt, last_completed_at: new Date().toISOString(), status: errors.length ? 'partial' : 'ok', offers_count: tours.length, error: errors.join('; ') || null });
    return json({ ok: true, offers: tours.length, sources: results.map(result => ({ source: result.source, offers: result.tours.length, error: result.error })) });
  } catch (error) {
    const message = error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);
    await db.from('partner_sync_state').upsert({ source: 'all', last_started_at: startedAt, last_completed_at: new Date().toISOString(), status: 'error', error: message });
    return json({ error: 'Не удалось обновить предложения' }, 500);
  }
});
