# Kanyiji Email Templates for Supabase

This document contains custom email templates that match Kanyiji's branding. These templates should be configured in Supabase Dashboard → Auth → Email Templates.

## Brand Colors

- **Primary (Gold)**: `#D4AF37`
- **Secondary (Blue)**: `#1E3A8A`
- **Accent (Green)**: `#059669`
- **Fonts**: Inter (sans), Poppins (display)

## Template Variables

Supabase provides these variables:
- `{{ .Token }}` - OTP code or magic link token
- `{{ .Email }}` - User's email address
- `{{ .SiteURL }}` - Your app URL
- `{{ .ConfirmationURL }}` - Confirmation link (for magic links)
- `{{ .RedirectTo }}` - Redirect URL after confirmation
- `{{ .TokenHash }}` - Hashed token
- `{{ .Data }}` - Additional user metadata

## How to Configure

1. Go to **Supabase Dashboard** → **Auth** → **Email Templates**
2. Select the template type (Confirmation, Magic Link, etc.)
3. Copy the HTML from the corresponding section below
4. Paste into the template editor
5. Click **Save**

---

## 1. Email Confirmation (Signup)

**Subject:** `Verify your Kanyiji account`

**Body (HTML):**

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
                Hello,
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
                        {{ .Token }}
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
                    <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
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
                &copy; {{ .Year }} Kanyiji Marketplace. All rights reserved.
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

---

## 2. Magic Link (Passwordless Login)

**Subject:** `Sign in to Kanyiji`

**Body (HTML):**

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
                Hello,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Click the button below to sign in to your Kanyiji account. This link will expire in 1 hour.
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
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
                &copy; {{ .Year }} Kanyiji Marketplace. All rights reserved.
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

## 3. Password Reset

**Subject:** `Reset your Kanyiji password`

**Body (HTML):**

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
                Hello,
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
                        {{ .Token }}
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
                    <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
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
                &copy; {{ .Year }} Kanyiji Marketplace. All rights reserved.
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

## 4. Email Change

**Subject:** `Confirm your new email address`

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Email Change</title>
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
                Confirm Your New Email Address
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                You requested to change your email address to <strong>{{ .Email }}</strong>. Click the button below to confirm this change:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
                      Confirm Email Change
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                If you didn't request this change, please contact our support team immediately.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; {{ .Year }} Kanyiji Marketplace. All rights reserved.
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

## 5. User Invitation

**Subject:** `You've been invited to join Kanyiji`

**Body (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Join Kanyiji</title>
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
                You've Been Invited!
              </h2>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Hello,
              </p>
              
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                You've been invited to join Kanyiji Marketplace! Click the button below to accept the invitation and create your account:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{ .ConfirmationURL }}" style="background: linear-gradient(135deg, #D4AF37 0%, #1E3A8A 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(30, 58, 138, 0.2);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
                This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                &copy; {{ .Year }} Kanyiji Marketplace. All rights reserved.
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

## Setup Instructions

1. **Go to Supabase Dashboard**
   - Navigate to: **Auth** → **Email Templates**

2. **For each template type:**
   - Select the template (Confirmation, Magic Link, etc.)
   - Copy the HTML from above
   - Paste into the template editor
   - Update the subject line
   - Click **Save**

3. **Test the templates:**
   - Sign up a test user
   - Request password reset
   - Check email appearance

## Notes

- All templates use Kanyiji's brand colors (Gold #D4AF37, Blue #1E3A8A)
- Responsive design that works on mobile and desktop
- Professional gradient header matching the app
- Clear call-to-action buttons
- Consistent branding across all emails

