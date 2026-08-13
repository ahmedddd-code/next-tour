select cron.unschedule(jobid) from cron.job where jobname = 'nexttour-partner-photo-sync-hourly';
select cron.schedule(
  'nexttour-partner-photo-sync-hourly',
  '27 * * * *',
  $$select net.http_post(
    url := 'https://iidfyuxfcakyixhhbugx.supabase.co/functions/v1/partner-photo-sync',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{"scheduled":true}'::jsonb
  );$$
);
