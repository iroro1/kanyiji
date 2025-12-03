-- =============================================
-- Setup Admin User: kanyiji.dev@gmail.com
-- =============================================
-- Run this SQL script in Supabase SQL Editor
-- 
-- IMPORTANT: First create the user in Supabase Auth Dashboard:
-- 1. Go to Authentication → Users
-- 2. Click "Add User" → "Create new user"
-- 3. Email: kanyiji.dev@gmail.com
-- 4. Password: #amazingroot
-- 5. Click "Create User"
-- 
-- Then run this SQL script below:
-- =============================================

-- Step 1: Create or update profile with admin role
-- This will work if the user already exists in auth.users
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User') as full_name,
  'admin' as role
FROM auth.users
WHERE email = 'kanyiji.dev@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name, 'Admin User'),
  role = 'admin',
  updated_at = now();

-- Step 2: Alternative - If user already has a profile, just update the role
UPDATE profiles 
SET 
  role = 'admin',
  updated_at = now()
WHERE email = 'kanyiji.dev@gmail.com'
AND role != 'admin';

-- Step 3: Verify the admin user was created/updated
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  au.email_confirmed_at IS NOT NULL as email_confirmed,
  p.created_at,
  p.updated_at
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'kanyiji.dev@gmail.com';

-- Expected result: Should show role = 'admin'
