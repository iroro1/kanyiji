# Admin User Setup Guide

## 🔐 Setting Up Admin Credentials

The admin panel no longer uses hardcoded credentials for security. You need to create an admin user in your Supabase database.

## 📋 Steps to Create an Admin User

### Option 1: Using Supabase Dashboard (Recommended)

1. **Create a user in Supabase Auth:**
   - Go to your Supabase project dashboard
   - Navigate to **Authentication** → **Users**
   - Click **Add User** → **Create new user**
   - Enter:
     - **Email**: `admin@kanyiji.com` (or your preferred admin email)
     - **Password**: Choose a strong password
   - Click **Create User**

2. **Create profile with admin role:**
   - Go to **SQL Editor** in Supabase dashboard
   - Run this SQL:

```sql
-- Create profile for admin user (replace email with your admin email)
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  id,
  email,
  'Admin User',
  'admin'
FROM auth.users
WHERE email = 'admin@kanyiji.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

### Option 2: Complete SQL Script

If the user already exists, use this to update their role:

```sql
-- Update existing user to admin role
UPDATE profiles 
SET role = 'admin',
    full_name = COALESCE(full_name, 'Admin User'),
    is_active = true
WHERE email = 'admin@kanyiji.com';

-- Verify the update
SELECT id, email, full_name, role 
FROM profiles 
WHERE email = 'admin@kanyiji.com';
```

### Option 3: Create Admin via SQL (Direct)

```sql
-- Step 1: Create user in auth.users (if not exists)
-- Note: You'll need to do this via Supabase Dashboard or Auth API
-- Then run:

-- Step 2: Create profile with admin role
INSERT INTO profiles (id, email, full_name, role, is_active)
SELECT 
  id,
  email,
  'Admin User',
  'admin',
  true
FROM auth.users
WHERE email = 'admin@kanyiji.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    is_active = true;
```

## 🔑 Default Admin Credentials

**There are NO default credentials.** You must create your own admin user following the steps above.

### Recommended First Admin User:
- **Email**: `admin@kanyiji.com`
- **Password**: Create a strong password (minimum 8 characters, mix of letters, numbers, symbols)

## ✅ Verify Admin Setup

After creating the admin user, verify:

```sql
-- Check if admin user exists
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_active,
  au.email_confirmed_at
FROM profiles p
JOIN auth.users au ON p.id = au.id
WHERE p.role = 'admin';
```

This should return your admin user with:
- `role = 'admin'`
- `is_active = true`
- Email confirmed

## 🚀 Login Instructions

1. Navigate to `/admin/login` in your browser
2. Enter the email and password you created
3. You should be redirected to `/admin` dashboard

## 🔧 Troubleshooting

### "Invalid credentials" error:
- Check if the user exists in `auth.users` table
- Verify the password is correct
- Ensure email is confirmed in Supabase Auth

### "Access denied. Admin privileges required" error:
- Check if the user's profile has `role = 'admin'`:
  ```sql
  SELECT role FROM profiles WHERE email = 'your-email@example.com';
  ```
- Update the role if needed:
  ```sql
  UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
  ```

### "User profile not found" error:
- Create the profile entry:
  ```sql
  INSERT INTO profiles (id, email, full_name, role)
  SELECT id, email, 'Admin User', 'admin'
  FROM auth.users
  WHERE email = 'your-email@example.com';
  ```

## 🔒 Security Notes

1. **Use a strong password** - Minimum 8 characters, mix of uppercase, lowercase, numbers, and symbols
2. **Don't share admin credentials** - Each admin should have their own account
3. **Enable 2FA** - Consider enabling two-factor authentication for admin accounts (future enhancement)
4. **Rotate passwords regularly** - Change admin passwords periodically
5. **Monitor admin activity** - Review admin actions in logs (future enhancement)

## 📝 Quick Setup Script

Here's a complete SQL script to set up your first admin user:

```sql
-- IMPORTANT: First create the user in Supabase Auth Dashboard
-- Then run this script to set up the profile

-- Create/Update admin profile
INSERT INTO profiles (id, email, full_name, role, is_active, is_verified)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  'admin',
  true,
  true
FROM auth.users
WHERE email = 'admin@kanyiji.com'  -- Change this to your admin email
ON CONFLICT (id) DO UPDATE
SET 
  role = 'admin',
  is_active = true,
  is_verified = true,
  updated_at = now();

-- Verify the admin user was created
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.is_active,
  p.created_at
FROM profiles p
WHERE p.role = 'admin';
```

## 🎯 Next Steps

After setting up your admin user:

1. ✅ Test login at `/admin/login`
2. ✅ Verify you can access the admin dashboard at `/admin`
3. ✅ Test admin operations (approve vendors, manage products, etc.)
4. ✅ Create additional admin users if needed (repeat the process)

---

**Need Help?** Check the `PRODUCTION_UPDATE_SUMMARY.md` or `ADMIN_PANEL_STATUS.md` files for more details.

