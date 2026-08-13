delete from public.app_tours
where id like 'partner-funsun-%'
  and not (data ? 'sourceCurrency');

update public.partner_sync_state
set status = 'idle', error = null
where source = 'all' and status = 'running';
