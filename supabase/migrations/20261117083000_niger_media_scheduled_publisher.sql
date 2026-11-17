-- Publish scheduled website posts automatically every minute.
create extension if not exists pg_cron with schema pg_catalog;

create or replace function public.publish_due_niger_publications()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  changed_count integer;
begin
  update public.niger_publications
     set published = true,
         published_at = coalesce(scheduled_at, now()),
         automation_status = 'published',
         updated_at = now()
   where automation_status = 'scheduled'
     and scheduled_at is not null
     and scheduled_at <= now()
     and visibility = 'public';

  get diagnostics changed_count = row_count;
  return changed_count;
end;
$$;

revoke all on function public.publish_due_niger_publications() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'niger-media-publish-due') then
    perform cron.unschedule(jobid)
      from cron.job
     where jobname = 'niger-media-publish-due';
  end if;
end
$$;

select cron.schedule(
  'niger-media-publish-due',
  '* * * * *',
  'select public.publish_due_niger_publications();'
);
