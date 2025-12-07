# Fix: Resend SMTP Configuration

## The Problem
You're using Resend SMTP (`smtp.resend.com`) but have a Gmail address as the username. Resend requires Resend-specific credentials, not Gmail credentials.

## Solution: Use Resend API Key

### For Resend SMTP, use these settings:

1. **Host**: `smtp.resend.com` ✅ (already correct)

2. **Port**: `587` ✅ (already correct)

3. **Username**: `resend` (NOT your email address)

4. **Password**: Your Resend API Key
   - Get it from: https://resend.com/api-keys
   - It looks like: `re_xxxxxxxxxxxxx`

### Steps to Fix:

1. **Get Your Resend API Key**:
   - Go to https://resend.com
   - Sign in to your account
   - Navigate to **API Keys**
   - Copy your API key (starts with `re_`)

2. **Update Supabase SMTP Settings**:
   - Go to Supabase → Settings → Auth → SMTP Settings
   - **Username**: Change from `kanyiji.dev+admin@gmail.com` to `resend`
   - **Password**: Paste your Resend API Key
   - **Host**: `smtp.resend.com` (keep as is)
   - **Port**: `587` (keep as is)
   - Click **Save**

3. **Test**:
   - Try password reset again
   - Should work now!

## Alternative: Use Gmail SMTP Instead

If you prefer to use Gmail:

1. **Host**: `smtp.gmail.com`
2. **Port**: `587`
3. **Username**: `kanyiji.dev+admin@gmail.com` (your full Gmail)
4. **Password**: Gmail App Password (not regular password)
   - Generate at: https://myaccount.google.com/apppasswords

## Why This Matters

- **Resend SMTP** uses `resend` as username + API key as password
- **Gmail SMTP** uses full email as username + App Password as password
- You can't mix them - if using Resend host, you need Resend credentials

## Verification

After updating:
- Username should be `resend` (if using Resend)
- Password should be your Resend API key
- Host should be `smtp.resend.com`
- Port should be `587`

Then test password reset - it should work!

