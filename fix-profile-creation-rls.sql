-- Fix RLS policies to allow profile creation during email verification
-- Run this in your Supabase SQL Editor

-- First, let's check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create more permissive policies for profile creation
-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Also allow profile creation for unauthenticated users (for email verification)
-- This is needed because the verify-email page might not have a full session
CREATE POLICY "Allow profile creation during verification" ON profiles
FOR INSERT 
TO anon
WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;