-- Migration script to add new columns to existing notifications table
-- Run this if you already have a notifications table

-- Add user_id column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Add recipient_type column if it doesn't exist
-- First add it as nullable, then set default values, then make it NOT NULL
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20);

-- Set default value for existing rows
UPDATE notifications 
SET recipient_type = 'all' 
WHERE recipient_type IS NULL;

-- Now make it NOT NULL with default
ALTER TABLE notifications 
ALTER COLUMN recipient_type SET DEFAULT 'all',
ALTER COLUMN recipient_type SET NOT NULL;

-- Add created_by column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Add metadata column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add updated_at column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create index for recipient_type if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);

-- Update existing notifications to have recipient_type = 'all' if they don't have one
UPDATE notifications 
SET recipient_type = 'all' 
WHERE recipient_type IS NULL;

-- Drop all existing policies on notifications table (if they exist)
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can update notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON notifications;

-- Create new policies
CREATE POLICY "Users can view their notifications"
  ON notifications
  FOR SELECT
  USING (
    user_id = auth.uid() 
    OR recipient_type = 'all'
    OR (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
  );

CREATE POLICY "Users can update their notifications"
  ON notifications
  FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
  );

CREATE POLICY "Admins can create notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

