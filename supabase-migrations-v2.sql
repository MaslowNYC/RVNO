-- RVNO Database Migrations v2
-- Run this in Supabase SQL Editor to add new features

-- ============================================
-- 1. Photos: Add per-photo GPS and date fields
-- ============================================
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION DEFAULT NULL,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION DEFAULT NULL,
ADD COLUMN IF NOT EXISTS taken_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient GPS queries on photos
CREATE INDEX IF NOT EXISTS idx_photos_gps
ON photos (location_lat, location_lng)
WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;

-- ============================================
-- 2. Members: Add member_type distinction
-- ============================================
-- Create the enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_type_enum') THEN
        CREATE TYPE member_type_enum AS ENUM ('member', 'friend');
    END IF;
END $$;

-- Add the column with default 'member'
ALTER TABLE members
ADD COLUMN IF NOT EXISTS member_type TEXT DEFAULT 'member' CHECK (member_type IN ('member', 'friend'));

-- ============================================
-- 3. Albums: Add offset fields for draggable dots
-- ============================================
ALTER TABLE albums
ADD COLUMN IF NOT EXISTS offset_x DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS offset_y DOUBLE PRECISION DEFAULT 0;

-- ============================================
-- 4. Update RLS policies if needed
-- ============================================
-- Photos GPS fields inherit existing RLS
-- Members member_type inherits existing RLS
-- Albums offset fields inherit existing RLS

-- Verify the changes
SELECT 'Migration complete!' as status;
