# How to Verify Resend is Working with Supabase

## Quick Verification Steps

### Method 1: Test Signup Flow (Recommended)

1. **Sign up a new test user:**
   - Go to your app's signup page
   - Use a real email address you can access
   - Complete the signup form
   - Submit

2. **Check your email inbox:**
   - Look for the verification email
   - Check the **"From"** field - should show `hello@kanyiji.ng` or `Kanyiji Marketplace`
   - Check email headers (if possible) - should show Resend as the sender

3. **Check Resend Dashboard:**
   - Go to [Resend Dashboard](https://resend.com/emails)
   - Look for recent emails sent
   - You should see the verification email listed there
   - Check delivery status (delivered, opened, etc.)

### Method 2: Check Supabase Auth Logs

1. **Go to Supabase Dashboard:**
   - Navigate to **Logs** → **Auth Logs**
   - Look for recent signup attempts
   - Check if emails are being sent successfully

2. **Look for SMTP indicators:**
   - Successful emails should show no errors
   - If using Resend SMTP, you won't see rate limit errors

### Method 3: Check Email Headers

1. **Open the verification email**
2. **View email headers** (varies by email client):
   - **Gmail**: Click the three dots → "Show original"
   - **Outlook**: Right-click email → "View source"
   - **Apple Mail**: View → Message → Raw Source

3. **Look for these indicators:**
   - **Received from**: Should show `smtp.resend.com` or Resend servers
   - **X-Resend-Email-ID**: Should be present (Resend header)
   - **Return-Path**: Should show `hello@kanyiji.ng` or Resend domain

### Method 4: Test Password Reset

1. **Request password reset:**
   - Go to forgot password page
   - Enter your email
   - Submit

2. **Check Resend Dashboard:**
   - Should see password reset email in Resend dashboard
   - Verify it's being sent via Resend

## What to Look For

### ✅ Signs Resend is Working:

- ✅ Emails appear in Resend dashboard
- ✅ No rate limit errors (Supabase default is 2/hour)
- ✅ Email "From" shows your custom domain
- ✅ Email headers show Resend servers
- ✅ Can send multiple emails without hitting limits
- ✅ Better deliverability (emails arrive in inbox, not spam)

### ❌ Signs Supabase Default is Still Active:

- ❌ Rate limit errors after 2 emails/hour
- ❌ Emails don't appear in Resend dashboard
- ❌ "From" address shows Supabase domain
- ❌ Email headers show Supabase servers
- ❌ Emails only sent to team members

## Troubleshooting

### If emails still using Supabase default:

1. **Check SMTP settings:**
   - Go to Supabase Dashboard → Auth → SMTP Settings
   - Verify "Enable Custom SMTP" is ON
   - Verify all fields are filled correctly
   - Click Save again

2. **Check domain verification:**
   - Go to Resend Dashboard → Domains
   - Verify `kanyiji.ng` is verified
   - Check DNS records are correct

3. **Check SMTP credentials:**
   - Verify API key is correct
   - Try testing SMTP connection in Supabase dashboard

### If emails not sending at all:

1. **Check Supabase Auth Logs:**
   - Look for SMTP errors
   - Check authentication failures

2. **Check Resend Dashboard:**
   - Look for failed deliveries
   - Check for API errors

3. **Verify sender email:**
   - Must match verified domain in Resend
   - Format: `hello@kanyiji.ng` (not `hello@resend.dev`)

## Quick Test Script

You can also test programmatically:

```typescript
// Test signup to trigger email
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123',
});

// Check if email was sent (no rate limit error)
if (error && error.message.includes('rate limit')) {
  console.log('❌ Still using Supabase default (rate limited)');
} else {
  console.log('✅ Email sent - check Resend dashboard');
}
```

## Expected Behavior

Once Resend is configured correctly:

1. **Signup flow:**
   - User signs up → Email sent via Resend
   - Email appears in Resend dashboard immediately
   - No rate limit errors
   - Email arrives in inbox

2. **Password reset:**
   - User requests reset → Email sent via Resend
   - Email appears in Resend dashboard
   - No rate limit errors

3. **Resend OTP:**
   - User requests new code → Email sent via Resend
   - Can request multiple times without hitting limits

## Next Steps

After confirming Resend is working:

1. ✅ Remove custom Resend API integration (optional)
   - Since Supabase now handles emails via Resend SMTP
   - You can simplify code by using Supabase's built-in methods

2. ✅ Monitor Resend dashboard
   - Track email delivery rates
   - Monitor bounce rates
   - Check for any issues

3. ✅ Set up email analytics
   - Track open rates
   - Monitor click rates
   - Optimize email templates

