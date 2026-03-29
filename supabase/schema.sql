-- Visit All 50 States — Supabase Schema
-- Run this in the Supabase SQL editor to set up tables.

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

create or replace trigger users_maps_set_updated_at
before update on users_maps
for each row execute function set_updated_at();

alter table users_maps enable row level security;

create policy if not exists "users can view their own map"
on users_maps
for select
using (auth.uid() = user_id);

create policy if not exists "users can insert their own map"
on users_maps
for insert
with check (auth.uid() = user_id);

create policy if not exists "users can update their own map"
on users_maps
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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
create index if not exists idx_community_posts_state on community_posts(state_code);
create index if not exists idx_community_posts_user on community_posts(user_id);
create index if not exists idx_email_signups_email on email_signups(email);
