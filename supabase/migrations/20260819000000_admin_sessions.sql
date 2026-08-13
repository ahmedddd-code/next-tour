create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists admin_sessions_expires_at_idx on public.admin_sessions(expires_at);

alter table public.admin_sessions enable row level security;
revoke all on public.admin_sessions from anon, authenticated;
