-- Durable, consent-based memories for authenticated Niger IA users.
-- Apply through the project's normal Supabase migration workflow; this file does not execute itself.
create table if not exists public.merveilles_ai_user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  memory_key text not null check (char_length(trim(memory_key)) between 1 and 100),
  content text not null check (char_length(trim(content)) between 1 and 2000),
  consent_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, memory_key),
  check (expires_at is null or expires_at > created_at)
);

create index if not exists merveilles_ai_user_memories_user_expiry_idx
  on public.merveilles_ai_user_memories (user_id, expires_at);

alter table public.merveilles_ai_user_memories enable row level security;

drop policy if exists "Users manage own Niger IA memories" on public.merveilles_ai_user_memories;
create policy "Users manage own Niger IA memories"
  on public.merveilles_ai_user_memories
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

revoke all on public.merveilles_ai_user_memories from anon, public;
grant select, insert, update, delete on public.merveilles_ai_user_memories to authenticated;
