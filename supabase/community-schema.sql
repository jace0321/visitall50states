-- Community / traveler dashboards schema for visitall50states.com
-- MVP-first structure: profiles, personal state entries, photos, checks, tags, comments, badges

create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  avatar_url text,
  bio text,
  journey_summary text,
  home_state text,
  travel_style text,
  traveling_with text,
  website_url text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 32)
);

create table if not exists user_stats (
  user_id uuid primary key references profiles(id) on delete cascade,
  states_visited_count int not null default 0,
  states_lived_count int not null default 0,
  capitals_visited_count int not null default 0,
  capitol_buildings_count int not null default 0,
  national_parks_count int not null default 0,
  completion_percent numeric(5,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists user_state_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  state_code text not null,
  status text not null default 'not_visited',
  title text,
  summary text,
  story text,
  favorite_memory text,
  what_surprised_me text,
  best_stop text,
  hidden_gem text,
  best_food text,
  would_return boolean,
  worth_detour boolean,
  family_friendly boolean,
  budget_level text,
  rating int,
  date_visited date,
  trip_type text,
  city_region text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, state_code),
  constraint user_state_entries_status check (status in ('not_visited', 'visited', 'lived', 'want_to_go')),
  constraint user_state_entries_rating check (rating is null or (rating >= 1 and rating <= 5)),
  constraint user_state_entries_state_code check (char_length(state_code) = 2)
);

create table if not exists user_state_checks (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid unique not null references user_state_entries(id) on delete cascade,
  capital_visited boolean not null default false,
  capitol_building_visited boolean not null default false,
  national_parks_visited_count int not null default 0,
  monuments_visited_count int not null default 0,
  scenic_drive_completed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists user_state_photos (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references user_state_entries(id) on delete cascade,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists user_state_tags (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references user_state_entries(id) on delete cascade,
  tag text not null
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references user_state_entries(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text,
  icon text
);

create table if not exists user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  badge_id uuid not null references badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create index if not exists idx_profiles_username on profiles(username);
create index if not exists idx_profiles_public on profiles(is_public);
create index if not exists idx_user_state_entries_user on user_state_entries(user_id);
create index if not exists idx_user_state_entries_state on user_state_entries(state_code);
create index if not exists idx_user_state_entries_public on user_state_entries(is_public);
create index if not exists idx_user_state_photos_entry on user_state_photos(entry_id);
create index if not exists idx_user_state_tags_entry on user_state_tags(entry_id);
create index if not exists idx_comments_entry on comments(entry_id);
create index if not exists idx_user_badges_user on user_badges(user_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger profiles_set_updated_at
before update on profiles
for each row execute function set_updated_at();

create or replace trigger user_stats_set_updated_at
before update on user_stats
for each row execute function set_updated_at();

create or replace trigger user_state_entries_set_updated_at
before update on user_state_entries
for each row execute function set_updated_at();

create or replace trigger user_state_checks_set_updated_at
before update on user_state_checks
for each row execute function set_updated_at();

alter table profiles enable row level security;
alter table user_stats enable row level security;
alter table user_state_entries enable row level security;
alter table user_state_checks enable row level security;
alter table user_state_photos enable row level security;
alter table user_state_tags enable row level security;
alter table comments enable row level security;
alter table user_badges enable row level security;

create policy "profiles public readable when profile is public"
on profiles for select
using (is_public = true or auth.uid() = id);

create policy "profiles owner insert"
on profiles for insert
with check (auth.uid() = id);

create policy "profiles owner update"
on profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "user_stats public readable"
on user_stats for select
using (
  exists (
    select 1 from profiles p
    where p.id = user_stats.user_id
      and (p.is_public = true or p.id = auth.uid())
  )
);

create policy "user_stats owner manage"
on user_stats for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "state entries public readable"
on user_state_entries for select
using (
  (is_public = true and exists (
    select 1 from profiles p where p.id = user_state_entries.user_id and p.is_public = true
  ))
  or auth.uid() = user_id
);

create policy "state entries owner manage"
on user_state_entries for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "checks readable with parent visibility"
on user_state_checks for select
using (
  exists (
    select 1 from user_state_entries e
    join profiles p on p.id = e.user_id
    where e.id = user_state_checks.entry_id
      and ((e.is_public = true and p.is_public = true) or e.user_id = auth.uid())
  )
);

create policy "checks owner manage"
on user_state_checks for all
using (
  exists (
    select 1 from user_state_entries e
    where e.id = user_state_checks.entry_id and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from user_state_entries e
    where e.id = user_state_checks.entry_id and e.user_id = auth.uid()
  )
);

create policy "photos readable with parent visibility"
on user_state_photos for select
using (
  exists (
    select 1 from user_state_entries e
    join profiles p on p.id = e.user_id
    where e.id = user_state_photos.entry_id
      and ((e.is_public = true and p.is_public = true) or e.user_id = auth.uid())
  )
);

create policy "photos owner manage"
on user_state_photos for all
using (
  exists (
    select 1 from user_state_entries e
    where e.id = user_state_photos.entry_id and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from user_state_entries e
    where e.id = user_state_photos.entry_id and e.user_id = auth.uid()
  )
);

create policy "tags readable with parent visibility"
on user_state_tags for select
using (
  exists (
    select 1 from user_state_entries e
    join profiles p on p.id = e.user_id
    where e.id = user_state_tags.entry_id
      and ((e.is_public = true and p.is_public = true) or e.user_id = auth.uid())
  )
);

create policy "tags owner manage"
on user_state_tags for all
using (
  exists (
    select 1 from user_state_entries e
    where e.id = user_state_tags.entry_id and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from user_state_entries e
    where e.id = user_state_tags.entry_id and e.user_id = auth.uid()
  )
);

create policy "comments readable with parent visibility"
on comments for select
using (
  exists (
    select 1 from user_state_entries e
    join profiles p on p.id = e.user_id
    where e.id = comments.entry_id
      and ((e.is_public = true and p.is_public = true) or e.user_id = auth.uid())
  )
);

create policy "comments author insert"
on comments for insert
with check (auth.uid() = user_id);

create policy "comments author update own"
on comments for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user badges readable with profile visibility"
on user_badges for select
using (
  exists (
    select 1 from profiles p
    where p.id = user_badges.user_id
      and (p.is_public = true or p.id = auth.uid())
  )
);

create policy "user badges owner manage"
on user_badges for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into badges (key, name, description, icon)
values
  ('first-state', 'First State', 'Visited your first state entry.', '🗺️'),
  ('ten-states', '10 States', 'Logged 10 states.', '🔟'),
  ('twenty-five-states', '25 States', 'Logged 25 states.', '⭐'),
  ('all-fifty', 'All 50', 'Completed all 50 states.', '🏆'),
  ('national-park-explorer', 'National Park Explorer', 'Visited national parks on your journey.', '🏔️'),
  ('capitol-collector', 'Capitol Collector', 'Visited state capitals and capitol buildings.', '🏛️')
on conflict (key) do nothing;
