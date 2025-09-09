import { supabase, validateSupabaseConfig } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "customer" | "vendor" | "admin";
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
  requiresVerification?: boolean;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  fullName: string;
  role: "customer" | "vendor";
  phone?: string;
}

class SupabaseAuthService {
  // Get current user
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      if (!validateSupabaseConfig()) {
        return null;
      }

      // First try to get the session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        return null;
      }

      if (!sessionData.session || !sessionData.session.user) {
        return null;
      }

      const user = sessionData.session.user;

      // Get user profile from profiles table
      console.log("Looking for profile for user:", user.id);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile error:", profileError);
        // If profile doesn't exist, create it
        if (profileError.code === "PGRST116") {
          console.log("Profile doesn't exist, creating one...");
          // Profile doesn't exist, create it
          const { error: createError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              email: user.email!,
              full_name:
                user.user_metadata?.full_name || user.email!.split("@")[0],
              role: user.user_metadata?.role || "customer",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (createError) {
            console.error("Error creating profile:", createError);
            return null;
          }

          console.log("Profile created successfully");
          // Return user with basic info
          return {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!.split("@")[0],
            role: user.user_metadata?.role || "customer",
            isEmailVerified: user.email_confirmed_at !== null,
            createdAt: new Date().toISOString(),
          };
        }
        return null;
      }

      console.log("Profile found:", profile);

      return {
        id: user.id,
        email: user.email!,
        name: profile.full_name,
        role: profile.role,
        isEmailVerified: user.email_confirmed_at !== null,
        createdAt: profile.created_at,
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // User registration
  async register(userData: RegisterForm): Promise<AuthResponse> {
    try {
      console.log("Starting registration for:", userData.email);

      if (!validateSupabaseConfig()) {
        console.error("Supabase configuration invalid");
        return {
          success: false,
          error:
            "Supabase configuration is missing. Please check your environment variables.",
        };
      }

      // Create user account with email confirmation
      console.log("Creating user account...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.fullName,
            role: userData.role,
            phone: userData.phone || "",
          },
          emailRedirectTo: `${
            window.location.origin
          }/verify-email?email=${encodeURIComponent(userData.email)}`,
        },
      });

      console.log("Auth response:", { authData, authError });

      if (authError) {
        console.error("Auth error:", authError);
        return {
          success: false,
          error: authError.message || "Registration failed",
        };
      }

      if (!authData.user) {
        console.error("No user returned from auth");
        return {
          success: false,
          error: "No user returned from authentication",
        };
      }

      // Try to create profile during signup (fallback if trigger doesn't work)
      console.log("Attempting to create profile during signup...");
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            email: userData.email,
            full_name: userData.fullName,
            role: userData.role,
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select();

        if (profileError) {
          console.error(
            "Profile creation error (this is expected due to RLS):",
            profileError
          );
          console.log("Profile will be created during email verification");
        } else {
          console.log(
            "Profile created successfully during signup:",
            profileData
          );
        }
      } catch (profileError) {
        console.error("Profile creation error:", profileError);
        console.log("Profile will be created during email verification");
      }

      // Check if email confirmation is required
      if (
        authData.user.email_confirmed_at === null ||
        authData.user.email_confirmed_at === undefined
      ) {
        console.log(
          "Email confirmation required, redirecting to verification page"
        );
        return {
          success: true,
          user: {
            id: authData.user.id,
            email: userData.email,
            name: userData.fullName,
            role: userData.role,
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
          },
          requiresVerification: true,
          message:
            "Please check your email and verify your account to continue.",
        };
      }

      // Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get the current session to ensure it's properly set
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      console.log("Session after signup:", { sessionData, sessionError });

      return {
        success: true,
        user: {
          id: authData.user.id,
          email: userData.email,
          name: userData.fullName,
          role: userData.role,
          isEmailVerified: authData.user.email_confirmed_at !== null,
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
      if (!validateSupabaseConfig()) {
        return {
          success: false,
          error:
            "Supabase configuration is missing. Please check your environment variables.",
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Login failed",
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: "No user returned from authentication",
        };
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError || !profile) {
        return {
          success: false,
          error: "User profile not found",
        };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: profile.full_name,
          role: profile.role,
          isEmailVerified: data.user.email_confirmed_at !== null,
          createdAt: profile.created_at,
        },
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
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          success: false,
          error: error.message || "Logout failed",
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Logout error:", error);
      return {
        success: false,
        error: error.message || "Logout failed",
      };
    }
  }

  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      console.log("Starting password reset OTP for:", email);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        return {
          success: false,
          error: error.message || "Failed to send password reset OTP",
        };
      }

      console.log("Password reset OTP sent successfully");
      return { success: true };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: error.message || "Failed to send password reset OTP",
      };
    }
  }

  async verifyPasswordResetOTP(
    email: string,
    token: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      console.log("Verifying password reset OTP for:", email);

      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (error) {
        console.error("OTP verification error:", error);
        return {
          success: false,
          error: error.message || "Invalid or expired OTP",
        };
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error("Password update error:", updateError);
        return {
          success: false,
          error: updateError.message || "Failed to update password",
        };
      }

      console.log("Password updated successfully");
      return { success: true };
    } catch (error: any) {
      console.error("Password reset verification error:", error);
      return {
        success: false,
        error: error.message || "Failed to verify OTP",
      };
    }
  }

  // Google OAuth login
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      if (!validateSupabaseConfig()) {
        return {
          success: false,
          error:
            "Supabase configuration is missing. Please check your environment variables.",
        };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Google authentication failed",
        };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Google login error:", error);
      return {
        success: false,
        error: error.message || "Google authentication failed",
      };
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();
