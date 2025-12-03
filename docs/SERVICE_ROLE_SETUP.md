# Supabase Service Role Key Setup

## Overview

The service role key is needed to create user profiles during signup, bypassing Row Level Security (RLS) policies.

## How to Get Your Service Role Key

1. **Go to your Supabase Dashboard**

   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your Kanyiji project

2. **Navigate to Settings**

   - Click on "Settings" in the left sidebar
   - Click on "API" in the settings menu

3. **Copy the Service Role Key**

   - Find the "service_role" key (not the "anon" key)
   - Click the "Copy" button next to it
   - ⚠️ **Keep this key secret** - it has full database access

4. **Add to Environment Variables**
   - Open your `.env.local` file
   - Add the following line:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Security Notes

- The service role key has full database access
- Never commit this key to version control
- Only use it in server-side code (API routes)
- The key is used to create profiles during signup when RLS blocks client-side inserts

## Testing

After adding the service role key:

1. Restart your development server
2. Try signing up with a new email
3. Check the browser console for "Profile created successfully" message
4. Verify the profile was created in your Supabase dashboard

## Troubleshooting

If profile creation still fails:

1. Verify the service role key is correct
2. Check that the key is in `.env.local` (not `.env`)
3. Restart your development server after adding the key
4. Check the API route logs in your terminal
