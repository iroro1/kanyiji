-- Check if profiles table exists and has data
-- Run this in Supabase SQL Editor to verify setup

-- Check if profiles table exists
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Check if there are any users in profiles table
SELECT COUNT(*) as user_count FROM profiles;

-- Check if there are any auth users
SELECT COUNT(*) as auth_user_count FROM auth.users;

-- Check recent profiles (if any exist)
SELECT id, email, full_name, role, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
