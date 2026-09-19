-- Le Niger et ses Merveilles — owner-only publishing hardening
-- Public users can read published content; only accounts in niger_admins
-- with role=admin can create, edit, publish or delete platform content.

create or replace function public.niger_is_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1 from public.niger_admins
    where user_id = (select auth.uid())
      and role = 'admin'
  );
$$;

drop policy if exists niger_articles_admin_write on public.niger_articles;
create policy niger_articles_admin_write on public.niger_articles for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_wonders_admin_write on public.niger_wonders;
create policy niger_wonders_admin_write on public.niger_wonders for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_cultures_admin_write on public.niger_cultures;
create policy niger_cultures_admin_write on public.niger_cultures for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_gastronomy_admin_write on public.niger_gastronomy;
create policy niger_gastronomy_admin_write on public.niger_gastronomy for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_events_admin_write on public.niger_events;
create policy niger_events_admin_write on public.niger_events for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_regions_admin_write on public.niger_regions;
create policy niger_regions_admin_write on public.niger_regions for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_categories_admin_write on public.niger_categories;
create policy niger_categories_admin_write on public.niger_categories for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_media_admin_write on public.niger_media;
create policy niger_media_admin_write on public.niger_media for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_advertisements_admin_write on public.niger_advertisements;
create policy niger_advertisements_admin_write on public.niger_advertisements for all to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_contributions_admin_update on public.niger_contributions;
create policy niger_contributions_admin_update on public.niger_contributions for update to authenticated
using (niger_is_admin()) with check (niger_is_admin());

drop policy if exists niger_contributions_admin_delete on public.niger_contributions;
create policy niger_contributions_admin_delete on public.niger_contributions for delete to authenticated
using (niger_is_admin());
