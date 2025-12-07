# Quick Rate Limit Setup

## Issue
You're seeing errors like:
- `Could not find the function public.check_email_rate_limit`
- `Could not find the table 'public.email_rate_limits'`

## Solution

Run the SQL setup script in your Supabase dashboard:

1. **Go to Supabase Dashboard** → Your Project → **SQL Editor**

2. **Copy and paste** the contents of `docs/supabase-rate-limit-setup.sql`

3. **Click Run** to execute the SQL

This will create:
- ✅ `email_rate_limits` table
- ✅ `check_email_rate_limit()` function
- ✅ `cleanup_old_rate_limits()` function
- ✅ Required indexes and RLS policies

## Alternative: Skip Rate Limiting (Temporary)

If you don't want to set up rate limiting right now, the code will gracefully degrade and allow all requests. The errors in the console are harmless but can be suppressed by running the SQL setup.

## Verify Setup

After running the SQL, verify it worked:

```sql
-- Check if table exists
SELECT * FROM email_rate_limits LIMIT 1;

-- Test the function
SELECT check_email_rate_limit('test@example.com', 'signup', 3, '1 hour');
```

If both queries work, the setup is complete!

