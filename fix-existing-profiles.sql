-- Fix existing profiles to have empty phone fields instead of NULL
-- Run this in your Supabase SQL Editor

-- Update existing profiles to have empty phone field instead of NULL
UPDATE profiles 
SET 
  phone = '',
  address = '',
  city = '',
  state = '',
  zip_code = '',
  country = 'Nigeria'
WHERE 
  phone IS NULL 
  OR address IS NULL 
  OR city IS NULL 
  OR state IS NULL 
  OR zip_code IS NULL 
  OR country IS NULL;

-- Verify the changes
SELECT 
  id, 
  email, 
  full_name, 
  phone, 
  address, 
  city, 
  state, 
  zip_code, 
  country,
  email_verified,
  created_at
FROM profiles 
ORDER BY created_at DESC;
