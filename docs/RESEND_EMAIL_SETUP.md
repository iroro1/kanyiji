# Resend Email Integration Setup

This guide explains how Resend is integrated for sending email verification and password reset emails.

## Overview

Resend is now used instead of Supabase's email service for:
- Email verification (signup)
- Password reset emails
- OTP token delivery

## Setup Steps

### 1. Run Database Migration

Create the OTP tokens table in Supabase:

```bash
# Copy the SQL from docs/resend-email-setup.sql
# Paste into Supabase SQL Editor and execute
```

Or run via CLI:
```bash
psql -h your-db-host -U postgres -d postgres -f docs/resend-email-setup.sql
```

### 2. Environment Variables

Add to your `.env.local`:

```env
# Resend Email Configuration
RESEND_API_KEY=re_BgtPwQyG_tBLeSRN1LqDPmG4KsqNjQfLr
RESEND_FROM_EMAIL=hello@kanyiji.ng
RESEND_FROM_NAME=Kanyiji Marketplace
```

**Note:** Make sure your `RESEND_FROM_EMAIL` domain is verified in Resend dashboard.

### 3. Verify Domain in Resend

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Add your domain (e.g., `kanyiji.ng`)
3. Add the required DNS records
4. Wait for verification

### 4. Test the Integration

1. Try signing up a new user
2. Check email inbox for verification code
3. Verify the code works
4. Test password reset flow

## How It Works

### Email Verification Flow

1. User signs up → User created in Supabase
2. API route `/api/auth/send-verification-email` generates 6-digit OTP
3. OTP stored in `email_otp_tokens` table
4. Email sent via Resend with OTP code
5. User enters OTP → Verified via `/api/auth/verify-otp`
6. User marked as verified in Supabase

### Password Reset Flow

1. User requests password reset
2. API route `/api/auth/send-password-reset` generates 6-digit OTP
3. OTP stored in `email_otp_tokens` table
4. Email sent via Resend with OTP code
5. User enters OTP and new password → Verified and password updated

## API Routes

### POST `/api/auth/send-verification-email`
- Generates OTP token
- Stores in database
- Sends email via Resend

### POST `/api/auth/send-password-reset`
- Generates OTP token
- Stores in database
- Sends email via Resend
- Prevents email enumeration (always returns success)

### POST `/api/auth/verify-otp`
- Verifies OTP token
- Marks token as used
- Returns verification status

### POST `/api/auth/reset-password`
- Updates user password in Supabase
- Requires valid OTP verification first

## Email Templates

Email templates are defined in `src/services/emailService.ts`:
- HTML templates with Kanyiji branding
- Plain text fallbacks
- Responsive design
- Clear call-to-action buttons

## Benefits

✅ **Higher Rate Limits**: Resend offers much higher email sending limits  
✅ **Better Deliverability**: Professional email service with better inbox placement  
✅ **Custom Branding**: Full control over email design  
✅ **Analytics**: Track email opens, clicks, and delivery status  
✅ **No Rate Limit Issues**: Avoid Supabase email rate limit errors  

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is correct
2. Verify domain is verified in Resend dashboard
3. Check Resend dashboard for error logs
4. Verify `RESEND_FROM_EMAIL` matches verified domain

### OTP Verification Failing

1. Check database table `email_otp_tokens` exists
2. Verify database function `verify_email_otp` exists
3. Check token expiration (10 minutes for verification, 1 hour for password reset)
4. Ensure token hasn't been used already

### Domain Verification Issues

1. Check DNS records are correct
2. Wait for DNS propagation (can take up to 48 hours)
3. Verify SPF, DKIM, and DMARC records

## Monitoring

### Resend Dashboard
- View email delivery status
- Track opens and clicks
- Monitor bounce rates
- Check API usage

### Database Monitoring
```sql
-- View recent OTP tokens
SELECT * FROM email_otp_tokens 
ORDER BY created_at DESC 
LIMIT 10;

-- Check token usage
SELECT type, COUNT(*) as total, 
       SUM(CASE WHEN used THEN 1 ELSE 0 END) as used_count
FROM email_otp_tokens
GROUP BY type;
```

## Cleanup

Expired tokens are automatically cleaned up. You can also run manually:

```sql
SELECT cleanup_expired_otp_tokens();
```

Consider setting up a cron job to run this periodically.

