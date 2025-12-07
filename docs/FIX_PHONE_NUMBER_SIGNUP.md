# Fix: Phone Number Not Saved on Signup

## Issue
Phone numbers entered during signup are not appearing on the profile page.

## Root Cause
The database trigger function `handle_new_user()` that creates profiles doesn't include the phone number field.

## Solution

### Option 1: Update Database Trigger (Recommended)

Run this SQL script in your Supabase SQL Editor:

**File:** `docs/update-profile-trigger-phone.sql`

This will update the trigger to include phone numbers when creating profiles.

### Option 2: Code Already Handles It

The code has been updated to:
1. Include phone when creating profile during signup
2. Sync phone from user_metadata to profile if missing
3. Update phone after trigger creates profile (fallback)

## Steps to Fix

1. **Update Database Trigger:**
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste contents of `docs/update-profile-trigger-phone.sql`
   - Click Run

2. **For Existing Users:**
   - The profile page will automatically sync phone from user_metadata
   - Or users can manually update their phone number in profile settings

3. **For New Signups:**
   - Phone will now be saved correctly
   - Both trigger and code-side creation include phone

## Verification

After running the SQL script, test by:
1. Signing up with a new account including phone number
2. Checking the profile page - phone should be visible
3. If not visible, refresh the page (profile page syncs phone from metadata)

## Code Changes Made

- ✅ Updated `supabaseAuthService.ts` to include phone in profile creation
- ✅ Added fallback to update phone after trigger creates profile
- ✅ Profile page already syncs phone from user_metadata if missing

