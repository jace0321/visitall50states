-- Optional: enforces one row per user and fixes PostgREST upsert ON CONFLICT(user_id) if you use it elsewhere.
-- App code now uses update-or-insert and does not require this, but the index keeps data correct.
-- Run in Supabase SQL Editor if `users_maps` has duplicate user_id rows (clean those first) or missing uniqueness.

create unique index if not exists users_maps_user_id_uidx on public.users_maps (user_id);
