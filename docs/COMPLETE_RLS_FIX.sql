-- Complete RLS fix for profile creation during email verification
-- Run this in your Supabase SQL Editor

-- Step 1: Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 2: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile reads" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during verification" ON profiles;

-- Step 3: Create new permissive policies
-- Allow profile creation (needed for email verification)
CREATE POLICY "Allow profile creation" ON profiles
FOR INSERT 
WITH CHECK (true);

-- Allow profile reads
CREATE POLICY "Allow profile reads" ON profiles
FOR SELECT 
USING (true);

-- Allow profile updates
CREATE POLICY "Allow profile updates" ON profiles
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Step 4: Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Step 5: Test profile creation
-- This should work after the RLS fix
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  phone,
  address,
  city,
  state,
  zip_code,
  country,
  email_verified,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test User',
  'customer',
  '+1234567890',
  '123 Test Street',
  'Test City',
  'Test State',
  '12345',
  'Nigeria',
  true,
  NOW(),
  NOW()
);

-- Step 6: Check if the test profile was created
SELECT * FROM profiles WHERE email = 'test@example.com';

-- Step 7: Clean up test data
DELETE FROM profiles WHERE email = 'test@example.com';
