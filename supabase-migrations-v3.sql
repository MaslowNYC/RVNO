-- RVNO Database Migrations v3
-- Run this in Supabase SQL Editor to apply fixes

-- ============================================
-- 1. Fix Tom's location (was incorrectly set to New Zealand)
-- ============================================
UPDATE members
SET
  country = 'USA',
  state = 'Virginia',
  -- Re-geocode will happen on next admin edit, or set approximate coords for Roanoke Valley area
  location_lat = 37.2710,
  location_lng = -79.9414
WHERE name ILIKE '%tom%' AND (country ILIKE '%new zealand%' OR country ILIKE '%nz%');

-- If Tom has no country set but wrong coords, also fix
UPDATE members
SET
  country = 'USA',
  state = 'Virginia',
  location_lat = 37.2710,
  location_lng = -79.9414
WHERE name ILIKE '%tom%' AND location_lat < 0;  -- Southern hemisphere = wrong

-- Verify the change
SELECT name, city, state, country, location_lat, location_lng
FROM members
WHERE name ILIKE '%tom%';
