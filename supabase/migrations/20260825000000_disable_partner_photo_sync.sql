do $$
declare photo_job_id bigint;
begin
  for photo_job_id in
    select jobid from cron.job where jobname = 'nexttour-partner-photo-sync-hourly'
  loop
    perform cron.unschedule(photo_job_id);
  end loop;
end $$;
