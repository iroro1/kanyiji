# Mailchimp Integration Setup Guide

This guide will help you set up Mailchimp newsletter subscription for the Kanyiji marketplace.

## Prerequisites

1. A Mailchimp account (sign up at [mailchimp.com](https://mailchimp.com))
2. An audience/list created in your Mailchimp account

## Step 1: Get Your Mailchimp API Key

1. Log in to your Mailchimp account
2. Click on your profile icon in the top right corner
3. Select **Account & Billing**
4. Go to **Extras** → **API keys**
5. Click **Create A Key**
6. Copy the API key (it will look like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1`)

## Step 2: Get Your Server Prefix

The server prefix is the part after the dash in your API key. For example:
- If your API key is `abc123-us1`, your server prefix is `us1`
- If your API key is `abc123-us2`, your server prefix is `us2`

## Step 3: Get Your List ID

1. In Mailchimp, go to **Audience** → **All contacts**
2. Click on **Settings** → **Audience name and defaults**
3. Scroll down to find your **Audience ID** (it will look like: `a1b2c3d4e5`)
4. Copy this ID - this is your `MAILCHIMP_LIST_ID`

## Step 4: Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Mailchimp Configuration
MAILCHIMP_API_KEY=your_mailchimp_api_key_here
MAILCHIMP_SERVER_PREFIX=us1
MAILCHIMP_LIST_ID=your_list_id_here
```

**Important:** 
- Replace `your_mailchimp_api_key_here` with your actual API key
- Replace `us1` with your actual server prefix
- Replace `your_list_id_here` with your actual list ID

## Step 5: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the footer of your website
3. Enter a test email address in the newsletter subscription form
4. Click "Subscribe"
5. Check your Mailchimp audience to verify the subscriber was added

## Features

- ✅ Email validation
- ✅ Duplicate subscription handling
- ✅ Loading states and user feedback
- ✅ Error handling
- ✅ Success/error messages

## API Endpoint

The newsletter subscription is handled by:
- **Endpoint:** `/api/newsletter/subscribe`
- **Method:** POST
- **Body:** `{ "email": "user@example.com" }`

## Subscription Status

By default, subscribers are added with `status: "subscribed"`. If you want to enable double opt-in (recommended for compliance), you can change this in `/src/app/api/newsletter/subscribe/route.ts`:

```typescript
status: "pending", // Requires email confirmation
```

## Troubleshooting

### Error: "Newsletter service is not configured"
- Make sure all three environment variables are set in your `.env.local` file
- Restart your development server after adding environment variables

### Error: "This email is already subscribed"
- This is expected behavior - the email is already in your Mailchimp list
- You can customize this message in the API route

### Error: "Invalid email address"
- Check that the email format is correct
- Verify the email doesn't contain any special characters that might cause issues

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your API key secure and don't share it publicly
- The API key should only be used server-side (in API routes)

