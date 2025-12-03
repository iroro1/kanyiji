# Admin Credentials

## ✅ Admin User Setup Complete

The admin user has been successfully configured in the system.

### Login Credentials

**Email:** `kanyiji.dev+admin@gmail.com`  
**Password:** `#amazingroot`

### Access URL

**Admin Login:** `/admin/login`  
**Admin Dashboard:** `/admin`

## 🔒 Security Notes

- ✅ Admin user exists in Supabase Auth
- ✅ Profile has `role = 'admin'` set
- ✅ User can now log in at `/admin/login`
- ⚠️ Change the password after first login for security
- ⚠️ Keep these credentials secure

## 🧪 Testing the Login

1. Navigate to `http://localhost:3000/admin/login` (or your domain)
2. Enter email: `kanyiji.dev+admin@gmail.com`
3. Enter password: `#amazingroot`
4. Click "Access Admin Portal"
5. You should be redirected to `/admin` dashboard

## 🔄 If Login Fails

If you encounter any issues, verify the setup by running:

```bash
node setup-admin-user-simple.js
```

Or run this SQL in Supabase SQL Editor:

```sql
-- Verify admin user
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  au.email_confirmed_at IS NOT NULL as email_confirmed
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email = 'kanyiji.dev@gmail.com';

-- If role is not 'admin', update it:
UPDATE profiles 
SET role = 'admin',
    updated_at = now()
WHERE email = 'kanyiji.dev+admin@gmail.com';
```

---

**Setup Date:** $(date)
**Status:** ✅ Configured and ready

