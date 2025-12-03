# Email Rate Limit Solution

## Problem
Supabase's email service has rate limits that can be exceeded during signup and email verification resend attempts, causing errors like "rate limit exceeded".

## Solution Implemented

### 1. Client-Side Rate Limiting
- Created a rate limiting utility (`src/utils/rateLimit.ts`) that tracks attempts per email address
- Limits signup attempts to **3 per hour** per email address
- Limits resend OTP attempts to **3 per hour** per email address

### 2. Cooldown Periods
- Added a **60-second cooldown** between resend attempts to prevent rapid-fire requests
- Visual countdown timer shows users when they can request a new code

### 3. Better Error Handling
- Clear error messages when rate limits are hit
- Shows time remaining until the user can try again
- Prevents multiple simultaneous requests

## Features

### Rate Limiting
- **Signup**: Maximum 3 attempts per email per hour
- **Resend OTP**: Maximum 3 attempts per email per hour
- **Cooldown**: 60 seconds between resend requests

### User Experience Improvements
- Real-time countdown timers
- Clear error messages with time remaining
- Disabled buttons during cooldown periods
- Visual feedback for all states

## How It Works

1. **Signup Flow**:
   - Before signup, checks if email has exceeded 3 attempts in the last hour
   - If limited, shows error with time remaining
   - Records attempt after successful validation

2. **Resend OTP Flow**:
   - Checks rate limit before allowing resend
   - Enforces 60-second cooldown between resends
   - Shows countdown timer to user
   - Records attempt after successful resend

## Configuration

Rate limits can be adjusted in:
- `src/components/auth/SignupForm.tsx` - Signup rate limit
- `src/app/verify-email/page.tsx` - Resend rate limit

Default values:
- Max attempts: 3 per hour
- Resend cooldown: 60 seconds

## Alternative Solutions (Future)

If rate limits continue to be an issue, consider:

1. **Custom Email Service**: Use SendGrid, Resend, or AWS SES instead of Supabase's email service
2. **Email Queue**: Implement a queue system for email sending
3. **Increase Supabase Plan**: Upgrade to a plan with higher email rate limits
4. **Server-Side Rate Limiting**: Implement server-side rate limiting with Redis or similar

## Testing

To test rate limiting:
1. Try signing up with the same email 4 times within an hour
2. Try resending OTP more than 3 times within an hour
3. Try resending OTP multiple times rapidly (should enforce 60-second cooldown)

