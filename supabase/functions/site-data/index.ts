import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const password = Deno.env.get('SUPPORT_ADMIN_PASSWORD');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function isRateLimited(db: ReturnType<typeof createClient>, request: Request, action: string, seconds: number) {
  const fingerprint = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('cf-connecting-ip') || 'unknown';
  const fingerprintHash = await hashToken(fingerprint);
  const since = new Date(Date.now() - seconds * 1000).toISOString();
  const { count } = await db.from('submission_rate_limits').select('*', { count: 'exact', head: true }).eq('fingerprint_hash', fingerprintHash).eq('action', action).gte('created_at', since);
  if ((count ?? 0) > 0) return true;
  await db.from('submission_rate_limits').insert({ fingerprint_hash: fingerprintHash, action });
  return false;
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Используйте POST' }, 405);
  if (!url || !key || !password) return json({ error: 'Облачные данные не настроены' }, 503);
  const db = createClient(url, key, { auth: { persistSession: false } });
  try {
    const body = await request.json() as Record<string, unknown>;
    const action = String(body.action ?? '');
    if (action === 'admin_login') {
      if (String(body.password ?? '') !== password) return json({ error: 'Неверный пароль администратора' }, 401);
      const adminToken = crypto.randomUUID() + crypto.randomUUID();
      const { error } = await db.from('admin_sessions').insert({ token_hash: await hashToken(adminToken), expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString() });
      if (error) throw error;
      return json({ adminToken });
    }

    const adminToken = String(body.adminToken ?? '');
    const { data: session } = adminToken ? await db.from('admin_sessions').select('id').eq('token_hash', await hashToken(adminToken)).gt('expires_at', new Date().toISOString()).maybeSingle<{ id: string }>() : { data: null };
    const admin = Boolean(session);
    if (action === 'admin_session') return admin ? json({ ok: true }) : json({ error: 'Сессия администратора истекла' }, 401);
    if (action === 'admin_logout') {
      if (adminToken) await db.from('admin_sessions').delete().eq('token_hash', await hashToken(adminToken));
      return json({ ok: true });
    }
    if (action.startsWith('admin_') && !admin) return json({ error: 'Требуется вход администратора' }, 401);

    if (action === 'list_tours') {
      const rows: Array<{ data: unknown }> = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await db.from('app_tours').select('data').eq('sync_status', 'active').eq('hidden', false).order('updated_at', { ascending: false }).range(from, from + 999);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }
      return json({ tours: rows.map(row => row.data) });
    }
    if (action === 'list_reviews') {
      const { data, error } = await db.from('app_reviews').select('*').eq('status', 'published').order('created_at', { ascending: false });
      if (error) throw error; return json({ reviews: data ?? [] });
    }
    if (action === 'create_booking') {
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
      const { data: authData } = await db.auth.getUser(token);
      if (!authData.user) return json({ error: 'Войдите в аккаунт для бронирования' }, 401);
      if (await isRateLimited(db, request, `booking:${authData.user.id}`, 30)) return json({ error: 'Заявка уже отправляется. Подождите 30 секунд.' }, 429);
      const source = body.data && typeof body.data === 'object' ? body.data as Record<string, unknown> : {};
      const data = { ...source, userId: authData.user.id };
      const validPhone = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(String(data.phone ?? ''));
      const validEmail = /^\S+@\S+\.\S+$/.test(String(data.email ?? ''));
      const adults = Number(data.adults), children = Number(data.children), price = Number(data.tourPrice);
      if (String(data.name ?? '').trim().length < 2 || !validPhone || !validEmail || !String(data.tourId ?? '') || !String(data.tourHotel ?? '') || !Number.isFinite(price) || price < 0 || !Number.isInteger(adults) || adults < 1 || adults > 20 || !Number.isInteger(children) || children < 0 || children > 20 || String(data.comment ?? '').length > 2000) return json({ error: 'Проверьте данные заявки' }, 400);
      const { error } = await db.from('app_bookings').insert({ data }); if (error) throw error; return json({ ok: true });
    }
    if (action === 'user_list_bookings') {
      const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? '';
      const { data: authData } = await db.auth.getUser(token);
      if (!authData.user) return json({ error: 'Требуется авторизация' }, 401);
      const { data, error } = await db.from('app_bookings').select('*').contains('data', { userId: authData.user.id }).order('created_at', { ascending: false });
      if (error) throw error;
      return json({ bookings: (data ?? []).map(row => ({ ...row.data, id: row.id, status: row.status, createdAt: row.created_at })) });
    }
    if (action === 'create_review') {
      const name = String(body.name ?? '').trim(), text = String(body.text ?? '').trim(), rating = Number(body.rating);
      if (await isRateLimited(db, request, 'review', 60)) return json({ error: 'Следующий отзыв можно отправить через минуту.' }, 429);
      if (name.length < 2 || name.length > 120 || text.length < 10 || text.length > 2000 || !Number.isInteger(rating) || rating < 1 || rating > 5) return json({ error: 'Проверьте данные отзыва' }, 400);
      const { error } = await db.from('app_reviews').insert({ name, text, rating }); if (error) throw error; return json({ ok: true });
    }
    if (action === 'admin_list_bookings') {
      const { data, error } = await db.from('app_bookings').select('*').order('created_at', { ascending: false }); if (error) throw error;
      return json({ bookings: (data ?? []).map(row => ({ ...row.data, id: row.id, status: row.status, createdAt: row.created_at })) });
    }
    if (action === 'admin_list_reviews') {
      const { data, error } = await db.from('app_reviews').select('*').order('created_at', { ascending: false }); if (error) throw error;
      return json({ reviews: (data ?? []).map(row => ({ id: row.id, name: row.name, rating: row.rating, text: row.text, status: row.status, createdAt: row.created_at })) });
    }
    if (action === 'admin_list_tours') {
      const rows: Array<{ data: Record<string, unknown>; hidden: boolean }> = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await db.from('app_tours').select('data,hidden').eq('sync_status', 'active').order('updated_at', { ascending: false }).range(from, from + 999);
        if (error) throw error;
        rows.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }
      return json({ tours: rows.map(row => ({ ...row.data, isHidden: row.hidden })) });
    }
    if (action === 'admin_upsert_tour') {
      const tour = body.tour as Record<string, unknown>; if (!tour || typeof tour.id !== 'string') return json({ error: 'Некорректный тур' }, 400);
      if (typeof tour.externalOfferId === 'string') await db.from('partner_offer_controls').upsert({ external_id: tour.externalOfferId, hidden: false, override_data: tour, updated_at: new Date().toISOString() });
      const { error } = await db.from('app_tours').upsert({ id: tour.id, data: tour, updated_at: new Date().toISOString() }); if (error) throw error; return json({ ok: true });
    }
    if (action === 'admin_seed_tours') {
      const tours = Array.isArray(body.tours) ? body.tours as Array<Record<string, unknown>> : [];
      const { count } = await db.from('app_tours').select('*', { count: 'exact', head: true });
      if (!count && tours.length) { const { error } = await db.from('app_tours').insert(tours.map(tour => ({ id: tour.id, data: tour }))); if (error) throw error; }
      return json({ ok: true });
    }
    const id = String(body.id ?? '');
    if (action === 'admin_set_tour_hidden') { const { error } = await db.from('app_tours').update({ hidden: body.hidden === true, updated_at: new Date().toISOString() }).eq('id', id); if (error) throw error; return json({ ok: true }); }
    if (action === 'admin_delete_tour') { const { data: existing } = await db.from('app_tours').select('data').eq('id', id).maybeSingle(); const externalId = (existing?.data as Record<string, unknown> | undefined)?.externalOfferId; if (typeof externalId === 'string') await db.from('partner_offer_controls').upsert({ external_id: externalId, hidden: true, updated_at: new Date().toISOString() }); const { error } = await db.from('app_tours').delete().eq('id', id); if (error) throw error; return json({ ok: true }); }
    if (action === 'admin_partner_sync_status') { const { data, error } = await db.from('partner_sync_state').select('*').order('source'); if (error) throw error; return json({ sources: data ?? [] }); }
    if (action === 'admin_partner_sync') { const response = await fetch(`${url}/functions/v1/partner-sync`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify({ manual: true }) }); const result = await response.json(); return json(result, response.ok ? 200 : 502); }
    if (action === 'admin_reset_tours') { await db.from('app_tours').delete().neq('id', ''); const tours = body.tours as Array<Record<string, unknown>>; const { error } = await db.from('app_tours').insert(tours.map(tour => ({ id: tour.id, data: tour }))); if (error) throw error; return json({ ok: true }); }
    if (action === 'admin_booking_status') { const { error } = await db.from('app_bookings').update({ status: body.status, updated_at: new Date().toISOString() }).eq('id', id); if (error) throw error; return json({ ok: true }); }
    if (action === 'admin_delete_booking') { const { error } = await db.from('app_bookings').delete().eq('id', id); if (error) throw error; return json({ ok: true }); }
    if (action === 'admin_publish_review') { const { error } = await db.from('app_reviews').update({ status: 'published' }).eq('id', id); if (error) throw error; return json({ ok: true }); }
    if (action === 'admin_delete_review') { const { error } = await db.from('app_reviews').delete().eq('id', id); if (error) throw error; return json({ ok: true }); }
    return json({ error: 'Неизвестное действие' }, 400);
  } catch (error) { console.error('site-data failed', error); return json({ error: 'Ошибка облачных данных' }, 500); }
});
