create table if not exists public.app_tours (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_bookings (
  id uuid primary key default gen_random_uuid(),
  data jsonb not null,
  status text not null default 'new' check (status in ('new', 'processed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null check (char_length(text) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'published')),
  created_at timestamptz not null default now()
);

alter table public.app_tours enable row level security;
alter table public.app_bookings enable row level security;
alter table public.app_reviews enable row level security;
revoke all on public.app_tours from anon, authenticated;
revoke all on public.app_bookings from anon, authenticated;
revoke all on public.app_reviews from anon, authenticated;

alter table public.support_conversations
  add column if not exists user_typing_until timestamptz,
  add column if not exists manager_typing_until timestamptz;
