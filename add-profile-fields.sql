-- Add additional profile fields to the profiles table
-- Run this in your Supabase SQL Editor

-- Add new columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nigeria';

-- Update existing profiles with default country if not set
UPDATE profiles 
SET country = 'Nigeria' 
WHERE country IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
