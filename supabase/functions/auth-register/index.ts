import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

const url = Deno.env.get('SUPABASE_URL');
const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Используйте POST' }, 405);
  if (!url || !key) return json({ error: 'Авторизация не настроена' }, 503);
  try {
    const body = await request.json() as Record<string, unknown>;
    const firstName = String(body.firstName ?? '').trim();
    const lastName = String(body.lastName ?? '').trim();
    const middleName = String(body.middleName ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const phone = String(body.phone ?? '').trim();
    const birthDate = String(body.birthDate ?? '');
    const city = String(body.city ?? '').trim();
    const password = String(body.password ?? '');
    if (firstName.length < 2 || lastName.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !/^\+7\d{10}$/.test(phone) || !birthDate || !city || password.length < 8) return json({ error: 'Проверьте регистрационные данные' }, 400);

    const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await auth.auth.admin.createUser({
      email, phone, password, email_confirm: true, phone_confirm: true,
      user_metadata: { firstName, lastName, middleName, phone, birthDate, city },
    });
    if (error) {
      const status = /already|registered|exists/i.test(error.message) ? 409 : 400;
      return json({ error: error.message }, status);
    }
    return json({ userId: data.user.id }, 201);
  } catch (error) {
    console.error('auth-register failed', error);
    return json({ error: 'Не удалось создать аккаунт' }, 500);
  }
});
