create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  access_token_hash text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender text not null check (sender in ('user', 'manager', 'system')),
  text text not null check (char_length(text) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists support_conversations_updated_at_idx on public.support_conversations(updated_at desc);
create index if not exists support_messages_conversation_idx on public.support_messages(conversation_id, created_at);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

-- Публичных политик намеренно нет: таблицы доступны только Edge Function через service role.
revoke all on public.support_conversations from anon, authenticated;
revoke all on public.support_messages from anon, authenticated;
