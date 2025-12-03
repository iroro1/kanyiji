# Resend Email Templates for Kanyiji

This document contains Resend email templates that can be used if you want to use Resend's template system directly (via API) instead of Supabase's email templates.

## Important Note

**Current Setup:** You're using Resend as SMTP provider for Supabase, which means Supabase controls email content through its own template system. The templates in `SUPABASE_EMAIL_TEMPLATES.md` are what you need.

**If you want to use Resend Templates:** You would need to switch back to using Resend API directly (not SMTP), which we removed earlier. This would require:
- Using Resend API routes again
- Managing OTP tokens yourself
- More complex code

**Recommendation:** Stick with Supabase templates (configured in Supabase Dashboard) since you're using Resend SMTP. They're simpler and work seamlessly.

---

## Resend Template System (Alternative Approach)

If you want to use Resend's template feature, you can create templates in Resend Dashboard and reference them by ID. Here's how:

### 1. Create Templates in Resend Dashboard

1. Go to [Resend Dashboard](https://resend.com/templates)
2. Click **"Create Template"**
3. Design your template with variables
4. Save and note the Template ID

### 2. Template Variables in Resend

Resend uses `{{ variableName }}` syntax:
- `{{ userName }}` - User's name
- `{{ email }}` - User's email
- `{{ token }}` - OTP code
- `{{ confirmationUrl }}` - Confirmation link
- `{{ year }}` - Current year

### 3. Using Templates via API

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Send email using template
await resend.emails.send({
  from: "Kanyiji Marketplace <hello@kanyiji.ng>",
  to: email,
  template: {
    id: "your-template-id", // Template ID from Resend dashboard
    variables: {
      userName: fullName,
      email: email,
      token: otpCode,
      confirmationUrl: verificationUrl,
      year: new Date().getFullYear(),
    },
  },
});
```

---

## Template HTML for Resend Dashboard

If you want to create templates in Resend Dashboard, here are the HTML versions:

### Template 1: Email Verification

**Template Name:** `email-verification`  
**Variables:** `userName`, `token`, `confirmationUrl`, `year`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Kanyiji Marketplace
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px; font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 600;">
                Verify Your Email Address
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Hello {{ userName }},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Thank you for signing up for Kanyiji Marketplace! To complete your registration, please verify your email address using the code below:
              </p>
              
              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="background: #f9fafb; border: 2px dashed #D4AF37; border-radius: 12px; padding: 30px 20px; max-width: 400px;">
                      <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #1E3A8A; font-family: 'Courier New', monospace; text-align: center; margin-bottom: 10px;">
                        {{ token }}
                      </div>
                      <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
                        This code expires in 10 minutes
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px; text-align: center;">
                Or click the button below to verify your email:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ confirmationUrl }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                If you didn't create an account with Kanyiji, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; {{ year }} Kanyiji Marketplace. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
                Connecting African entrepreneurs, brands, and businesses worldwide.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Template 2: Password Reset

**Template Name:** `password-reset`  
**Variables:** `userName`, `token`, `confirmationUrl`, `year`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Kanyiji Marketplace
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px; font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 600;">
                Reset Your Password
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Hello {{ userName }},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                We received a request to reset your password for your Kanyiji account. Use the code below to reset your password:
              </p>
              
              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <div style="background: #f9fafb; border: 2px dashed #D4AF37; border-radius: 12px; padding: 30px 20px; max-width: 400px;">
                      <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #1E3A8A; font-family: 'Courier New', monospace; text-align: center; margin-bottom: 10px;">
                        {{ token }}
                      </div>
                      <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
                        This code expires in 1 hour
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px; text-align: center;">
                Or click the button below to reset your password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ confirmationUrl }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; {{ year }} Kanyiji Marketplace. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

### Template 3: Magic Link

**Template Name:** `magic-link`  
**Variables:** `userName`, `confirmationUrl`, `year`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Kanyiji</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; margin: 0; padding: 0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-family: 'Poppins', sans-serif; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                Kanyiji Marketplace
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px; font-family: 'Poppins', sans-serif; font-size: 24px; font-weight: 600;">
                Sign In to Your Account
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Hello {{ userName }},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Click the button below to sign in to your Kanyiji account. This link will expire in 1 hour.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ confirmationUrl }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
                      Sign In to Kanyiji
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                If you didn't request this sign-in link, you can safely ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; {{ year }} Kanyiji Marketplace. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Which Approach Should You Use?

### Option 1: Supabase Templates (Current - Recommended) ✅
- **Where:** Configure in Supabase Dashboard → Auth → Email Templates
- **Pros:** 
  - Simpler - Supabase handles everything
  - Works seamlessly with Resend SMTP
  - No code changes needed
- **Use:** Templates from `SUPABASE_EMAIL_TEMPLATES.md`

### Option 2: Resend Templates (Alternative)
- **Where:** Create in Resend Dashboard → Templates
- **Pros:**
  - More control over template management
  - Can reuse templates across different services
  - Visual template editor
- **Cons:**
  - Requires switching back to Resend API (not SMTP)
  - More complex code
  - Need to manage OTP tokens yourself

**Recommendation:** Stick with **Option 1 (Supabase Templates)** since you're already using Resend SMTP. It's simpler and works perfectly!

