-- RVNO Database Migrations v4
-- Run this in Supabase SQL Editor to add photo rotation support

-- ============================================
-- 1. Add rotation column to photos table
-- ============================================
ALTER TABLE photos
ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0;

-- Add a comment for documentation
COMMENT ON COLUMN photos.rotation IS 'Photo rotation in degrees (0, 90, 180, 270)';

-- Verify the change
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'photos' AND column_name = 'rotation';
