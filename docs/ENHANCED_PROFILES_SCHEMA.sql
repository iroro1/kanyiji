-- =============================================
-- 🚀 ENHANCED PROFILES SCHEMA FOR KANYIJI
-- =============================================
-- This adds missing fields to make profiles more comprehensive

-- Drop and recreate profiles table with enhanced fields
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  
  -- Address Information
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  postal_code TEXT,
  timezone TEXT DEFAULT 'Africa/Lagos',
  
  -- User Preferences & Settings
  language TEXT DEFAULT 'en',
  currency TEXT DEFAULT 'NGN',
  theme TEXT CHECK (theme IN ('light', 'dark', 'auto')) DEFAULT 'light',
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT TRUE,
  
  -- Social Media & Links
  website_url TEXT,
  social_media JSONB DEFAULT '{}', -- {facebook: "url", instagram: "url", twitter: "url"}
  
  -- User Status & Verification
  role TEXT CHECK (role IN ('admin', 'vendor', 'customer')) NOT NULL DEFAULT 'customer',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_suspended BOOLEAN DEFAULT FALSE,
  suspension_reason TEXT,
  last_login_at TIMESTAMPTZ,
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  
  -- Privacy & Security
  privacy_level TEXT CHECK (privacy_level IN ('public', 'friends', 'private')) DEFAULT 'private',
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  
  -- Preferences & Customization
  preferences JSONB DEFAULT '{
    "notifications": {
      "email": true,
      "sms": false,
      "push": true,
      "marketing": true
    },
    "privacy": {
      "profile": "private",
      "orders": "private",
      "reviews": "public"
    },
    "shopping": {
      "wishlist_public": false,
      "order_history_retention": 365,
      "auto_save_addresses": true
    },
    "display": {
      "items_per_page": 20,
      "default_sort": "newest",
      "show_prices_in": "NGN"
    }
  }',
  
  -- Analytics & Tracking
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  last_activity_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_last_activity ON profiles(last_activity_at);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow public read access to basic profile info for reviews/ratings
CREATE POLICY "Public can view basic profile info" ON profiles
  FOR SELECT USING (
    is_active = true AND 
    privacy_level IN ('public', 'friends')
  );

-- =============================================
-- 🔧 ENHANCED FUNCTIONS & TRIGGERS
-- =============================================

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    code := upper(substring(md5(random()::text) from 1 for 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to update last activity
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_activity_at = now();
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile on user signup (enhanced)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name,
    first_name,
    last_name,
    display_name,
    role,
    referral_code,
    preferences
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', split_part(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', 2)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    generate_referral_code(),
    '{
      "notifications": {
        "email": true,
        "sms": false,
        "push": true,
        "marketing": true
      },
      "privacy": {
        "profile": "private",
        "orders": "private",
        "reviews": "public"
      },
      "shopping": {
        "wishlist_public": false,
        "order_history_retention": 365,
        "auto_save_addresses": true
      },
      "display": {
        "items_per_page": 20,
        "default_sort": "newest",
        "show_prices_in": "NGN"
      }
    }'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update last activity and timestamps
CREATE TRIGGER update_profiles_activity
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_last_activity();

-- =============================================
-- 📊 USER ANALYTICS VIEW
-- =============================================

-- Create a view for user analytics
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_verified,
  p.is_active,
  p.created_at,
  p.last_login_at,
  p.last_activity_at,
  p.total_orders,
  p.total_spent,
  p.loyalty_points,
  CASE 
    WHEN p.last_activity_at > now() - interval '7 days' THEN 'active'
    WHEN p.last_activity_at > now() - interval '30 days' THEN 'inactive'
    ELSE 'dormant'
  END as activity_status,
  CASE 
    WHEN p.total_spent > 100000 THEN 'high_value'
    WHEN p.total_spent > 10000 THEN 'medium_value'
    WHEN p.total_spent > 0 THEN 'low_value'
    ELSE 'no_purchase'
  END as customer_value_tier
FROM profiles p;

-- =============================================
-- 🔍 USEFUL QUERIES
-- =============================================

-- Query to get user profile with preferences
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT,
  is_verified BOOLEAN,
  preferences JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.display_name,
    p.avatar_url,
    p.phone,
    p.role,
    p.is_verified,
    p.preferences,
    p.created_at
  FROM profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- ✅ ENHANCED PROFILES COMPLETE
-- =============================================

SELECT 'Enhanced profiles schema created successfully! 🚀' as status;
