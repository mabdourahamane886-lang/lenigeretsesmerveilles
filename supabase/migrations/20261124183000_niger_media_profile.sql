-- Identité publique du média, indépendante des publications.
create table if not exists public.niger_media_profile (
  id integer primary key default 1 check (id = 1),
  avatar_path text,
  cover_path text,
  updated_at timestamptz not null default now()
);
alter table public.niger_media_profile enable row level security;
drop policy if exists "media profile public read" on public.niger_media_profile;
create policy "media profile public read" on public.niger_media_profile for select using (true);
-- Writes are made exclusively through the server using a service-role key,
-- after verifying the existing administrator session.
insert into public.niger_media_profile(id) values (1) on conflict (id) do nothing;
