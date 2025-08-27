# Authentication System Documentation

This document describes the authentication system implemented in the Kanyiji marketplace application using Appwrite.

## Overview

The authentication system has been completely refactored from a mock localStorage-based system to a production-ready Appwrite integration. This provides:

- Secure user authentication
- Email verification
- Password recovery
- Role-based access control
- Session management
- Google OAuth support (ready for implementation)

## Architecture

### Components

1. **Appwrite Client** (`src/lib/appwrite.ts`)
   - Main Appwrite client configuration
   - Service initialization (Account, Databases, Storage, Avatars)
   - Configuration validation

2. **Authentication Service** (`src/services/authService.ts`)
   - User registration and login
   - Password management
   - Profile updates
   - OAuth integration

3. **Authentication Context** (`src/contexts/AuthContext.tsx`)
   - React context for authentication state
   - Provides authentication methods throughout the app
   - Handles loading states and error management

4. **Authentication Hooks** (`src/hooks/useAuthState.ts`)
   - Custom hooks for role-based access control
   - Simplified authentication state management

### Authentication Flow

```
User Action → Auth Service → Appwrite → Database → Context Update → UI Update
```

## Usage

### Basic Authentication

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    const success = await login('user@example.com', 'password');
    if (success) {
      // User is now logged in
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Role-Based Access Control

```tsx
import { useAuthState } from '@/hooks/useAuthState';

function VendorDashboard() {
  const { isVendor, hasRole } = useAuthState();

  if (!isVendor) {
    return <p>Access denied. Vendor role required.</p>;
  }

  return (
    <div>
      <h1>Vendor Dashboard</h1>
      {/* Vendor-specific content */}
    </div>
  );
}
```

### Protected Routes

```tsx
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div>Protected content</div>;
}
```

## API Reference

### AuthContext Methods

- `login(email: string, password: string): Promise<boolean>`
- `register(userData: RegisterForm): Promise<boolean>`
- `logout(): Promise<void>`
- `refreshUser(): Promise<void>`

### AuthContext State

- `user: AuthUser | null` - Current authenticated user
- `isLoading: boolean` - Loading state
- `isAuthenticated: boolean` - Authentication status

### AuthService Methods

- `getCurrentUser(): Promise<AuthUser | null>`
- `register(userData: RegisterForm): Promise<AuthResponse>`
- `login(credentials: LoginCredentials): Promise<AuthResponse>`
- `logout(): Promise<AuthResponse>`
- `forgotPassword(email: string): Promise<AuthResponse>`
- `updatePassword(userId: string, oldPassword: string, newPassword: string): Promise<AuthResponse>`
- `loginWithGoogle(): Promise<AuthResponse>`
- `isAuthenticated(): Promise<boolean>`
- `updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse>`

## User Types

### AuthUser Interface

```typescript
interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'vendor' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
}
```

### RegisterForm Interface

```typescript
interface RegisterForm {
  email: string;
  password: string;
  fullName: string;
  role: 'customer' | 'vendor';
}
```

## Error Handling

The authentication system includes comprehensive error handling:

- Network errors
- Validation errors
- Authentication failures
- Database errors

Errors are displayed to users via toast notifications and logged to the console for debugging.

## Security Features

1. **Password Security**
   - Passwords are hashed by Appwrite
   - Minimum password requirements enforced
   - Secure password recovery

2. **Session Management**
   - Secure session tokens
   - Automatic session validation
   - Proper logout handling

3. **Data Protection**
   - User data stored securely in Appwrite
   - Role-based access control
   - Input validation and sanitization

## Configuration

### Environment Variables

Required environment variables (see `.env.example`):

```bash
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID=users
```

### Appwrite Setup

Follow the `APPWRITE_SETUP.md` guide to:
1. Create an Appwrite project
2. Set up database and collections
3. Configure authentication providers
4. Set up email verification and recovery

## Testing

### Unit Tests

```bash
npm run test
```

### Integration Tests

1. Test user registration
2. Test login/logout
3. Test password recovery
4. Test role-based access
5. Test error scenarios

## Troubleshooting

### Common Issues

1. **Authentication Fails**
   - Check environment variables
   - Verify Appwrite project configuration
   - Check browser console for errors

2. **User Not Found**
   - Verify database collection setup
   - Check collection permissions
   - Verify user creation process

3. **Session Issues**
   - Clear browser storage
   - Check Appwrite session settings
   - Verify endpoint configuration

### Debug Mode

Enable debug logging by setting:

```typescript
// In src/lib/appwrite.ts
export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setSelfSigned(true); // For development only
```

## Migration from Mock System

The following changes were made to migrate from the mock system:

1. **Removed localStorage usage**
2. **Replaced mock authentication with Appwrite**
3. **Updated all authentication components**
4. **Added proper error handling**
5. **Implemented role-based access control**

## Future Enhancements

1. **Multi-factor Authentication**
2. **Social Login Providers**
3. **Advanced Role Management**
4. **Audit Logging**
5. **Rate Limiting**
6. **Advanced Security Features**

## Support

For authentication-related issues:

1. Check the Appwrite documentation
2. Review error logs in browser console
3. Verify environment configuration
4. Check Appwrite dashboard for errors
5. Review the setup guide in `APPWRITE_SETUP.md`
