-- Run the social delivery worker through Supabase pg_cron + pg_net.
-- The niger_media_cron_secret value must be stored in Supabase Vault before enabling this job.
create extension if not exists pg_net;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'niger-media-dispatch') then
    perform cron.unschedule(jobid)
      from cron.job
     where jobname = 'niger-media-dispatch';
  end if;
end
$$;

select cron.schedule(
  'niger-media-dispatch',
  '* * * * *',
  $job$
    select net.http_get(
      url := 'https://lenigeretsesmerveilles.vercel.app/api/cron/niger-media',
      headers := jsonb_build_object(
        'Authorization',
        'Bearer ' || (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'niger_media_cron_secret'
          limit 1
        )
      ),
      timeout_milliseconds := 55000
    );
  $job$
);
