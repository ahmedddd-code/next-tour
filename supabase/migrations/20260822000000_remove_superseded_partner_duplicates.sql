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
    -- Old per-operator rows are replaced by partner-merged-* rows in this run.
    or (sync_status = 'outdated' and id not like 'partner-merged-%')
    -- A previously merged tour may be temporarily absent from a feed; retain it for 24 hours.
    or (sync_status = 'outdated' and coalesce(last_seen_at, updated_at) < now() - interval '24 hours')
  );
  get diagnostics removed = row_count;
  update public.partner_sync_runs set completed_at = now(), status = run_status,
    received_count = received, unique_count = unique_offers,
    removed_count = removed, error = run_error where id = run_id;
  return removed;
end;
$$;

revoke all on function public.finish_partner_reindex(uuid, integer, integer, text, text) from public, anon, authenticated;
grant execute on function public.finish_partner_reindex(uuid, integer, integer, text, text) to service_role;
