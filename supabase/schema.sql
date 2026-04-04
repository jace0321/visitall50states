-- Visit All 50 States — Supabase Schema
-- Safe to rerun in the Supabase SQL editor.

-- Users' saved maps
create table if not exists users_maps (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  states_visited jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_maps_set_updated_at on users_maps;
create trigger users_maps_set_updated_at
before update on users_maps
for each row execute function set_updated_at();

alter table users_maps enable row level security;

drop policy if exists "users can view their own map" on users_maps;
create policy "users can view their own map"
on users_maps
for select
using (auth.uid() = user_id);

drop policy if exists "users can insert their own map" on users_maps;
create policy "users can insert their own map"
on users_maps
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update their own map" on users_maps;
create policy "users can update their own map"
on users_maps
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Public traveler profiles
create table if not exists traveler_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  bio text,
  home_state text,
  travel_style text,
  traveling_with text,
  is_public boolean not null default false,
  featured_state text,
  current_route_label text,
  north_star text,
  next_targets jsonb not null default '[]'::jsonb,
  route_highlights jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists traveler_profiles_set_updated_at on traveler_profiles;
create trigger traveler_profiles_set_updated_at
before update on traveler_profiles
for each row execute function set_updated_at();

alter table traveler_profiles enable row level security;

drop policy if exists "public can view public traveler profiles" on traveler_profiles;
create policy "public can view public traveler profiles"
on traveler_profiles
for select
using (is_public = true);

drop policy if exists "users can view their own traveler profile" on traveler_profiles;
create policy "users can view their own traveler profile"
on traveler_profiles
for select
using (auth.uid() = user_id);

drop policy if exists "users can insert their own traveler profile" on traveler_profiles;
create policy "users can insert their own traveler profile"
on traveler_profiles
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update their own traveler profile" on traveler_profiles;
create policy "users can update their own traveler profile"
on traveler_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Public traveler page loads map states with the anon key (no logged-in user). Allow read when the profile is public.
drop policy if exists "public can read users_maps for public traveler profiles" on users_maps;
create policy "public can read users_maps for public traveler profiles"
on users_maps
for select
using (
  exists (
    select 1
    from public.traveler_profiles tp
    where tp.user_id = users_maps.user_id
      and tp.is_public = true
  )
);

-- Traveler state journal entries
create table if not exists traveler_state_entries (
  id uuid default gen_random_uuid() primary key,
  traveler_profile_id uuid not null references traveler_profiles(id) on delete cascade,
  state_code text not null,
  state_name text not null,
  slug text not null,
  status text not null default 'visited',
  title text not null,
  summary text not null,
  story text not null,
  favorite_memory text,
  best_stop text,
  hidden_gem text,
  best_food text,
  rating integer,
  date_visited date,
  city_region text,
  family_friendly boolean not null default true,
  worth_detour boolean not null default true,
  photos jsonb not null default '[]'::jsonb,
  comments jsonb not null default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (traveler_profile_id, state_code),
  unique (traveler_profile_id, slug)
);

drop trigger if exists traveler_state_entries_set_updated_at on traveler_state_entries;
create trigger traveler_state_entries_set_updated_at
before update on traveler_state_entries
for each row execute function set_updated_at();

alter table traveler_state_entries enable row level security;

drop policy if exists "public can view entries for public traveler profiles" on traveler_state_entries;
create policy "public can view entries for public traveler profiles"
on traveler_state_entries
for select
using (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_entries.traveler_profile_id
      and traveler_profiles.is_public = true
  )
);

drop policy if exists "users can view their own traveler entries" on traveler_state_entries;
create policy "users can view their own traveler entries"
on traveler_state_entries
for select
using (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_entries.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can insert their own traveler entries" on traveler_state_entries;
create policy "users can insert their own traveler entries"
on traveler_state_entries
for insert
with check (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_entries.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can update their own traveler entries" on traveler_state_entries;
create policy "users can update their own traveler entries"
on traveler_state_entries
for update
using (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_entries.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_entries.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

-- Structured media attached to traveler state entries (photo-first, video-ready)
create table if not exists traveler_state_media (
  id uuid default gen_random_uuid() primary key,
  traveler_state_entry_id uuid not null references traveler_state_entries(id) on delete cascade,
  traveler_profile_id uuid not null references traveler_profiles(id) on delete cascade,
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
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (coalesce(public_url, storage_path) is not null)
);

drop trigger if exists traveler_state_media_set_updated_at on traveler_state_media;
create trigger traveler_state_media_set_updated_at
before update on traveler_state_media
for each row execute function set_updated_at();

alter table traveler_state_media enable row level security;

drop policy if exists "public can view media for public traveler profiles" on traveler_state_media;
create policy "public can view media for public traveler profiles"
on traveler_state_media
for select
using (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.is_public = true
  )
);

drop policy if exists "users can view their own traveler media" on traveler_state_media;
create policy "users can view their own traveler media"
on traveler_state_media
for select
using (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can insert their own traveler media" on traveler_state_media;
create policy "users can insert their own traveler media"
on traveler_state_media
for insert
with check (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can update their own traveler media" on traveler_state_media;
create policy "users can update their own traveler media"
on traveler_state_media
for update
using (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

drop policy if exists "users can delete their own traveler media" on traveler_state_media;
create policy "users can delete their own traveler media"
on traveler_state_media
for delete
using (
  exists (
    select 1 from traveler_profiles
    where traveler_profiles.id = traveler_state_media.traveler_profile_id
      and traveler_profiles.user_id = auth.uid()
  )
);

insert into traveler_state_media (
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
from traveler_state_entries as entry
cross join lateral jsonb_array_elements(entry.photos) with ordinality as legacy(photo, photo_index)
where nullif(photo ->> 'url', '') is not null
  and not exists (
    select 1 from traveler_state_media as media
    where media.traveler_state_entry_id = entry.id
      and coalesce(media.public_url, '') = coalesce(photo ->> 'url', '')
      and coalesce(media.caption, '') = coalesce(photo ->> 'caption', '')
  );

-- Community posts (future feature)
create table if not exists community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  state_code text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Email signups
create table if not exists email_signups (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_traveler_profiles_username on traveler_profiles(username);
create index if not exists idx_traveler_profiles_public on traveler_profiles(is_public);
create index if not exists idx_traveler_state_entries_profile on traveler_state_entries(traveler_profile_id);
create index if not exists idx_traveler_state_entries_slug on traveler_state_entries(slug);
create index if not exists idx_traveler_state_entries_state_code on traveler_state_entries(state_code);
create index if not exists idx_traveler_state_media_entry on traveler_state_media(traveler_state_entry_id);
create index if not exists idx_traveler_state_media_profile on traveler_state_media(traveler_profile_id);
create index if not exists idx_traveler_state_media_kind on traveler_state_media(media_kind);
create index if not exists idx_traveler_state_media_sort_order on traveler_state_media(traveler_state_entry_id, sort_order);
create index if not exists idx_community_posts_state on community_posts(state_code);
create index if not exists idx_community_posts_user on community_posts(user_id);
create index if not exists idx_email_signups_email on email_signups(email);
