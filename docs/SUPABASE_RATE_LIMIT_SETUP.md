# Supabase Server-Side Rate Limiting Setup

This guide explains how to set up server-side rate limiting using Supabase's database to prevent email rate limit exceeded errors.

## Overview

We've implemented a two-tier rate limiting system:
1. **Client-side rate limiting** - Immediate feedback and protection
2. **Server-side rate limiting** - Persistent, reliable rate limiting using Supabase database

## Setup Steps

### 1. Create Rate Limiting Table

Run the SQL script to create the rate limiting table and functions:

```bash
# In Supabase SQL Editor or via CLI
psql -h your-db-host -U postgres -d postgres -f docs/supabase-rate-limit-setup.sql
```

Or copy and paste the SQL from `docs/supabase-rate-limit-setup.sql` into your Supabase SQL Editor.

### 2. Verify Table Creation

Check that the table was created:

```sql
SELECT * FROM email_rate_limits LIMIT 5;
```

### 3. Test the Rate Limit Function

Test the function:

```sql
SELECT check_email_rate_limit('test@example.com', 'signup', 3, '1 hour');
```

Expected output:
```json
{
  "is_limited": false,
  "attempt_count": 1,
  "max_attempts": 3,
  "time_until_reset_ms": 3600000,
  "window_start": "2024-01-01T12:00:00Z"
}
```

### 4. Configure Supabase Dashboard Settings

#### Email Rate Limits (Supabase Dashboard)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, configure:
   - **Rate Limit**: Set to your desired limit (default: 3 emails per hour per user)
   - **Email Template**: Customize your email templates
   - **SMTP Settings**: Consider using custom SMTP for higher limits

#### Custom SMTP (Recommended for Production)

For higher email rate limits, configure custom SMTP:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your SMTP provider (SendGrid, AWS SES, etc.)
3. This bypasses Supabase's email rate limits

### 5. Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Required for server-side rate limiting
```

## How It Works

### Server-Side Rate Limiting

1. **API Route** (`/api/auth/rate-limit`):
   - Receives email and action type (signup/resend)
   - Calls Supabase database function `check_email_rate_limit`
   - Returns rate limit status and time until reset

2. **Database Function**:
   - Tracks attempts per email per hour
   - Automatically increments counters
   - Returns whether limit is exceeded

3. **Client Integration**:
   - Checks server-side rate limit first
   - Falls back to client-side if server check fails
   - Shows user-friendly error messages

### Rate Limit Configuration

Default limits:
- **Signup**: 3 attempts per email per hour
- **Resend OTP**: 3 attempts per email per hour
- **Window**: 1 hour rolling window

To change limits, update:
- Database function parameters
- API route `maxAttempts` parameter
- Client-side rate limit utility

## Monitoring

### View Current Rate Limits

```sql
SELECT 
  identifier,
  action_type,
  attempt_count,
  window_start,
  window_start + window_duration as window_end,
  updated_at
FROM email_rate_limits
WHERE window_start + window_duration > NOW()
ORDER BY updated_at DESC;
```

### Cleanup Old Entries

Run periodically (or set up a cron job):

```sql
SELECT cleanup_old_rate_limits();
```

## Troubleshooting

### Function Not Found Error

If you see "function check_email_rate_limit does not exist":
1. Make sure you ran the SQL setup script
2. Check that you're connected to the correct database
3. Verify the function exists: `SELECT * FROM pg_proc WHERE proname = 'check_email_rate_limit';`

### Table Not Found Error

If you see "relation email_rate_limits does not exist":
1. Run the table creation SQL
2. Check table exists: `SELECT * FROM information_schema.tables WHERE table_name = 'email_rate_limits';`

### Service Role Key Missing

If rate limiting doesn't work:
1. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`
2. Restart your development server
3. Check API route logs for errors

## Benefits

✅ **Persistent**: Rate limits survive page refreshes and browser restarts  
✅ **Reliable**: Server-side enforcement can't be bypassed  
✅ **Scalable**: Works across multiple instances/servers  
✅ **Auditable**: Track all rate limit attempts in database  
✅ **Configurable**: Easy to adjust limits per action type  

## Alternative: Supabase Dashboard Rate Limits

Supabase also provides built-in rate limiting in the dashboard:

1. **Project Settings** → **Auth** → **Rate Limits**
2. Configure:
   - Max emails per hour per user
   - Max emails per day per user
   - IP-based rate limiting

However, using our database-based solution gives more control and visibility.

## Production Recommendations

1. **Use Custom SMTP**: Configure SendGrid, AWS SES, or similar for higher limits
2. **Monitor Rate Limits**: Set up alerts for rate limit violations
3. **Adjust Limits**: Based on your user behavior and email provider limits
4. **Cleanup Job**: Set up automated cleanup of old rate limit entries
5. **IP-Based Limiting**: Consider adding IP-based rate limiting for additional protection

