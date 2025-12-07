# Fix: "535 Invalid username" SMTP Error

## The Problem
The error `"535 Invalid username"` means Supabase cannot authenticate with your SMTP server because the username is incorrect.

## Solution: Fix SMTP Credentials

### 1. Go to Supabase SMTP Settings
1. Open Supabase Dashboard
2. Go to **Settings** → **Auth** → **SMTP Settings**

### 2. Check Your SMTP Username

The username field must match exactly what your SMTP provider expects:

#### For Gmail:
- **Username**: Your full Gmail address (e.g., `yourname@gmail.com`)
- **NOT**: Just the part before @gmail.com
- **Password**: App Password (NOT your regular Gmail password)
  - Generate at: https://myaccount.google.com/apppasswords

#### For SendGrid:
- **Username**: Usually `apikey`
- **Password**: Your SendGrid API key

#### For Mailgun:
- **Username**: Usually your Mailgun SMTP username
- **Password**: Your Mailgun SMTP password

#### For AWS SES:
- **Username**: Your AWS Access Key ID
- **Password**: Your AWS Secret Access Key

#### For Other Providers:
- Check your SMTP provider's documentation for the exact username format

### 3. Common Mistakes

❌ **Wrong**: Using partial email (e.g., `yourname` instead of `yourname@gmail.com`)  
✅ **Correct**: Full email address

❌ **Wrong**: Using regular password for Gmail  
✅ **Correct**: App Password for Gmail

❌ **Wrong**: Extra spaces or typos  
✅ **Correct**: Exact match, no spaces

### 4. Test SMTP Connection

After updating:
1. Save the SMTP settings
2. Try sending a test email from Supabase dashboard
3. Check if the error is resolved

### 5. Verify SMTP Provider Settings

Double-check with your SMTP provider:
- **Host**: Correct SMTP server address
- **Port**: Correct port (587 for TLS, 465 for SSL)
- **Security**: TLS/SSL settings match
- **Username**: Exact format required
- **Password**: Correct password/API key

## Quick Checklist

- [ ] Username is the full email address (for email-based SMTP)
- [ ] Password is correct (App Password for Gmail)
- [ ] No extra spaces in username/password
- [ ] SMTP host and port are correct
- [ ] Security/TLS settings are correct
- [ ] Test email works from Supabase dashboard

## After Fixing

Once you update the SMTP username:
1. Save settings in Supabase
2. Try password reset again
3. The error should be resolved

The error "535 Invalid username" is specifically an SMTP authentication issue, not a code problem.

