# Resend SMTP Quick Reference for Supabase

## Quick Setup Values

Copy and paste these values into Supabase SMTP Settings:

| Field | Value |
|-------|-------|
| **SMTP Host** | `smtp.resend.com` |
| **SMTP Port** | `587` |
| **SMTP User** | `resend` |
| **SMTP Password** | `YOUR_RESEND_API_KEY` (e.g., `re_...`) |
| **Sender Email** | `hello@kanyiji.ng` |
| **Sender Name** | `Kanyiji Marketplace` |
| **Secure Email** | ✅ Enabled (TLS) |

## Where to Configure

1. Go to: **Supabase Dashboard** → **Settings** → **Auth** → **SMTP Settings**
   - Or direct link: `https://supabase.com/dashboard/project/[your-project]/auth/smtp`

2. Toggle **Enable Custom SMTP** to **ON**

3. Fill in the values above

4. Click **Save**

## Important Notes

- ✅ Domain `kanyiji.ng` must be verified in Resend first
- ✅ Port `587` uses TLS encryption
- ✅ If port 587 doesn't work, try `465` with SSL
- ✅ SMTP Password = Your Resend API key

## Testing

After saving:
1. Try signing up a new user
2. Check email inbox for verification code
3. Check Resend dashboard for delivery status

## Troubleshooting

**"Authentication failed"**
- Check API key is correct
- Verify domain is verified in Resend

**"Connection timeout"**
- Try port `465` with SSL instead

**"Domain not verified"**
- Go to Resend dashboard → Domains
- Add DNS records and wait for verification

