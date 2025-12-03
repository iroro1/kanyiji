# Quick Setup Guide: Supabase Email Templates

This guide will help you configure the Kanyiji-branded email templates in Supabase.

## Step-by-Step Setup

### Step 1: Access Email Templates

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **Kanyiji project**
3. Navigate to: **Authentication** → **Email Templates**
   - Direct link: `https://supabase.com/dashboard/project/[your-project-ref]/auth/templates`

### Step 2: Configure Each Template

You'll need to configure **5 templates**. Follow these steps for each one:

#### Template 1: Confirmation Email (Signup)

1. Click on **"Confirmation"** template
2. **Subject Line:** `Verify your Kanyiji account`
3. **Body:** Copy the HTML from `SUPABASE_EMAIL_TEMPLATES.md` → Section 1
4. Click **Save**

#### Template 2: Magic Link

1. Click on **"Magic Link"** template
2. **Subject Line:** `Sign in to Kanyiji`
3. **Body:** Copy the HTML from `SUPABASE_EMAIL_TEMPLATES.md` → Section 2
4. Click **Save**

#### Template 3: Password Reset

1. Click on **"Change Email"** or **"Reset Password"** template
2. **Subject Line:** `Reset your Kanyiji password`
3. **Body:** Copy the HTML from `SUPABASE_EMAIL_TEMPLATES.md` → Section 3
4. Click **Save**

#### Template 4: Email Change

1. Click on **"Change Email"** template (if separate from password reset)
2. **Subject Line:** `Confirm your new email address`
3. **Body:** Copy the HTML from `SUPABASE_EMAIL_TEMPLATES.md` → Section 4
4. Click **Save**

#### Template 5: Invitation

1. Click on **"Invite"** template
2. **Subject Line:** `You've been invited to join Kanyiji`
3. **Body:** Copy the HTML from `SUPABASE_EMAIL_TEMPLATES.md` → Section 5
4. Click **Save**

## Important Notes

### Template Variables

Supabase uses these variables (with dot notation):
- `{{ .Token }}` - OTP code (6 digits)
- `{{ .Email }}` - User's email address
- `{{ .ConfirmationURL }}` - Full confirmation link
- `{{ .SiteURL }}` - Your app URL
- `{{ .RedirectTo }}` - Redirect URL after confirmation
- `{{ .Year }}` - Current year (if available)

**Note:** Some variables might not be available in all templates. Test to see which ones work.

### Testing Templates

After configuring:

1. **Test Signup:**
   - Sign up a new test user
   - Check email inbox
   - Verify template looks correct

2. **Test Password Reset:**
   - Request password reset
   - Check email appearance
   - Verify OTP code displays correctly

3. **Check Resend Dashboard:**
   - Go to [Resend Dashboard](https://resend.com/emails)
   - Verify emails are being sent
   - Check delivery status

## Troubleshooting

### Templates Not Working?

1. **Check SMTP Settings:**
   - Go to **Auth** → **SMTP Settings**
   - Verify Resend SMTP is configured correctly
   - Test SMTP connection

2. **Check Template Syntax:**
   - Ensure `{{ .Variable }}` syntax is correct (with spaces)
   - Don't modify variable names
   - Keep HTML structure intact

3. **Check Email Delivery:**
   - Look at Supabase **Auth Logs**
   - Check for any errors
   - Verify domain is verified in Resend

### Variables Not Showing?

- Some Supabase templates might use different variable names
- Check Supabase documentation for your version
- Try `{{ .Token }}` vs `{{ .ConfirmationToken }}`
- Test with a real signup to see what works

## Quick Copy Checklist

- [ ] Confirmation Email - Subject & HTML copied
- [ ] Magic Link - Subject & HTML copied
- [ ] Password Reset - Subject & HTML copied
- [ ] Email Change - Subject & HTML copied
- [ ] Invitation - Subject & HTML copied
- [ ] All templates saved
- [ ] Tested signup email
- [ ] Tested password reset email
- [ ] Verified emails appear in Resend dashboard

## Next Steps

After templates are configured:

1. ✅ Test all email flows
2. ✅ Verify branding looks correct
3. ✅ Check mobile responsiveness
4. ✅ Monitor email delivery rates
5. ✅ Adjust templates if needed

## Need Help?

- **Supabase Docs:** [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- **Template File:** `docs/SUPABASE_EMAIL_TEMPLATES.md`
- **Resend Dashboard:** Check email delivery status

