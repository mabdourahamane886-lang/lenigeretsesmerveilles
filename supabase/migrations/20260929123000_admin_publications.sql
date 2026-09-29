-- Facebook-style admin publications for Le Niger et ses Merveilles
create table if not exists public.niger_publications (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Le Niger et ses Merveilles',
  content text not null default '',
  media_url text,
  media_type text not null default 'none' check (media_type in ('none','photo','video')),
  music_url text,
  tagged_people text[] not null default '{}',
  location text,
  mood text,
  activity text,
  allow_messages boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public','private')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists niger_publications_published_idx
  on public.niger_publications(published, published_at desc);

alter table public.niger_publications enable row level security;

drop policy if exists niger_publications_public_read on public.niger_publications;
create policy niger_publications_public_read
  on public.niger_publications
  for select
  to anon, authenticated
  using (published = true and visibility = 'public');

drop policy if exists niger_publications_admin_write on public.niger_publications;
create policy niger_publications_admin_write
  on public.niger_publications
  for all
  to authenticated
  using (niger_is_admin())
  with check (niger_is_admin());
