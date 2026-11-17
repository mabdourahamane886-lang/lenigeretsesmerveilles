-- NIGER MEDIA AUTOMATION: scheduling and per-network delivery queue.
-- Credentials are deliberately NOT stored in these tables.
alter table public.niger_publications
  add column if not exists scheduled_at timestamptz,
  add column if not exists distribution_targets text[] not null default '{}',
  add column if not exists automation_status text not null default 'published'
    check (automation_status in ('draft','scheduled','published','partially_sent','failed'));

create index if not exists niger_publications_scheduled_idx
  on public.niger_publications (scheduled_at)
  where automation_status = 'scheduled';

create table if not exists public.niger_publication_deliveries (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.niger_publications(id) on delete cascade,
  platform text not null check (platform in ('facebook','instagram','tiktok','whatsapp')),
  status text not null default 'pending'
    check (status in ('pending','processing','published','failed','skipped')),
  external_post_id text,
  external_url text,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  scheduled_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (publication_id, platform)
);

create index if not exists niger_publication_deliveries_queue_idx
  on public.niger_publication_deliveries (status, scheduled_at, created_at);

alter table public.niger_publication_deliveries enable row level security;

drop policy if exists niger_publication_deliveries_admin_only
  on public.niger_publication_deliveries;
create policy niger_publication_deliveries_admin_only
  on public.niger_publication_deliveries
  for all to authenticated
  using (niger_is_admin())
  with check (niger_is_admin());

comment on table public.niger_publication_deliveries is
  'Queue and audit history for social publishing. OAuth tokens belong in encrypted server-side secrets, never here.';
