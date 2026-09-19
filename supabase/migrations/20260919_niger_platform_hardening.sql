-- Le Niger et ses Merveilles — platform hardening migration

insert into public.niger_categories (name, slug, description)
select v.name, v.slug, v.description
from (values
  ('Patrimoine', 'patrimoine', 'Sites historiques, architecture et héritage culturel.'),
  ('Paysages', 'paysages', 'Déserts, massifs, fleuves et paysages naturels du Niger.'),
  ('Nature', 'nature', 'Parcs, réserves et espaces naturels.'),
  ('Histoire', 'histoire', 'Lieux et récits historiques du Niger.'),
  ('Culture', 'culture', 'Traditions, artisanat, musique et savoir-faire.')
) as v(name, slug, description)
where not exists (select 1 from public.niger_categories c where c.slug = v.slug);

alter table public.niger_contributions
  add column if not exists contributor_email text,
  add column if not exists category text not null default 'découverte';

create index if not exists niger_events_published_starts_idx on public.niger_events (published, starts_at);
create index if not exists niger_articles_published_at_idx on public.niger_articles (published, published_at desc);
create index if not exists niger_wonders_featured_idx on public.niger_wonders (published, featured desc, name);

drop policy if exists niger_contributions_admin_write on public.niger_contributions;
drop policy if exists niger_contributions_own_insert on public.niger_contributions;
drop policy if exists niger_contributions_own_select on public.niger_contributions;

create policy niger_contributions_select on public.niger_contributions for select to anon, authenticated
using (niger_is_admin() or (auth.uid() is not null and auth.uid() = user_id));

create policy niger_contributions_insert on public.niger_contributions for insert to anon, authenticated
with check (status = 'pending' and (user_id is null or auth.uid() = user_id));

create policy niger_contributions_admin_update on public.niger_contributions for update to authenticated
using (niger_is_admin()) with check (niger_is_admin());

create policy niger_contributions_admin_delete on public.niger_contributions for delete to authenticated
using (niger_is_admin());

insert into public.niger_media (title, description, media_type, url, credit, region_id, wonder_id, published)
select * from (
  values
  ('Grande Mosquée d’Agadez','Vue du centre historique d’Agadez et de sa grande mosquée.','photo','https://commons.wikimedia.org/wiki/Special:FilePath/Niger%2C_Agadez_%2828%29%2C_grand_mosque%2C_old_city.jpg?width=1800','Vincent van Zeijst — Wikimedia Commons — CC BY-SA 4.0',(select id from public.niger_regions where slug='agadez' limit 1),(select id from public.niger_wonders where slug='centre-historique-agadez' limit 1),true),
  ('Fleuve Niger à Niamey','Fleuve Niger à Niamey.','photo','https://commons.wikimedia.org/wiki/Special:FilePath/Niger_River_%C3%A0_Niamey.jpg?width=1800','Barke11 — Wikimedia Commons — CC BY-SA 4.0',(select id from public.niger_regions where slug='niamey' limit 1),(select id from public.niger_wonders where slug='fleuve-niger-niamey' limit 1),true),
  ('Palais du Sultan de Zinder','Palais du sultan à Zinder.','photo','https://commons.wikimedia.org/wiki/Special:FilePath/Zinder_%286328132791%29.jpg?width=1800','Roland — Wikimedia Commons — CC BY-SA 2.0',(select id from public.niger_regions where slug='zinder' limit 1),(select id from public.niger_wonders where slug='palais-sultan-zinder' limit 1),true),
  ('Parc national du W du Niger','Paysage du Parc national du W du Niger.','photo','https://commons.wikimedia.org/wiki/Special:FilePath/Niger_Parc_W_%28358428379%29.jpg?width=1600','Mathieu Dessus — Wikimedia Commons — CC BY-SA 2.0',(select id from public.niger_regions where slug='tillaberi' limit 1),(select id from public.niger_wonders where slug='parc-national-w-du-niger' limit 1),true),
  ('Dunes du Ténéré','Dunes de sable du désert du Ténéré.','photo','https://commons.wikimedia.org/wiki/Special:FilePath/Zibar_sand_dunes.jpg?width=1200','NASA — Wikimedia Commons — Domaine public',(select id from public.niger_regions where slug='agadez' limit 1),(select id from public.niger_wonders where slug='desert-du-tenere' limit 1),true)
) as m(title,description,media_type,url,credit,region_id,wonder_id,published)
where not exists (select 1 from public.niger_media x where x.url=m.url);

alter function public.niger_is_admin() set search_path = public;
