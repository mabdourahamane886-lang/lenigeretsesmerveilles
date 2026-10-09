-- Ensure the publication composer can upload public photos, videos and audio.
-- The server uses the service-role client for uploads; no client-side write policy is needed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'niger-media',
  'niger-media',
  true,
  52428800,
  array[
    'image/*',
    'video/*',
    'audio/*'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;
