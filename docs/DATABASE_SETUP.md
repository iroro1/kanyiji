# Database Setup for Kanyiji

## 🚀 Quick Database Setup (2 minutes!)

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase project dashboard
2. Go to **SQL Editor** in the left sidebar
3. Click **"New Query"**

### Step 2: Run the Database Schema

1. Copy the entire content from `supabase-schema.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button

### Step 3: Verify Tables Created

1. Go to **Table Editor** in the left sidebar
2. You should see these tables:
   - `profiles` - User profiles
   - `products` - Product listings (for future)
   - `orders` - Customer orders (for future)
   - `order_items` - Order details (for future)

### Step 4: Test Authentication

1. Go back to your app
2. Try signing up with email/password
3. Check the `profiles` table - you should see the new user!

## 🔍 What This Creates:

### `profiles` Table

- Stores user information
- Links to Supabase auth users
- Includes role-based access (customer, vendor, admin)
- Automatically creates profile when user signs up

### Security Features

- **Row Level Security (RLS)** enabled
- Users can only see/edit their own data
- Automatic profile creation on signup
- Secure data access policies

### Future Tables

- `products` - For product listings
- `orders` - For customer orders
- `order_items` - For order details

## 🧪 Test the Setup:

1. **Sign up** with a new account
2. **Check Supabase** - go to Table Editor → profiles
3. **You should see** your new user data!

## 🚨 Troubleshooting:

### If you get errors:

1. **Permission errors**: Make sure you're logged into Supabase
2. **Table already exists**: That's fine, the script uses `IF NOT EXISTS`
3. **RLS errors**: The policies are set up correctly

### If data still doesn't persist:

1. Check browser console for errors
2. Verify your Supabase URL and API key in `.env.local`
3. Make sure the database schema was created successfully

## ✅ Success Indicators:

- ✅ Tables created in Supabase
- ✅ User signup creates profile record
- ✅ User data persists across page refreshes
- ✅ Authentication works smoothly

Once you run this SQL script, your authentication will properly persist to the Supabase database! 🎉
