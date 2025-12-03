-- Simple RLS fix to allow profile creation
-- Run this in your Supabase SQL Editor

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create permissive policies
CREATE POLICY "Allow profile creation" ON profiles
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow profile updates" ON profiles
FOR UPDATE 
WITH CHECK (true);

CREATE POLICY "Allow profile reads" ON profiles
FOR SELECT 
USING (true);

-- Verify policies
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'profiles';
