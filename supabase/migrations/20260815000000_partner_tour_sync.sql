create table if not exists public.partner_sync_state (
  source text primary key,
  last_started_at timestamptz,
  last_completed_at timestamptz,
  status text not null default 'idle',
  offers_count integer not null default 0,
  error text
);

create table if not exists public.partner_offer_controls (
  external_id text primary key,
  hidden boolean not null default false,
  override_data jsonb,
  updated_at timestamptz not null default now()
);

alter table public.partner_sync_state enable row level security;
alter table public.partner_offer_controls enable row level security;
revoke all on public.partner_sync_state from anon, authenticated;
revoke all on public.partner_offer_controls from anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid) from cron.job where jobname = 'nexttour-partner-sync-hourly';
select cron.schedule(
  'nexttour-partner-sync-hourly',
  '7 * * * *',
  $$select net.http_post(
    url := 'https://iidfyuxfcakyixhhbugx.supabase.co/functions/v1/partner-sync',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"scheduled":true}'::jsonb
  );$$
);
