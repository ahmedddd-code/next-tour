alter table public.app_tours
  add column if not exists sync_status text not null default 'active'
    check (sync_status in ('active', 'outdated')),
  add column if not exists normalized_key text,
  add column if not exists last_seen_at timestamptz;

update public.app_tours
set last_seen_at = coalesce(last_seen_at, updated_at)
where id like 'partner-%';

create index if not exists app_tours_partner_status_idx
  on public.app_tours (sync_status, last_seen_at)
  where id like 'partner-%';
create unique index if not exists app_tours_normalized_key_idx
  on public.app_tours (normalized_key)
  where normalized_key is not null and sync_status = 'active';

create table if not exists public.partner_price_history (
  id bigint generated always as identity primary key,
  tour_id text not null,
  normalized_key text not null,
  partner_source text not null,
  external_offer_id text not null,
  old_price numeric not null check (old_price >= 0),
  new_price numeric not null check (new_price >= 0),
  currency text not null default 'KZT',
  changed_at timestamptz not null default now()
);
create index if not exists partner_price_history_tour_idx
  on public.partner_price_history (tour_id, changed_at desc);

create table if not exists public.partner_sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  status text not null default 'running'
    check (status in ('running', 'ok', 'partial', 'error')),
  received_count integer not null default 0,
  unique_count integer not null default 0,
  removed_count integer not null default 0,
  error text
);

alter table public.partner_price_history enable row level security;
alter table public.partner_sync_runs enable row level security;
revoke all on public.partner_price_history from anon, authenticated;
revoke all on public.partner_sync_runs from anon, authenticated;

create or replace function public.begin_partner_reindex()
returns uuid language plpgsql security definer set search_path = public as $$
declare run_id uuid;
begin
  insert into public.partner_sync_runs default values returning id into run_id;
  update public.app_tours
  set sync_status = 'outdated',
      data = jsonb_set(data, '{status}', '"outdated"'::jsonb, true)
  where id like 'partner-%';
  return run_id;
end;
$$;

create or replace function public.finish_partner_reindex(
  run_id uuid,
  received integer,
  unique_offers integer,
  run_status text,
  run_error text default null
) returns integer language plpgsql security definer set search_path = public as $$
declare removed integer;
begin
  delete from public.app_tours
  where id like 'partner-%' and (
    coalesce((data->>'price')::numeric, 0) <= 0
    or lower(coalesce(data->>'availability', '')) ~ '(нет мест|недоступ|unavailable|sold out)'
    or (sync_status = 'outdated' and coalesce(last_seen_at, updated_at) < now() - interval '24 hours')
  );
  get diagnostics removed = row_count;
  update public.partner_sync_runs set completed_at = now(), status = run_status,
    received_count = received, unique_count = unique_offers,
    removed_count = removed, error = run_error where id = run_id;
  return removed;
end;
$$;

create or replace function public.cancel_partner_reindex(run_id uuid, run_error text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.app_tours
  set sync_status = 'active',
      data = jsonb_set(data, '{status}', '"active"'::jsonb, true)
  where id like 'partner-%'
    and sync_status = 'outdated'
    and coalesce(last_seen_at, updated_at) >= now() - interval '24 hours';
  update public.partner_sync_runs set completed_at = now(), status = 'error', error = run_error
  where id = run_id;
end;
$$;

revoke all on function public.begin_partner_reindex() from public, anon, authenticated;
revoke all on function public.finish_partner_reindex(uuid, integer, integer, text, text) from public, anon, authenticated;
revoke all on function public.cancel_partner_reindex(uuid, text) from public, anon, authenticated;
grant execute on function public.begin_partner_reindex() to service_role;
grant execute on function public.finish_partner_reindex(uuid, integer, integer, text, text) to service_role;
grant execute on function public.cancel_partner_reindex(uuid, text) to service_role;
grant all on public.partner_price_history to service_role;
grant all on public.partner_sync_runs to service_role;

select cron.unschedule(jobid) from cron.job where jobname = 'nexttour-partner-sync-hourly';
select cron.schedule(
  'nexttour-partner-sync-hourly',
  '7 * * * *',
  $$select net.http_post(
    url := 'https://iidfyuxfcakyixhhbugx.supabase.co/functions/v1/partner-sync',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"scheduled":true,"fullReindex":true}'::jsonb
  );$$
);
