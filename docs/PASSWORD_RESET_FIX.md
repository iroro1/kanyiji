# Password Reset "Error sending recovery email" - Complete Fix Guide

## Current Error
- **Error**: `AuthApiError: Error sending recovery email`
- **Status Code**: 500 (Internal Server Error)
- **Location**: Supabase Auth API

## Step-by-Step Fix

### 1. ✅ Verify Redirect URL is Allowed

**Critical Step**: Even with SMTP configured, Supabase will fail if the redirect URL isn't allowed.

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, ensure these are added:
   ```
   http://localhost:3000/reset-password
   https://yourdomain.com/reset-password
   ```
4. Click **Save**

### 2. ✅ Check Email Template Configuration

For OTP-based password reset, the email template must include the token:

1. Go to **Authentication** → **Email Templates**
2. Select **"Reset Password"** template
3. Update the template to include OTP token:

```html
<h2>Password Reset</h2>
<p>Your password reset code is:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; text-align: center;">
  {{ .Token }}
</h1>
<p>Enter this 6-digit code to reset your password.</p>
<p>This code expires in 1 hour.</p>
```

**Important**: Use `{{ .Token }}` for OTP, not `{{ .ConfirmationURL }}`

### 3. ✅ Verify SMTP Settings

Double-check your SMTP configuration:

1. Go to **Settings** → **Auth** → **SMTP Settings**
2. Verify:
   - ✅ Host is correct
   - ✅ Port is correct (587 for TLS, 465 for SSL)
   - ✅ Username/Password are correct
   - ✅ Sender email is verified
   - ✅ Test email sending works

### 4. ✅ Test Email Sending from Dashboard

1. Go to **Authentication** → **Users**
2. Find a test user
3. Click the user → **Send password reset email**
4. Check if it works from the dashboard

**If it works from dashboard but not from code:**
- The issue is likely the redirect URL configuration

**If it doesn't work from dashboard:**
- The issue is SMTP configuration or email template

### 5. ✅ Check Supabase Logs

1. Go to **Logs** → **API Logs**
2. Filter for errors around the time of the request
3. Look for specific SMTP error messages
4. Common errors:
   - "Authentication failed" → Wrong SMTP credentials
   - "Connection timeout" → SMTP host/port issue
   - "Domain not verified" → Domain verification needed

### 6. ✅ Verify Email Domain (if using custom domain)

If using a custom domain for email:
- Verify SPF records
- Verify DKIM records
- Verify DMARC records
- Check domain verification status in SMTP provider

## Quick Test

Try this in Supabase SQL Editor to test email sending:

```sql
-- This won't work directly, but check if you can send test emails
-- from the Supabase dashboard instead
```

## Alternative: Use Supabase Dashboard to Send Reset

As a temporary workaround:
1. Go to Authentication → Users
2. Find the user
3. Click "Send password reset email" from dashboard
4. This will help verify if SMTP is working

## Common Issues

### Issue: "Error sending recovery email" persists
**Solution**: 
- Check redirect URL is in allowed list (most common)
- Verify email template includes `{{ .Token }}`
- Test SMTP from dashboard

### Issue: Email sent but no OTP code
**Solution**: 
- Update email template to use `{{ .Token }}` instead of `{{ .ConfirmationURL }}`

### Issue: OTP code not working
**Solution**: 
- Verify you're using `type: "recovery"` in `verifyOtp`
- Check code hasn't expired (1 hour limit)

## Verification Checklist

- [ ] Redirect URL added to Supabase allowed URLs
- [ ] Email template includes `{{ .Token }}`
- [ ] SMTP credentials are correct
- [ ] Sender email is verified
- [ ] Test email works from dashboard
- [ ] No errors in Supabase logs
- [ ] Domain verified (if using custom domain)

## Still Not Working?

If all above are checked and it still fails:
1. Check Supabase status page for outages
2. Try a different SMTP provider
3. Contact Supabase support with:
   - Project ID
   - Error timestamp
   - SMTP provider name
   - Logs from API Logs section

