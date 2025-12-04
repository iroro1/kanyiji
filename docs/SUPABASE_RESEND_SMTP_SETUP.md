# How to Configure Resend as Custom SMTP in Supabase

This guide shows you exactly how to set up Resend as Supabase's custom SMTP provider.

## Step-by-Step Instructions

### Step 1: Get Resend SMTP Credentials

1. Go to [Resend Dashboard](https://resend.com)
2. Log in to your account
3. Navigate to **Settings** → **SMTP** (or **API Keys** → **SMTP**)
4. You'll see SMTP settings. Note these values:
   - **SMTP Host**: `smtp.resend.com`
   - **SMTP Port**: `587` (TLS) or `465` (SSL)
   - **SMTP Username**: `resend`
   - **SMTP Password**: Your Resend API key (e.g., `re_...`)

### Step 2: Configure in Supabase Dashboard

1. **Go to Authentication Settings Page**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project
   - **Direct link**: Go to `/dashboard/project/[your-project-ref]/auth/smtp`
   - Or navigate: **Settings** → **Auth** → **SMTP Settings**

2. **Enable Custom SMTP**
   - Toggle **Enable Custom SMTP** to ON
   - Form fields will appear

3. **Fill in the SMTP Details:**
   
   **SMTP Host:**
   ```
   smtp.resend.com
   ```
   
   **SMTP Port:**
   ```
   587
   ```
   (Use `465` if 587 doesn't work, but 587 with TLS is recommended)
   
   **SMTP User:**
   ```
   resend
   ```
   
   **SMTP Password:**
   ```
   YOUR_RESEND_API_KEY
   ```
   (Your Resend API key - this is your SMTP password, e.g., `re_...`)
   
   **Sender Email:**
   ```
   hello@kanyiji.ng
   ```
   (Must be a verified domain in Resend - this is `smtp_admin_email`)
   
   **Sender Name:**
   ```
   Kanyiji Marketplace
   ```
   (Optional - this is `smtp_sender_name`)
   
   **Enable Secure Email (TLS/SSL):**
   - ✅ Check this box
   - Select **TLS** (for port 587) or **SSL** (for port 465)

4. **Save Settings**
   - Click **Save** button at the bottom
   - Wait for confirmation message

5. **Test SMTP Connection** (if available)
   - Some Supabase dashboards have a test button
   - Or test by signing up a new user
   - Check your inbox for the verification email
   - Check Resend dashboard to see email delivery status

### Step 3: Verify Domain in Resend (If Not Done Already)

1. Go to [Resend Dashboard](https://resend.com/domains)
2. Click **Add Domain**
3. Enter: `kanyiji.ng`
4. Add the DNS records shown:
   - **SPF Record**: `v=spf1 include:resend.com ~all`
   - **DKIM Record**: (provided by Resend)
   - **DMARC Record**: (optional but recommended)
5. Wait for verification (can take a few minutes to 48 hours)

### Step 4: Verify Configuration

After saving, Supabase will now use Resend to send all auth emails:
- ✅ Email verification (signup)
- ✅ Password reset emails
- ✅ Magic link emails
- ✅ OTP codes

### Troubleshooting

**If test email fails:**
1. Check that domain `kanyiji.ng` is verified in Resend
2. Verify SMTP credentials are correct
3. Try port `465` with SSL instead of `587` with TLS
4. Check Resend dashboard for any errors

**If emails still not sending:**
1. Check Supabase logs: **Logs** → **Auth Logs**
2. Check Resend dashboard for delivery status
3. Verify sender email matches verified domain

**Common Issues:**
- **"Authentication failed"**: Check API key is correct
- **"Domain not verified"**: Verify domain in Resend first
- **"Connection timeout"**: Try different port (587 vs 465)

### What Happens Next

Once configured:
- All Supabase auth emails will be sent via Resend
- You'll get Resend's high rate limits (much higher than Supabase's 2/hour)
- Better email deliverability
- Email analytics in Resend dashboard
- No need for custom email code - Supabase handles everything

### Benefits

✅ **Higher Rate Limits**: Resend offers much higher limits than Supabase's 2/hour  
✅ **Better Deliverability**: Professional email service  
✅ **Simpler Code**: Use Supabase's built-in `auth.resend()` and `auth.verifyOtp()`  
✅ **No Custom Code Needed**: Supabase handles OTP generation and verification  
✅ **Email Analytics**: Track opens, clicks, bounces in Resend dashboard  

### Next Steps

After configuring SMTP:
1. Test signup flow - should receive email via Resend
2. Test password reset - should receive email via Resend
3. Check Resend dashboard to see email delivery stats
4. You can now remove the custom Resend API integration if you want (optional)

