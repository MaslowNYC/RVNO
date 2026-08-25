-- RVNO Database Migrations v6
-- A second favorite song, for joint member cards (couples).
-- (Already applied to the RVNO Supabase project; kept here for the record.)

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS song_credit text,
  ADD COLUMN IF NOT EXISTS song2_title text,
  ADD COLUMN IF NOT EXISTS song2_artist text,
  ADD COLUMN IF NOT EXISTS song2_spotify_id text,
  ADD COLUMN IF NOT EXISTS song2_credit text;

COMMENT ON COLUMN public.members.song_credit IS 'Who picked song 1. Only used on joint cards (couples); leave null otherwise.';
COMMENT ON COLUMN public.members.song2_title IS 'Second favorite song, for joint member cards';
COMMENT ON COLUMN public.members.song2_credit IS 'Who picked song 2, e.g. "Maggie"';
