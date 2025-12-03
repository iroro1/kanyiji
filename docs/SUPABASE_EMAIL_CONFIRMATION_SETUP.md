# Supabase Email Confirmation Setup

## Issue

Signup is automatically authenticating users instead of requiring email verification.

## Root Cause

Supabase project is configured to not require email confirmation by default.

## Solution

### 1. Check Supabase Project Settings

1. **Go to your Supabase Dashboard**

   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Kanyiji project

2. **Navigate to Authentication Settings**

   - Click on "Authentication" in the left sidebar
   - Click on "Settings" in the authentication section

3. **Enable Email Confirmation**

   - Find "Email Confirmation" section
   - **Enable "Enable email confirmations"**
   - Set "Confirmation URL" to: `http://localhost:3000/verify-email`
   - For production, use: `https://yourdomain.com/verify-email`

4. **Configure Email Templates**
   - Go to "Email Templates" tab
   - Click on "Confirm signup" template
   - Update the template to include the OTP code
   - Make sure the "Confirm your signup" link points to your verify-email page

### 2. Alternative: Force Email Confirmation in Code

If the above doesn't work, we can force email confirmation by modifying the signup flow:

```typescript
// In supabaseAuthService.ts
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: userData.email,
  password: userData.password,
  options: {
    data: {
      full_name: userData.fullName,
      role: userData.role,
    },
    emailRedirectTo: `${
      window.location.origin
    }/verify-email?email=${encodeURIComponent(userData.email)}`,
  },
});

// Force logout after signup to prevent auto-authentication
if (authData.user && authData.user.email_confirmed_at === null) {
  await supabase.auth.signOut();
}
```

### 3. Check Current Settings

Run this query in Supabase SQL Editor to check current settings:

```sql
-- Check if email confirmation is enabled
SELECT * FROM auth.config WHERE key = 'email_confirm_enabled';

-- Check user confirmation status
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### 4. Test the Flow

After enabling email confirmation:

1. **Sign up with a new email**
2. **Check your email** for the confirmation email
3. **Should redirect to verify-email page** instead of auto-login
4. **Enter OTP** from email to verify

### 5. Troubleshooting

If still not working:

1. **Check email delivery** - emails might be going to spam
2. **Verify redirect URL** - make sure it matches your domain
3. **Check console logs** - look for "User confirmed: false" in browser console
4. **Test with different email** - some email providers block automated emails

## Expected Behavior

After proper setup:

- ✅ User signs up → Redirected to verify-email page
- ✅ User receives email with OTP
- ✅ User enters OTP → Profile created and logged in
- ✅ User redirected to home page

## Production Considerations

For production:

1. **Set up proper email provider** (SendGrid, AWS SES, etc.)
2. **Configure custom domain** for email templates
3. **Set up proper redirect URLs** for your domain
4. **Test thoroughly** with real email addresses
