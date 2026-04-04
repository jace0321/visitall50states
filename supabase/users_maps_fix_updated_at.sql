/*
  users_maps: add updated_at / created_at if missing.
  Fixes: record "new" has no field "updated_at" on UPDATE.
  Run once in Supabase SQL editor. Copy everything below including alters.
*/

alter table public.users_maps
  add column if not exists updated_at timestamptz default now();

alter table public.users_maps
  add column if not exists created_at timestamptz default now();

update public.users_maps
set
  updated_at = coalesce(updated_at, now()),
  created_at = coalesce(created_at, now())
where true;
