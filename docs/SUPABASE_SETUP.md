# Supabase Setup for Kanyiji

## 🚀 Quick Setup (5 minutes!)

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login with GitHub
3. Click **"New Project"**
4. **Name**: `Kanyiji Marketplace`
5. **Database Password**: Create a strong password (save it!)
6. **Region**: Choose closest to your users
7. Click **"Create new project"**

### Step 2: Get Your Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://your-project.supabase.co`)
   - **Anon Key** (long string starting with `eyJ...`)

### Step 3: Update Environment Variables

Create `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Kanyiji Marketplace
```

### Step 4: Create Database Table

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New Query"**
3. Paste this SQL and click **"Run"**:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin')),
  phone TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Step 5: Enable Email Authentication

1. Go to **Authentication** → **Settings**
2. **Site URL**: `http://localhost:3000`
3. **Redirect URLs**: `http://localhost:3000/auth/callback`
4. **Enable email confirmations**: ✅ (optional)

### Step 6: Test the Setup

1. Restart your dev server: `npm run dev`
2. Try to sign up - it should work!
3. Check the **Authentication** → **Users** tab to see new users

## 🎉 That's It!

Supabase is much simpler than Appwrite:

- ✅ No complex collection setup
- ✅ Built-in authentication
- ✅ Automatic user management
- ✅ Real-time database
- ✅ Row Level Security (RLS)

## Google OAuth Setup

1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Set redirect URL: `http://localhost:3000/auth/callback`
5. **Site URL**: `http://localhost:3000`
6. **Redirect URLs**: `http://localhost:3000/auth/callback`

### Google Cloud Console Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. **Application Type**: Web application
6. **Authorized redirect URIs**: `https://your-project.supabase.co/auth/v1/callback`
7. Copy Client ID and Client Secret to Supabase

## Database Schema

The `profiles` table stores:

- `id` - Links to Supabase auth user
- `email` - User's email
- `full_name` - User's full name
- `role` - customer, vendor, or admin
- `phone` - Optional phone number
- `email_verified` - Email verification status
- `created_at` - Account creation date
- `updated_at` - Last update date
