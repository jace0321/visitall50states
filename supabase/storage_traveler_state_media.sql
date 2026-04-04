-- Run in Supabase SQL editor (or migrate) after main schema exists.
-- Creates a public bucket so journal pages can load images without signed URLs.
-- Upload paths must be: {auth.uid()}/{entry_uuid}/{filename} — enforced by storage policies.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'traveler-state-media',
  'traveler-state-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "traveler_state_media public read" on storage.objects;
create policy "traveler_state_media public read"
on storage.objects for select
using (bucket_id = 'traveler-state-media');

drop policy if exists "traveler_state_media owner insert" on storage.objects;
create policy "traveler_state_media owner insert"
on storage.objects for insert
with check (
  bucket_id = 'traveler-state-media'
  and auth.uid() is not null
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "traveler_state_media owner update" on storage.objects;
create policy "traveler_state_media owner update"
on storage.objects for update
using (
  bucket_id = 'traveler-state-media'
  and auth.uid() is not null
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "traveler_state_media owner delete" on storage.objects;
create policy "traveler_state_media owner delete"
on storage.objects for delete
using (
  bucket_id = 'traveler-state-media'
  and auth.uid() is not null
  and auth.uid()::text = (storage.foldername(name))[1]
);
