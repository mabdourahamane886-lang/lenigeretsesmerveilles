-- Publications vidéo préparées le 19 novembre 2026.
-- Exécuter uniquement dans le projet Supabase de « Le Niger et ses Merveilles ».
-- Script idempotent : une vidéo déjà enregistrée (même media_url) ne sera pas dupliquée.

insert into public.niger_publications (
  author_name,
  content,
  media_url,
  media_type,
  location,
  visibility,
  published,
  published_at
)
select
  'Le Niger et ses Merveilles',
  'Le Niger, terre de rencontres et d’événements.

Des espaces de rencontre accueillent conférences, échanges et initiatives qui font vivre le dynamisme du pays. Découvrez ces lieux qui rapprochent les idées et les personnes.',
  'https://cdn.smoothbundle.com/abdourahamane-mohamed/le-niger-et-ses-merveilles-media/publications/videos/2026/niamey-espace-conference.mp4',
  'video',
  'Niger',
  'public',
  true,
  now()
where not exists (
  select 1 from public.niger_publications
  where media_url = 'https://cdn.smoothbundle.com/abdourahamane-mohamed/le-niger-et-ses-merveilles-media/publications/videos/2026/niamey-espace-conference.mp4'
);

insert into public.niger_publications (
  author_name,
  content,
  media_url,
  media_type,
  location,
  visibility,
  published,
  published_at
)
select
  'Le Niger et ses Merveilles',
  'Niamey, la capitale nigérienne illuminée.

À la tombée de la nuit, Niamey dévoile un autre visage. Ses lumières dessinent le paysage urbain et racontent le rythme de la capitale.',
  'https://cdn.smoothbundle.com/abdourahamane-mohamed/le-niger-et-ses-merveilles-media/publications/videos/2026/niamey-vue-du-ciel.mp4',
  'video',
  'Niamey, Niger',
  'public',
  true,
  now()
where not exists (
  select 1 from public.niger_publications
  where media_url = 'https://cdn.smoothbundle.com/abdourahamane-mohamed/le-niger-et-ses-merveilles-media/publications/videos/2026/niamey-vue-du-ciel.mp4'
);
