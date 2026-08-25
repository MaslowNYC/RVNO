-- RVNO Database Migrations v5
-- Adds favorite-song fields to members, powering the /jukebox page.
-- (Already applied to the RVNO Supabase project; kept here for the record.)

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS song_title text,
  ADD COLUMN IF NOT EXISTS song_artist text,
  ADD COLUMN IF NOT EXISTS song_spotify_id text,
  ADD COLUMN IF NOT EXISTS song_note text;

COMMENT ON COLUMN public.members.song_title IS 'Favorite song title';
COMMENT ON COLUMN public.members.song_artist IS 'Favorite song artist';
COMMENT ON COLUMN public.members.song_spotify_id IS 'Spotify track ID (22 chars) used for the embed player';
COMMENT ON COLUMN public.members.song_note IS 'Optional note, e.g. "submitted via Donna"';

CREATE INDEX IF NOT EXISTS idx_members_song
  ON public.members(song_spotify_id)
  WHERE song_spotify_id IS NOT NULL;

-- Nav: add the Jukebox link after The Crew
-- UPDATE nav_items SET sort_order = sort_order + 1 WHERE sort_order >= 4;
-- INSERT INTO nav_items (href, label, sort_order) VALUES ('/jukebox', 'Jukebox', 4);
