import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const adminPassword = Deno.env.get('SUPPORT_ADMIN_PASSWORD');
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type ConversationRow = { id: string; status: 'open' | 'closed'; created_at: string; updated_at: string; contact?: Record<string, string>; user_typing_until?: string | null; manager_typing_until?: string | null };
type MessageRow = { id: string; conversation_id: string; sender: 'user' | 'manager' | 'system'; text: string; created_at: string };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

async function hashToken(token: string) {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function serialize(conversation: ConversationRow, messages: MessageRow[]) {
  return {
    id: conversation.id,
    status: conversation.status,
    createdAt: conversation.created_at,
    updatedAt: conversation.updated_at,
    contact: conversation.contact ?? {},
    messages: messages.filter(message => message.conversation_id === conversation.id).map(message => ({
      id: message.id, role: message.sender, text: message.text, createdAt: message.created_at,
    })),
    userTyping: Boolean(conversation.user_typing_until && new Date(conversation.user_typing_until).getTime() > Date.now()),
    managerTyping: Boolean(conversation.manager_typing_until && new Date(conversation.manager_typing_until).getTime() > Date.now()),
  };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Используйте POST' }, 405);
  if (!supabaseUrl || !serviceRoleKey || !adminPassword) return json({ error: 'Чат поддержки не настроен на сервере' }, 503);
  const db = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

  try {
    const body = await request.json() as Record<string, unknown>;
    const action = typeof body.action === 'string' ? body.action : '';
    const suppliedPassword = typeof body.adminPassword === 'string' ? body.adminPassword : '';
    const requiresAdmin = action.startsWith('admin_');
    if (requiresAdmin && suppliedPassword !== adminPassword) return json({ error: 'Неверный пароль администратора' }, 401);

    if (action === 'user_send') {
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (!text || text.length > 2000) return json({ error: 'Сообщение должно содержать от 1 до 2000 символов' }, 400);
      let conversationId = typeof body.conversationId === 'string' ? body.conversationId : '';
      let accessToken = typeof body.accessToken === 'string' ? body.accessToken : '';
      let isNew = false;

      if (!conversationId || !accessToken) {
        conversationId = crypto.randomUUID(); accessToken = crypto.randomUUID(); isNew = true;
        const source = body.contact && typeof body.contact === 'object' ? body.contact as Record<string, unknown> : {};
        const contact = { name: String(source.name ?? '').trim().slice(0, 120), phone: String(source.phone ?? '').trim().slice(0, 30), email: String(source.email ?? '').trim().slice(0, 200), subject: String(source.subject ?? '').trim().slice(0, 200) };
        if (!contact.name || !/^\+7\d{10}$/.test(contact.phone) || !/^\S+@\S+\.\S+$/.test(contact.email) || !contact.subject) return json({ error: 'Заполните контактные данные' }, 400);
        const { error } = await db.from('support_conversations').insert({ id: conversationId, access_token_hash: await hashToken(accessToken), contact });
        if (error) throw error;
      } else {
        const { data } = await db.from('support_conversations').select('id').eq('id', conversationId).eq('access_token_hash', await hashToken(accessToken)).maybeSingle();
        if (!data) return json({ error: 'Диалог не найден' }, 404);
      }

      const now = new Date().toISOString();
      const messages = [{ conversation_id: conversationId, sender: 'user', text }];
      if (isNew) messages.push({ conversation_id: conversationId, sender: 'system', text: 'Сообщение передано менеджеру. Обычно мы отвечаем в течение 5 минут.' });
      const { error: messageError } = await db.from('support_messages').insert(messages);
      if (messageError) throw messageError;
      await db.from('support_conversations').update({ status: 'open', updated_at: now }).eq('id', conversationId);
      return json({ conversationId, accessToken });
    }

    if (action === 'user_load') {
      const conversationId = String(body.conversationId ?? '');
      const accessToken = String(body.accessToken ?? '');
      const { data: conversation } = await db.from('support_conversations').select('id,status,created_at,updated_at,contact,user_typing_until,manager_typing_until').eq('id', conversationId).eq('access_token_hash', await hashToken(accessToken)).maybeSingle<ConversationRow>();
      if (!conversation) return json({ conversation: null });
      const { data: messages, error } = await db.from('support_messages').select('id,conversation_id,sender,text,created_at').eq('conversation_id', conversationId).order('created_at');
      if (error) throw error;
      return json({ conversation: serialize(conversation, (messages ?? []) as MessageRow[]) });
    }

    if (action === 'admin_list') {
      const { data: conversations, error: conversationError } = await db.from('support_conversations').select('id,status,created_at,updated_at,contact,user_typing_until,manager_typing_until').order('updated_at', { ascending: false });
      if (conversationError) throw conversationError;
      const { data: messages, error: messageError } = await db.from('support_messages').select('id,conversation_id,sender,text,created_at').order('created_at');
      if (messageError) throw messageError;
      return json({ conversations: ((conversations ?? []) as ConversationRow[]).map(conversation => serialize(conversation, (messages ?? []) as MessageRow[])) });
    }

    const conversationId = String(body.conversationId ?? '');
    if (action === 'user_typing') {
      const accessToken = String(body.accessToken ?? '');
      const { data } = await db.from('support_conversations').select('id').eq('id', conversationId).eq('access_token_hash', await hashToken(accessToken)).maybeSingle();
      if (!data) return json({ error: 'Диалог не найден' }, 404);
      const until = body.typing ? new Date(Date.now() + 3500).toISOString() : null;
      await db.from('support_conversations').update({ user_typing_until: until }).eq('id', conversationId);
      return json({ ok: true });
    }
    if (action === 'admin_typing') {
      const until = body.typing ? new Date(Date.now() + 3500).toISOString() : null;
      await db.from('support_conversations').update({ manager_typing_until: until }).eq('id', conversationId);
      return json({ ok: true });
    }
    if (action === 'admin_send') {
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (!text || text.length > 2000) return json({ error: 'Некорректное сообщение' }, 400);
      const { error } = await db.from('support_messages').insert({ conversation_id: conversationId, sender: 'manager', text });
      if (error) throw error;
      await db.from('support_conversations').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', conversationId);
      return json({ ok: true });
    }
    if (action === 'admin_status') {
      const status = body.status === 'closed' ? 'closed' : 'open';
      const { error } = await db.from('support_conversations').update({ status, updated_at: new Date().toISOString() }).eq('id', conversationId);
      if (error) throw error;
      return json({ ok: true });
    }
    if (action === 'admin_delete') {
      const { error } = await db.from('support_conversations').delete().eq('id', conversationId);
      if (error) throw error;
      return json({ ok: true });
    }
    return json({ error: 'Неизвестное действие' }, 400);
  } catch (error) {
    console.error('support-chat failed', error);
    return json({ error: 'Не удалось выполнить запрос к чату' }, 500);
  }
});
