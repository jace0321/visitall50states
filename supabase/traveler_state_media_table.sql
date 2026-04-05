-- Create public.traveler_state_media + RLS (run in Supabase SQL Editor if uploads say table is missing).
-- Requires: traveler_profiles, traveler_state_entries already exist.
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS.

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.traveler_state_media (
  id uuid default gen_random_uuid() primary key,
  traveler_state_entry_id uuid not null references public.traveler_state_entries(id) on delete cascade,
  traveler_profile_id uuid not null references public.traveler_profiles(id) on delete cascade,
  media_kind text not null default 'photo' check (media_kind in ('photo', 'video')),
  storage_provider text,
  storage_bucket text,
  storage_path text,
  public_url text,
  poster_url text,
  caption text,
  alt_text text,
  credit text,
  credit_url text,
  source_url text,
  mime_type text,
  width integer,
  height integer,
  duration_seconds numeric(10,2),
  file_bytes bigint,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  media_transform jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (coalesce(public_url, storage_path) is not null)
);

drop trigger if exists traveler_state_media_set_updated_at on public.traveler_state_media;
create trigger traveler_state_media_set_updated_at
before update on public.traveler_state_media
for each row execute function public.set_updated_at();

alter table public.traveler_state_media enable row level security;

drop policy if exists "public can view media for public traveler profiles" on public.traveler_state_media;
create policy "public can view media for public traveler profiles"
on public.traveler_state_media
for select
using (
  exists (
    select 1 from public.traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.is_public = true
  )
);

drop policy if exists "users can view their own traveler media" on public.traveler_state_media;
create policy "users can view their own traveler media"
on public.traveler_state_media
for select
using (
  exists (
    select 1 from public.traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can insert their own traveler media" on public.traveler_state_media;
create policy "users can insert their own traveler media"
on public.traveler_state_media
for insert
with check (
  exists (
    select 1 from public.traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can update their own traveler media" on public.traveler_state_media;
create policy "users can update their own traveler media"
on public.traveler_state_media
for update
using (
  exists (
    select 1 from public.traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can delete their own traveler media" on public.traveler_state_media;
create policy "users can delete their own traveler media"
on public.traveler_state_media
for delete
using (
  exists (
    select 1 from public.traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

create index if not exists idx_traveler_state_media_entry on public.traveler_state_media(traveler_state_entry_id);
create index if not exists idx_traveler_state_media_profile on public.traveler_state_media(traveler_profile_id);

-- Optional: copy legacy JSON photos into rows (skips duplicates). Safe to run once.
insert into public.traveler_state_media (
  traveler_state_entry_id,
  traveler_profile_id,
  media_kind,
  public_url,
  caption,
  alt_text,
  sort_order,
  is_featured
)
select
  entry.id,
  entry.traveler_profile_id,
  'photo',
  nullif(photo ->> 'url', ''),
  nullif(photo ->> 'caption', ''),
  nullif(photo ->> 'caption', ''),
  photo_index - 1,
  photo_index = 1
from public.traveler_state_entries as entry
cross join lateral jsonb_array_elements(entry.photos) with ordinality as legacy(photo, photo_index)
where nullif(photo ->> 'url', '') is not null
  and not exists (
    select 1 from public.traveler_state_media as media
    where media.traveler_state_entry_id = entry.id
      and coalesce(media.public_url, '') = coalesce(photo ->> 'url', '')
      and coalesce(media.caption, '') = coalesce(photo ->> 'caption', '')
  );
