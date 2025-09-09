-- Fix RLS policies to allow profile creation during email verification
-- Run this in your Supabase SQL Editor

-- First, let's see what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON profiles;
DROP POLICY IF EXISTS "Allow profile updates" ON profiles;
DROP POLICY IF EXISTS "Allow profile reads" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during verification" ON profiles;

-- Create new permissive policies for profile creation
-- Allow anyone to insert profiles (needed for email verification)
CREATE POLICY "Allow profile creation" ON profiles
FOR INSERT 
WITH CHECK (true);

-- Allow users to view their own profiles
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;
