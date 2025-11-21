-- Create notifications table for admin and user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) NOT NULL DEFAULT 'all', -- 'all', 'user', 'admin'
  type VARCHAR(50) NOT NULL DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Admin who created the notification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Create index for type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Create index for user_id filtering
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create index for recipient_type filtering
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_type ON notifications(recipient_type);

-- Enable RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications or all notifications if recipient_type is 'all'
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

-- Policy: Users can update their own notifications
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

-- Policy: Only admins can insert notifications
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

-- Add some sample notifications (optional)
-- INSERT INTO notifications (type, title, message, metadata) VALUES
--   ('order', 'New Order Received', 'Order #12345 has been placed', '{"order_id": "12345"}'),
--   ('vendor', 'Vendor Approval Request', 'New vendor application from ABC Company', '{"vendor_id": "vendor-123"}'),
--   ('product', 'Product Review Needed', 'Product "Example Product" needs admin review', '{"product_id": "prod-123"}');

