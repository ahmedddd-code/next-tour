create table if not exists public.submission_rate_limits (
  id bigint generated always as identity primary key,
  fingerprint_hash text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists submission_rate_limits_lookup_idx
  on public.submission_rate_limits(fingerprint_hash, action, created_at desc);

alter table public.submission_rate_limits enable row level security;
revoke all on public.submission_rate_limits from anon, authenticated;
