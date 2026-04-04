/*
  Allow compressed video in the traveler-state-media bucket and raise per-file limit.
  Run in Supabase SQL after storage_traveler_state_media.sql.

  Browser uploads cannot re-encode video without heavy WASM; users should upload
  pre-compressed MP4/WebM (e.g. phone “export” or HandBrake). Cap count in app (5/state).
*/

update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]::text[]
where id = 'traveler-state-media';
