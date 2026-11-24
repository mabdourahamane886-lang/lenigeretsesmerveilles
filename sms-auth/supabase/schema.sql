-- SMS AUTH · schéma autonome à exécuter dans un projet Supabase dédié.
-- Tables et OTP ne doivent jamais être exposés anonymement.
create table if not exists public.sms_auth_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 2 and 80),
  created_at timestamptz not null default now()
);

create table if not exists public.sms_auth_keys (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.sms_auth_projects(id) on delete cascade,
  prefix text not null,
  key_hash text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table if not exists public.sms_auth_challenges (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.sms_auth_projects(id) on delete cascade,
  phone text not null check (phone ~ '^\+[1-9][0-9]{7,14}$'),
  channel text not null default 'whatsapp' check (channel = 'whatsapp'),
  code_hash text not null,
  status text not null default 'pending' check (status in ('pending','sent','failed','verified','expired')),
  provider_status text,
  provider_message_id text,
  attempts integer not null default 0 check (attempts between 0 and 5),
  expires_at timestamptz not null,
  verified_at timestamptz,
  consent_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sms_auth_challenges_project_created_idx
  on public.sms_auth_challenges(project_id, created_at desc);
create index if not exists sms_auth_challenges_project_phone_idx
  on public.sms_auth_challenges(project_id, phone, created_at desc);
create index if not exists sms_auth_challenges_provider_idx
  on public.sms_auth_challenges(provider_message_id)
  where provider_message_id is not null;
create index if not exists sms_auth_keys_project_idx
  on public.sms_auth_keys(project_id) where revoked_at is null;

alter table public.sms_auth_projects enable row level security;
alter table public.sms_auth_keys enable row level security;
alter table public.sms_auth_challenges enable row level security;

-- Le propriétaire peut seulement consulter ses propres projets.
-- Les clés et codes OTP restent exclusivement côté serveur via service_role.
drop policy if exists "sms_auth_owner_view_projects" on public.sms_auth_projects;
create policy "sms_auth_owner_view_projects" on public.sms_auth_projects
  for select to authenticated using ((select auth.uid()) = owner_id);

-- Verrouillage transactionnel pour prévenir le contournement du délai
-- de renvoi en envoyant deux requêtes simultanées.
create schema if not exists sms_auth_private;
create or replace function sms_auth_private.limit_challenge_inserts()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(new.project_id::text || ':' || new.phone, 0)
  );
  if (select count(*) from public.sms_auth_challenges
      where project_id = new.project_id and phone = new.phone
      and created_at > now() - interval '60 seconds') > 0 then
    raise exception 'otp_cooldown' using errcode = 'P0001';
  end if;
  if (select count(*) from public.sms_auth_challenges
      where project_id = new.project_id and phone = new.phone
      and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'otp_phone_limit' using errcode = 'P0001';
  end if;
  if (select count(*) from public.sms_auth_challenges
      where project_id = new.project_id and created_at > now() - interval '1 hour') >= 300 then
    raise exception 'otp_project_limit' using errcode = 'P0001';
  end if;
  return new;
end
$$;

drop trigger if exists sms_auth_limit_challenges on public.sms_auth_challenges;
create trigger sms_auth_limit_challenges
  before insert on public.sms_auth_challenges
  for each row execute function sms_auth_private.limit_challenge_inserts();

revoke all on schema sms_auth_private from public;
revoke all on function sms_auth_private.limit_challenge_inserts() from public;
grant usage on schema sms_auth_private to service_role;
grant execute on function sms_auth_private.limit_challenge_inserts() to service_role;

-- La Data API n'est pas nécessaire pour anon/authenticated sur les clés/OTP.
revoke all on table public.sms_auth_keys from anon, authenticated;
revoke all on table public.sms_auth_challenges from anon, authenticated;
-- La consultation des projets est autorisée uniquement via la politique RLS.
grant select on table public.sms_auth_projects to authenticated;
