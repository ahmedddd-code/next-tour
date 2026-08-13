alter table public.support_conversations
  add column if not exists contact jsonb not null default '{}'::jsonb;
