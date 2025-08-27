# Appwrite Authentication Setup Guide for Kanyiji

This guide will help you set up Appwrite authentication for the Kanyiji marketplace application.

## 1. Create an Appwrite Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io) and sign up/login
2. Click "Create Project"
3. Enter project name: `Kanyiji Marketplace`
4. Choose your preferred region
5. Click "Create"

## 2. Get Project Credentials

1. In your Appwrite dashboard, go to **Settings** → **API Keys**
2. Copy the following values:
   - **Project ID**: This is your unique project identifier
   - **API Endpoint**: Usually `https://cloud.appwrite.io/v1`

## 3. Create Database and Collections

### Create Database
1. Go to **Databases** in your Appwrite dashboard
2. Click "Create Database"
3. Name: `kanyiji_main`
4. Click "Create"

### Create Users Collection
1. In your database, click "Create Collection"
2. Name: `users`
3. Collection ID: `users`
4. Permissions: Set appropriate read/write permissions
5. Click "Create"

### Add Attributes to Users Collection
1. Go to **Attributes** tab
2. Add the following attributes:
   - `user_id` (String, Required, Array: false)
   - `email` (String, Required, Array: false)
   - `full_name` (String, Required, Array: false)
   - `role` (String, Required, Array: false, Enum: ["customer", "vendor", "admin"])
   - `email_verified` (Boolean, Required, Array: false, Default: false)
   - `created_at` (String, Required, Array: false)
   - `updated_at` (String, Required, Array: false)

### Create Products Collection (Optional)
1. Create collection named `products`
2. Add appropriate attributes for products

### Create Orders Collection (Optional)
1. Create collection named `orders`
2. Add appropriate attributes for orders

## 4. Set Up Authentication

### Enable Email/Password Authentication
1. Go to **Auth** → **Settings**
2. Enable "Email/Password" authentication
3. Configure email templates if needed

### Enable Google OAuth (Optional)
1. Go to **Auth** → **OAuth2 Providers**
2. Enable Google
3. Add your Google OAuth credentials
4. Set redirect URLs to: `http://localhost:3000/auth/callback`

### Configure Email Verification
1. Go to **Auth** → **Settings**
2. Enable "Email verification"
3. Set verification URL to: `http://localhost:3000/verify-email`

### Configure Password Recovery
1. Go to **Auth** → **Settings**
2. Enable "Password recovery"
3. Set recovery URL to: `http://localhost:3000/reset-password`

## 5. Update Environment Variables

1. Copy `.env.example` to `.env.local`
2. Update the following variables with your actual values:

```bash
# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_actual_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
NEXT_PUBLIC_APPWRITE_PRODUCTS_COLLECTION_ID=products
NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID=orders
NEXT_PUBLIC_APPWRITE_STORAGE_ID=your_storage_id
```

## 6. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to the login/signup forms
3. Try creating a new account
4. Verify email verification works
5. Test login functionality

## 7. Security Considerations

### Database Permissions
- Set appropriate read/write permissions for collections
- Use Appwrite's built-in security rules
- Consider implementing custom security functions

### API Keys
- Never expose service role keys to the client
- Use appropriate API key permissions
- Regularly rotate API keys

### Authentication
- Enable rate limiting for auth endpoints
- Implement proper session management
- Use HTTPS in production

## 8. Production Deployment

### Update Environment Variables
1. Set production Appwrite project credentials
2. Update redirect URLs to your production domain
3. Configure production email templates

### Security Headers
1. Implement proper CORS policies
2. Set security headers in Next.js
3. Use environment-specific configurations

## 9. Troubleshooting

### Common Issues

1. **Authentication Fails**
   - Check project ID and endpoint
   - Verify collection permissions
   - Check browser console for errors

2. **Email Not Sending**
   - Verify email provider configuration
   - Check spam folder
   - Verify email templates

3. **Database Errors**
   - Check collection IDs
   - Verify attribute names
   - Check database permissions

### Debug Mode
Enable debug logging in your Appwrite client:

```typescript
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setSelfSigned(true); // For development only
```

## 10. Next Steps

1. **Implement User Profiles**: Add profile management functionality
2. **Add Role-Based Access**: Implement vendor/admin dashboards
3. **File Upload**: Set up Appwrite Storage for product images
4. **Real-time Updates**: Use Appwrite's real-time features
5. **Analytics**: Implement user behavior tracking

## Support

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Community](https://appwrite.io/discord)
- [GitHub Issues](https://github.com/appwrite/appwrite/issues)

## Notes

- This setup replaces the mock authentication system
- All authentication now goes through Appwrite
- User data is stored in Appwrite's database
- Session management is handled by Appwrite
- Email verification and password recovery are fully functional
