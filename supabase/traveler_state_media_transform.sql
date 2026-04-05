-- Optional map placement (mobile + web): scale / offset / rotation for featured photo in state shape.
-- Run in Supabase SQL Editor after traveler_state_media exists. Safe to re-run.

alter table public.traveler_state_media
  add column if not exists media_transform jsonb;

comment on column public.traveler_state_media.media_transform is
  'Placement on map: { "scale": number, "offsetX": number, "offsetY": number, "rotation"?: number }';
