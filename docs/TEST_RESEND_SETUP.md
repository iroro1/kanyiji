# Test Resend SMTP Setup - Quick Guide

## ✅ How to Confirm Resend is Working

### Step 1: Test Signup (Easiest Method)

1. **Go to your app's signup page**
2. **Sign up with a real email** (use your own email)
3. **Submit the form**

### Step 2: Check Resend Dashboard

1. **Go to [Resend Dashboard](https://resend.com/emails)**
2. **Click on "Emails" in the sidebar**
3. **Look for recent emails** - you should see:
   - ✅ Email sent to your test address
   - ✅ Status: "Delivered" or "Sent"
   - ✅ From: `hello@kanyiji.ng`
   - ✅ Subject: "Verify your Kanyiji account" or similar

### Step 3: Check Your Email

1. **Open the verification email**
2. **Check the "From" field:**
   - Should show: `Kanyiji Marketplace <hello@kanyiji.ng>`
   - NOT: `noreply@mail.app.supabase.io` (Supabase default)

3. **Check email headers** (optional but definitive):
   - **Gmail**: Click three dots → "Show original"
   - Look for: `Received: from smtp.resend.com` or similar
   - Look for: `X-Resend-Email-ID` header (proves it's from Resend)

### Step 4: Test Rate Limits

**This is the best proof:**

1. **Sign up 3+ users in quick succession** (within an hour)
2. **If Resend is working:**
   - ✅ All emails send successfully
   - ✅ No rate limit errors
   - ✅ All appear in Resend dashboard

3. **If Supabase default is still active:**
   - ❌ After 2 emails, you'll get rate limit errors
   - ❌ Emails won't appear in Resend dashboard

## Quick Checklist

- [ ] Signup email appears in Resend dashboard
- [ ] Email "From" shows `hello@kanyiji.ng`
- [ ] Can send 3+ emails without rate limit errors
- [ ] Email headers show Resend servers
- [ ] Emails arrive in inbox (not spam)

## What You Should See

### ✅ In Resend Dashboard:
```
Email List:
- To: your-email@example.com
- From: hello@kanyiji.ng
- Subject: Verify your Kanyiji account
- Status: Delivered
- Sent: Just now
```

### ✅ In Your Email:
```
From: Kanyiji Marketplace <hello@kanyiji.ng>
Subject: Verify your Kanyiji account
Body: Contains verification code/OTP
```

### ❌ If Still Using Supabase Default:
```
From: Supabase <noreply@mail.app.supabase.io>
Rate limit error after 2 emails/hour
Emails NOT in Resend dashboard
```

## Troubleshooting

**If emails don't appear in Resend dashboard:**

1. Check Supabase SMTP settings are saved
2. Verify domain `kanyiji.ng` is verified in Resend
3. Check Supabase Auth Logs for errors
4. Try sending a test email from Supabase dashboard (if available)

**If you see rate limit errors:**

- Supabase default is still active
- Double-check SMTP settings are enabled and saved
- Verify SMTP credentials are correct

## Next Steps After Confirmation

Once you confirm Resend is working:

1. **Optional: Remove custom Resend API code**
   - Since Supabase now sends via Resend SMTP
   - You can simplify by removing `/api/auth/send-verification-email` calls
   - Use Supabase's built-in `auth.resend()` instead

2. **Monitor Resend dashboard**
   - Track delivery rates
   - Monitor bounce rates
   - Check email analytics

