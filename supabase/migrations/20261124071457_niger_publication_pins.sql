alter table public.niger_publications
  add column pinned_at timestamptz;

create function public.set_niger_publication_pin(publication_id uuid, should_pin boolean)
returns boolean
language sql
security invoker
set search_path = ''
as $$
  with changed as (
    update public.niger_publications
    set pinned_at = case when should_pin then coalesce(pinned_at, statement_timestamp()) else null end
    where id = publication_id and published and visibility = 'public' and should_pin is not null
    returning id
  )
  select exists(select 1 from changed);
$$;

revoke all on function public.set_niger_publication_pin(uuid, boolean) from public, anon, authenticated;
grant execute on function public.set_niger_publication_pin(uuid, boolean) to service_role;
