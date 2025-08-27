# Google OAuth Setup Guide for Kanyiji

This guide will walk you through setting up Google OAuth authentication with Appwrite for the Kanyiji marketplace application.

## 🚀 **Quick Start Checklist**

- [ ] Create Google Cloud Project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Credentials
- [ ] Configure Appwrite Google Provider
- [ ] Test OAuth Flow

## 📋 **Step-by-Step Setup**

### **Step 1: Google Cloud Console Setup**

#### 1.1 Create/Select Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Create a new project or select existing one
4. **Project Name**: `Kanyiji Marketplace OAuth`

#### 1.2 Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable these APIs:
   - **Google+ API** (or Google Identity)
   - **Google Identity and Access Management (IAM) API**
   - **Google Identity Toolkit API**

#### 1.3 Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **"External"** user type
3. Fill in required information:
   - **App name**: `Kanyiji Marketplace`
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Add scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
5. Add test users (your email for development)
6. **Save and Continue**

#### 1.4 Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
3. Choose **"Web application"**
4. Configure:
   - **Name**: `Kanyiji Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)
5. Click **"Create"**
6. **Save your Client ID and Client Secret** (you'll need these for Appwrite)

### **Step 2: Appwrite Configuration**

#### 2.1 Enable Google OAuth Provider

1. Go to your [Appwrite Dashboard](https://cloud.appwrite.io)
2. Select your Kanyiji project
3. Navigate to **Auth** → **OAuth2 Providers**
4. Find **Google** and click **"Enable"**

#### 2.2 Configure Google Provider

1. **Client ID**: Paste your Google OAuth Client ID
2. **Client Secret**: Paste your Google OAuth Client Secret
3. **Redirect URL**: `http://localhost:3000/auth/callback`
4. **Save** the configuration

### **Step 3: Environment Variables**

Update your `.env.local` file with Google OAuth settings:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### **Step 4: Test the Setup**

#### 4.1 Development Testing

1. Start your development server: `npm run dev`
2. Go to login/signup page
3. Click "Continue with Google"
4. You should be redirected to Google OAuth
5. After authentication, you'll be redirected back to `/auth/callback`
6. Check if user is created in Appwrite

#### 4.2 Production Testing

1. Update redirect URIs in Google Cloud Console
2. Update Appwrite redirect URL
3. Test with production domain

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: "redirect_uri_mismatch" Error**

**Cause**: Redirect URI in Google Console doesn't match Appwrite
**Solution**:

- Ensure exact match between Google Console and Appwrite
- Check for trailing slashes
- Verify protocol (http vs https)

### **Issue 2: OAuth Consent Screen Not Verified**

**Cause**: App not verified by Google (common for development)
**Solution**:

- Add your email as test user
- Use development mode (limited to 100 users)
- For production, complete Google verification process

### **Issue 3: User Not Created in Appwrite**

**Cause**: Database permissions or collection setup issues
**Solution**:

- Check Appwrite database permissions
- Verify users collection exists
- Check Appwrite logs for errors

### **Issue 4: Callback Page Not Loading**

**Cause**: Route not properly configured
**Solution**:

- Verify `/auth/callback` route exists
- Check Next.js routing configuration
- Ensure page component is properly exported

## 📱 **Mobile OAuth Considerations**

If you plan to add mobile OAuth later:

### **Android Configuration**

```bash
# Add to Google Console redirect URIs
com.yourapp.scheme://oauth/callback
```

### **iOS Configuration**

```bash
# Add to Google Console redirect URIs
yourapp://oauth/callback
```

## 🚀 **Production Deployment**

### **Update Redirect URIs**

1. Google Cloud Console: Add production domain
2. Appwrite Dashboard: Update redirect URL
3. Environment variables: Set production values

### **Security Considerations**

1. **HTTPS Required**: Production must use HTTPS
2. **Domain Verification**: Verify your domain with Google
3. **API Quotas**: Monitor Google API usage
4. **Error Logging**: Implement proper error tracking

## 📊 **Monitoring and Analytics**

### **Google Cloud Console**

- Monitor OAuth consent screen metrics
- Track API usage and quotas
- View error logs

### **Appwrite Dashboard**

- Monitor authentication attempts
- Track user creation
- View error logs

## 🔐 **Advanced Configuration**

### **Custom Scopes**

Add additional scopes if needed:

```typescript
// In authService.ts
const authUrl = await account.createOAuth2Session(
  "google",
  `${window.location.origin}/auth/callback`,
  `${window.location.origin}/auth/callback`,
  ["email", "profile", "openid"] // Custom scopes
);
```

### **State Parameter**

Add state parameter for additional security:

```typescript
// Generate random state
const state = Math.random().toString(36).substring(7);
localStorage.setItem("oauth_state", state);

// Verify state in callback
const savedState = localStorage.getItem("oauth_state");
if (savedState !== state) {
  throw new Error("Invalid OAuth state");
}
```

## 📚 **Additional Resources**

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Appwrite OAuth Documentation](https://appwrite.io/docs/client/account#accountCreateOAuth2Session)
- [Google Cloud Console](https://console.cloud.google.com)
- [Appwrite Dashboard](https://cloud.appwrite.io)

## 🎯 **Next Steps After Setup**

1. **Test OAuth Flow**: Ensure users can sign in with Google
2. **User Profile Sync**: Sync Google profile data with your user model
3. **Error Handling**: Implement comprehensive error handling
4. **Analytics**: Track OAuth usage and success rates
5. **Mobile Support**: Add mobile OAuth if needed

## 🆘 **Getting Help**

If you encounter issues:

1. **Check Google Cloud Console** for OAuth errors
2. **Review Appwrite logs** for authentication issues
3. **Verify environment variables** are set correctly
4. **Check browser console** for JavaScript errors
5. **Review this guide** for common solutions

---

**Note**: This setup replaces the placeholder Google OAuth implementation with a fully functional system. Users can now authenticate using their Google accounts alongside email/password authentication.
