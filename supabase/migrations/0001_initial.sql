create extension if not exists pgcrypto;

create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.wonders (
  id uuid primary key default gen_random_uuid(),
  region_id uuid references public.regions(id) on delete set null,
  name text not null,
  slug text not null unique,
  type text not null,
  description text,
  image_url text,
  latitude double precision,
  longitude double precision,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  cover_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user','editor','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  wonder_id uuid not null references public.wonders(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, wonder_id)
);

create table if not exists public.contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  location text,
  image_url text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

alter table public.regions enable row level security;
alter table public.wonders enable row level security;
alter table public.articles enable row level security;
alter table public.events enable row level security;
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.contributions enable row level security;

create policy "published regions are public" on public.regions for select using (true);
create policy "published wonders are public" on public.wonders for select using (published = true);
create policy "published articles are public" on public.articles for select using (published = true);
create policy "published events are public" on public.events for select using (published = true);

create policy "users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "users read own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "users create own favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "users delete own favorites" on public.favorites for delete using (auth.uid() = user_id);

create policy "users create contributions" on public.contributions for insert with check (auth.uid() = user_id);
create policy "users read own contributions" on public.contributions for select using (auth.uid() = user_id);

create index if not exists wonders_region_id_idx on public.wonders(region_id);
create index if not exists wonders_published_idx on public.wonders(published);
create index if not exists articles_published_idx on public.articles(published);
create index if not exists events_starts_at_idx on public.events(starts_at);

insert into public.regions (name, slug, description)
values
  ('Agadez','agadez','Région du nord du Niger, connue pour son patrimoine et ses paysages sahariens.'),
  ('Diffa','diffa','Région de l’est du Niger.'),
  ('Dosso','dosso','Région du sud-ouest du Niger.'),
  ('Maradi','maradi','Région du centre-sud du Niger.'),
  ('Niamey','niamey','Capitale et principal centre urbain du Niger.'),
  ('Tahoua','tahoua','Région du centre-ouest du Niger.'),
  ('Tillabéri','tillaberi','Région de l’ouest du Niger.'),
  ('Zinder','zinder','Région historique du centre-est du Niger.')
on conflict (slug) do nothing;
