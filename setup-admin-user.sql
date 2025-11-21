-- =============================================
-- Setup Admin User: kanyiji.dev@gmail.com
-- =============================================
-- Run this script in your Supabase SQL Editor to create/setup the admin user

-- Step 1: Check if user exists in auth.users
-- Note: You'll need to create the user in Supabase Auth Dashboard first
-- Go to: Authentication → Users → Add User
-- Email: kanyiji.dev@gmail.com
-- Password: #amazingroot
-- Then run the rest of this script

-- Step 2: Create or update profile with admin role
INSERT INTO profiles (id, email, full_name, role, is_active, is_verified)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User') as full_name,
  'admin' as role,
  true as is_active,
  COALESCE(email_confirmed_at IS NOT NULL, true) as is_verified
FROM auth.users
WHERE email = 'kanyiji.dev@gmail.com'
ON CONFLICT (id) DO UPDATE
SET 
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name, 'Admin User'),
  role = 'admin',
  is_active = true,
  is_verified = COALESCE((SELECT email_confirmed_at IS NOT NULL FROM auth.users WHERE id = profiles.id), true),
  updated_at = now();

-- Step 3: Verify the admin user was created/updated
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_active,
  p.is_verified,
  au.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'kanyiji.dev@gmail.com';

-- Step 4: If the above doesn't work, try this direct update
-- (Only if user already exists in auth.users)
UPDATE profiles 
SET 
  role = 'admin',
  is_active = true,
  is_verified = true,
  updated_at = now()
WHERE email = 'kanyiji.dev@gmail.com'
RETURNING id, email, role, is_active, is_verified;

