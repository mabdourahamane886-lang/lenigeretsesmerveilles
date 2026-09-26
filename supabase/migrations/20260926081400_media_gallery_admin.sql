-- Média admin: catégories + index pour la galerie
alter table public.niger_media
  add column if not exists media_category text not null default 'photo';

create index if not exists niger_media_published_created_idx
  on public.niger_media (published, created_at desc);

create index if not exists niger_media_type_idx
  on public.niger_media (media_type);
