import { ID, Query } from "appwrite";
import { account, databases, appwriteConfig } from "@/lib/appwrite";
import { User, RegisterForm } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "vendor" | "admin";
  isEmailVerified: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;

  // Get current authenticated user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const session = await account.get();
      if (session) {
        // Fetch additional user data from database
        const userData = await this.getUserFromDatabase(session.$id);
        if (userData) {
          this.currentUser = userData;
          return userData;
        }
      }
      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // User registration
  async register(userData: RegisterForm): Promise<AuthResponse> {
    try {
      // Validate Appwrite configuration
      if (
        !appwriteConfig.projectId ||
        !appwriteConfig.databaseId ||
        !appwriteConfig.usersCollectionId
      ) {
        return {
          success: false,
          error:
            "Appwrite configuration is missing. Please check your environment variables.",
        };
      }

      // Create user account in Appwrite
      const accountResponse = await account.create(
        ID.unique(),
        userData.email,
        userData.password,
        userData.fullName
      );

      // Create user profile in database
      const profileData = {
        user_id: accountResponse.$id,
        email: userData.email,
        full_name: userData.fullName,
        role: userData.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        profileData
      );

      // Send email verification
      await account.createVerification(
        `${window.location.origin}/verify-email`
      );

      return {
        success: true,
        user: {
          id: accountResponse.$id,
          email: userData.email,
          name: userData.fullName,
          role: userData.role,
          isEmailVerified: false,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: error.message || "Registration failed",
      };
    }
  }

  // User login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Validate Appwrite configuration
      if (!appwriteConfig.projectId) {
        return {
          success: false,
          error:
            "Appwrite configuration is missing. Please check your environment variables.",
        };
      }
      // Authenticate with Appwrite
      const session = await account.createSession(
        credentials.email,
        credentials.password
      );

      if (session) {
        // Fetch user data from database
        const userData = await this.getUserFromDatabase(session.userId);
        if (userData) {
          this.currentUser = userData;
          return {
            success: true,
            user: userData,
          };
        }
      }

      return {
        success: false,
        error: "Login failed",
      };
    } catch (error: any) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.message || "Login failed",
      };
    }
  }

  // User logout
  async logout(): Promise<AuthResponse> {
    try {
      await account.deleteSession("current");
      this.currentUser = null;

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  }

  // Password reset
  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      await account.createRecovery(
        email,
        `${window.location.origin}/reset-password`
      );

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        error: error.message || "Password reset failed",
      };
    }
  }

  // Update password
  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      await account.updatePassword(newPassword, oldPassword);

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Update password error:", error);
      return {
        success: false,
        error: error.message || "Password update failed",
      };
    }
  }

  // Google OAuth login
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      // Create OAuth session with proper redirect URLs
      const authUrl = await account.createOAuth2Session(
        "google" as any,
        `${window.location.origin}/auth/callback`,
        `${window.location.origin}/auth/callback`
      );

      // Store OAuth state for verification
      localStorage.setItem("oauth_provider", "google");

      // Redirect to Google OAuth
      window.location.href = authUrl as string;

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Google OAuth error:", error);
      return {
        success: false,
        error: error.message || "Google OAuth failed",
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await account.get();
      return !!session;
    } catch (error) {
      return false;
    }
  }

  // Get user from database
  private async getUserFromDatabase(userId: string): Promise<AuthUser | null> {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("user_id", userId)]
      );

      if (response.documents.length > 0) {
        const userDoc = response.documents[0];
        return {
          id: userDoc.user_id,
          email: userDoc.email,
          name: userDoc.full_name,
          role: userDoc.role,
          isEmailVerified: userDoc.email_verified || false,
          createdAt: userDoc.created_at,
        };
      }

      return null;
    } catch (error) {
      console.error("Error fetching user from database:", error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<AuthResponse> {
    try {
      const response = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        userId,
        {
          ...updates,
          updated_at: new Date().toISOString(),
        }
      );

      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = {
          ...this.currentUser,
          ...updates,
        };
      }

      return {
        success: true,
        user: this.currentUser || undefined,
      };
    } catch (error: any) {
      console.error("Profile update error:", error);
      return {
        success: false,
        error: error.message || "Profile update failed",
      };
    }
  }

  // Get current user (cached)
  getCurrentUserCached(): AuthUser | null {
    return this.currentUser;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
