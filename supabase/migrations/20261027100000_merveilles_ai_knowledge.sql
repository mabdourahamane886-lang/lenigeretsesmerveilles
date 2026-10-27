-- Merveilles IA: base documentaire privée utilisée par app/api/assistant/route.ts
-- Les lectures serveur utilisent SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY.
-- Aucune politique anon/authenticated n'est créée : la base reste inaccessible au navigateur.

create table if not exists public.bickri_ai_knowledge (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  content text not null,
  keywords text[] not null default '{}',
  priority integer not null default 0,
  active boolean not null default true,
  source_label text,
  source_url text,
  language_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bickri_ai_knowledge_title_not_empty check (length(trim(title)) > 0),
  constraint bickri_ai_knowledge_content_not_empty check (length(trim(content)) > 0)
);

alter table public.bickri_ai_knowledge enable row level security;

create index if not exists bickri_ai_knowledge_active_priority_idx
  on public.bickri_ai_knowledge (active, priority desc);

create index if not exists bickri_ai_knowledge_category_idx
  on public.bickri_ai_knowledge (category);

create index if not exists bickri_ai_knowledge_keywords_gin_idx
  on public.bickri_ai_knowledge using gin (keywords);

comment on table public.bickri_ai_knowledge is
  'Base documentaire privée de Merveilles IA. Les données sont injectées côté serveur dans le contexte Gemini; ne pas exposer de secrets au client.';
