import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';
import { syncSamoSources } from './samo.ts';
import { syncPegas } from './pegas.ts';
import type { PartnerTour, SyncResult } from './types.ts';
import { mergeDuplicateTours } from './dedupe.ts';
import { getOperatorGallery, mapWithConcurrency } from './photos.ts';

const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Используйте POST' }, 405);
  if (!url || !key) return json({ error: 'Синхронизация не настроена' }, 503);
  const payload = await request.json().catch(() => ({})) as { manual?: boolean; fullReindex?: boolean };
  const manual = payload.manual === true && request.headers.get('authorization') === `Bearer ${key}`;
  const db = createClient(url, key, { auth: { persistSession: false } });
  const { data: running } = await db.from('partner_sync_state').select('last_started_at').eq('source', 'all').maybeSingle();
  if (!manual && !payload.fullReindex && running?.last_started_at && Date.now() - new Date(running.last_started_at).getTime() < 45 * 60 * 1000) return json({ ok: true, skipped: true });

  const startedAt = new Date().toISOString();
  await db.from('partner_sync_state').upsert({ source: 'all', last_started_at: startedAt, status: 'running', error: null });
  let runId: string | null = null;
  try {
    const results = [...await syncSamoSources(), await syncPegas()] as SyncResult[];
    const incomplete = results.filter(result => result.error || result.tours.length === 0);
    if (incomplete.length) throw new Error(`Full reindex cancelled; incomplete feeds: ${incomplete.map(result => result.source).join(', ')}`);
    const { data: createdRunId, error: beginError } = await db.rpc('begin_partner_reindex');
    if (beginError) throw beginError;
    runId = createdRunId as string;
    const { data: controls } = await db.from('partner_offer_controls').select('*');
    const controlMap = new Map((controls ?? []).map(control => [control.external_id, control]));
    const collectedTours = results.flatMap(result => result.tours).filter(tour => !controlMap.get(tour.externalOfferId)?.hidden).map(tour => {
      const override = controlMap.get(tour.externalOfferId)?.override_data as Partial<PartnerTour> | undefined;
      return override ? { ...tour, ...override, id: tour.id, externalOfferId: tour.externalOfferId, syncedAt: tour.syncedAt, priceCheckedAt: tour.priceCheckedAt } : tour;
    });
    const uniqueRawTours = [...new Map(collectedTours.map(tour => [tour.externalOfferId, tour])).values()];
    const tours = await mergeDuplicateTours(uniqueRawTours);
    const existingRows: Array<{ id: string; normalized_key: string | null; data: unknown }> = [];
    for (let from = 0; ; from += 1000) {
      const { data: page, error: pageError } = await db.from('app_tours').select('id,normalized_key,data').like('id', 'partner-%').range(from, from + 999);
      if (pageError) throw pageError;
      existingRows.push(...(page ?? []));
      if (!page || page.length < 1000) break;
    }
    const previousByKey = new Map(existingRows.filter(row => row.normalized_key).map(row => [row.normalized_key!, row]));
    const priceChanges: Array<Record<string, unknown>> = [];
    for (let index = 0; index < tours.length; index += 200) {
      const preparedTours = await mapWithConcurrency(tours.slice(index, index + 200), 12, async tour => {
        const previous = previousByKey.get(tour.dedupeKey ?? '')?.data as PartnerTour | undefined;
        const samePhotoOwner = previous?.partnerSource === tour.partnerSource && previous.externalOfferId === tour.externalOfferId;
        const previousSourceImages = samePhotoOwner ? (previous?.images ?? []).filter(image => image !== '/images/tour-placeholder.svg') : [];
        const currentSourceImages = tour.images.filter(image => image !== '/images/tour-placeholder.svg');
        const lastImport = previous?.operatorImagesImportedAt ? new Date(previous.operatorImagesImportedAt).getTime() : 0;
        const sourcePageChanged = previous?.sourceUrl !== tour.sourceUrl;
        const galleryIsStale = Date.now() - lastImport >= 24 * 60 * 60 * 1000;
        const shouldRefreshGallery = !samePhotoOwner || sourcePageChanged || galleryIsStale;
        const gallery = shouldRefreshGallery ? await getOperatorGallery(tour) : previousSourceImages;
        const freshImages = [...new Set([...currentSourceImages, ...gallery])];
        const images = gallery.length || !previousSourceImages.length ? freshImages : previousSourceImages;
        console.info(`[SYNC] Tour: ${tour.hotel}\n[SYNC] Operator: ${tour.partnerSource}\n[SYNC] External ID: ${tour.externalOfferId}\n[SYNC] Source URL: ${tour.sourceUrl}\n[SYNC] Images found: ${gallery.length}\n[SYNC] Main image: ${images[0] ?? 'placeholder'}\n[SYNC] Images saved: ${images.length}`);
        if (!images.length) console.warn(`[SYNC] WARNING: Images not found for tour ${tour.externalOfferId}; using placeholder`);
        return { tour, previous, images, importedAt: shouldRefreshGallery ? new Date().toISOString() : previous?.operatorImagesImportedAt ?? new Date().toISOString() };
      });
      const rows = preparedTours.map(({ tour, previous, images, importedAt }) => {
        const oldOffers = new Map((previous?.partnerOffers ?? []).map(offer => [offer.source, offer]));
        for (const offer of tour.partnerOffers ?? []) {
          const old = oldOffers.get(offer.source);
          if (old && old.price !== offer.price) priceChanges.push({ tour_id: tour.id, normalized_key: tour.dedupeKey,
            partner_source: offer.source, external_offer_id: offer.externalOfferId, old_price: old.price,
            new_price: offer.price, currency: offer.currency, changed_at: tour.priceCheckedAt });
        }
        const currentTour = { ...tour, images: images.length ? images : ['/images/tour-placeholder.svg'],
          operatorImagesImportedAt: importedAt, operatorImageCount: images.length };
        return { id: tour.id, data: currentTour, updated_at: tour.syncedAt, last_seen_at: tour.syncedAt,
          sync_status: 'active', normalized_key: tour.dedupeKey };
      });
      const { error } = await db.from('app_tours').upsert(rows); if (error) throw error;
      const tourIds = rows.map(row => row.id);
      const { error: deleteImagesError } = await db.from('partner_tour_images').delete().in('tour_id', tourIds);
      if (deleteImagesError) throw deleteImagesError;
      const imageRows = rows.flatMap(row => {
        const tour = row.data as PartnerTour;
        return tour.images.map((imageUrl, sortOrder) => ({ tour_id: tour.id, source: tour.partnerSource,
          external_tour_id: tour.externalOfferId, image_url: imageUrl, is_main: sortOrder === 0, sort_order: sortOrder, active: true }));
      });
      if (imageRows.length) { const { error: imageError } = await db.from('partner_tour_images').insert(imageRows); if (imageError) throw imageError; }
    }
    for (let index = 0; index < priceChanges.length; index += 500) {
      const { error } = await db.from('partner_price_history').insert(priceChanges.slice(index, index + 500));
      if (error) throw error;
    }
    for (const result of results) await db.from('partner_sync_state').upsert({ source: result.source, last_started_at: startedAt, last_completed_at: new Date().toISOString(), status: result.error ? 'error' : 'ok', offers_count: result.tours.length, error: result.error ?? null });
    const errors = results.filter(result => result.error).map(result => `${result.source}: ${result.error}`);
    const status = errors.length ? 'partial' : 'ok';
    const { data: removed, error: finishError } = await db.rpc('finish_partner_reindex', { run_id: runId,
      received: uniqueRawTours.length, unique_offers: tours.length, run_status: status, run_error: errors.join('; ') || null });
    if (finishError) throw finishError;
    await db.from('partner_sync_state').upsert({ source: 'all', last_started_at: startedAt, last_completed_at: new Date().toISOString(), status, offers_count: tours.length, error: errors.join('; ') || null });
    return json({ ok: true, received: uniqueRawTours.length, offers: tours.length, duplicatesMerged: uniqueRawTours.length - tours.length,
      priceChanges: priceChanges.length, removed, sources: results.map(result => ({ source: result.source, offers: result.tours.length, error: result.error })) });
  } catch (error) {
    const message = error instanceof Error
      ? `${error.name}: ${error.message}`
      : typeof error === 'string'
        ? error
        : JSON.stringify(error);
    await db.from('partner_sync_state').upsert({ source: 'all', last_started_at: startedAt, last_completed_at: new Date().toISOString(), status: 'error', error: message });
    if (runId) await db.rpc('cancel_partner_reindex', { run_id: runId, run_error: message });
    return json({ error: 'Не удалось обновить предложения' }, 500);
  }
});
