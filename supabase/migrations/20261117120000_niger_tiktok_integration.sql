-- Secure storage for connected social accounts. OAuth tokens are encrypted by the application.
create table if not exists public.niger_social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('facebook','instagram','tiktok','whatsapp')),
  account_id text not null,
  token_ciphertext text not null,
  token_iv text not null,
  scopes text[] not null default '{}',
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, account_id)
);

alter table public.niger_social_accounts enable row level security;
revoke all on public.niger_social_accounts from anon, authenticated;
drop policy if exists niger_social_accounts_no_client_access on public.niger_social_accounts;
create policy niger_social_accounts_no_client_access
  on public.niger_social_accounts for all to anon, authenticated
  using (false) with check (false);

alter table public.niger_publication_deliveries
  drop constraint if exists niger_publication_deliveries_status_check;
alter table public.niger_publication_deliveries
  add constraint niger_publication_deliveries_status_check
  check (status in ('pending','processing','uploaded','published','failed','skipped'));

comment on table public.niger_social_accounts is
  'OAuth credentials encrypted with AES-256-GCM by the application; access only through server-side service role.';
