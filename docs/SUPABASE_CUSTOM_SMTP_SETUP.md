# Supabase Custom SMTP Setup (Using Resend)

Instead of using Resend directly via API, you can configure Resend as Supabase's custom SMTP provider. This way, Supabase handles the email sending but uses Resend's infrastructure.

## Option 1: Use Resend as Supabase Custom SMTP (Recommended)

### Benefits:
- ✅ Supabase handles OTP generation and verification automatically
- ✅ No need for custom OTP token storage
- ✅ Simpler code - use Supabase's built-in auth methods
- ✅ Still get Resend's high rate limits and deliverability
- ✅ No need to maintain separate email service

### Setup Steps:

1. **Get Resend SMTP Credentials:**
   - Go to [Resend Dashboard](https://resend.com/domains)
   - Navigate to **SMTP** section
   - Generate SMTP credentials (or use API key)

2. **Configure in Supabase Dashboard:**
   - Go to **Project Settings** → **Auth** → **SMTP Settings**
   - Enable **Custom SMTP**
   - Enter Resend SMTP details:
     - **Host**: `smtp.resend.com`
     - **Port**: `465` (SSL) or `587` (TLS)
     - **Username**: `resend`
     - **Password**: Your Resend API key (e.g., `re_...`)
     - **Sender email**: `hello@kanyiji.ng`
     - **Sender name**: `Kanyiji Marketplace`

3. **Verify Domain:**
   - Add `kanyiji.ng` domain in Resend dashboard
   - Add DNS records (SPF, DKIM, DMARC)
   - Wait for verification

4. **Test:**
   - Try signing up a new user
   - Check that emails are sent via Resend
   - Verify email delivery in Resend dashboard

## Option 2: Keep Current Resend Integration (What We Built)

### Benefits:
- ✅ Full control over email templates
- ✅ Custom OTP token management
- ✅ Can track and manage tokens independently
- ✅ More flexibility for custom workflows

### Current Setup:
- Resend API integration
- Custom OTP token storage
- Custom email templates
- API routes for sending/verifying

## Comparison

| Feature | Supabase Pro + Custom SMTP | Current Resend Integration |
|---------|---------------------------|---------------------------|
| Rate Limits | High (via Resend) | High (via Resend) |
| Code Complexity | Simpler (use Supabase methods) | More complex (custom API routes) |
| Email Templates | Supabase default (customizable) | Full custom control |
| OTP Management | Supabase handles it | Custom database storage |
| Maintenance | Less code to maintain | More code to maintain |
| Flexibility | Limited to Supabase's flow | Full flexibility |

## Recommendation

**For your use case, I recommend Option 1 (Supabase + Resend SMTP)** because:
1. Simpler codebase - less custom code to maintain
2. Supabase handles OTP generation/verification automatically
3. Still get Resend's benefits (high limits, good deliverability)
4. Easier to debug - Supabase handles the flow
5. Less chance of bugs - using Supabase's tested auth flow

However, if you want full control over email templates and OTP management, keep the current Resend integration.

## Migration Path

If you want to switch to Supabase Custom SMTP:

1. Configure Resend as Supabase SMTP (steps above)
2. Revert the custom Resend API integration
3. Use Supabase's built-in `auth.resend()` and `auth.verifyOtp()` methods
4. Remove custom OTP token storage (optional)

Would you like me to help you configure Supabase Custom SMTP, or keep the current Resend integration?

