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

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

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
      } else {
        return null;
      }
    } catch (error) {
      // console.error("Error getting current user:", error);
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

      // Create user account - Supabase will send verification email via Resend SMTP
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
      
      // Note: Verification email is automatically sent via Resend SMTP (configured in Supabase)

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
            phone: userData.phone || "",
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
          
          // If profile creation failed but phone exists, try to update it later
          // This handles the case where trigger creates profile without phone
          if (userData.phone && authData.user) {
            const userId = authData.user.id;
            setTimeout(async () => {
              try {
                const { error: updateError } = await supabase
                  .from("profiles")
                  .update({
                    phone: userData.phone || "",
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", userId);
                
                if (!updateError) {
                  console.log("Phone number updated in profile after trigger creation");
                }
              } catch (err) {
                console.error("Error updating phone after profile creation:", err);
              }
            }, 2000); // Wait 2 seconds for trigger to create profile
          }
        } else {
          console.log(
            "Profile created successfully during signup:",
            profileData
          );
        }
      } catch (profileError) {
        console.error("Profile creation error:", profileError);
        console.log("Profile will be created during email verification");
        
        // If profile creation failed but phone exists, try to update it later
        if (userData.phone && authData.user) {
          const userId = authData.user.id;
          setTimeout(async () => {
            try {
              const { error: updateError } = await supabase
                .from("profiles")
                .update({
                  phone: userData.phone || "",
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId);
              
              if (!updateError) {
                console.log("Phone number updated in profile after trigger creation");
              }
            } catch (err) {
              console.error("Error updating phone after profile creation:", err);
            }
          }, 2000);
        }
      }

      // Check if email confirmation is required
      if (
        authData.user.email_confirmed_at === null ||
        authData.user.email_confirmed_at === undefined
      ) {
        console.log(
          "Email confirmation required, sending verification email..."
        );
        
        // Explicitly resend verification email using Supabase's resend method
        // This ensures the OTP email is sent even if Supabase didn't send it automatically
        try {
          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: userData.email,
          });

          if (resendError) {
            console.error("Failed to resend verification email:", resendError);
            // Also try the custom API as fallback
            try {
              const response = await fetch("/api/auth/send-verification-email", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: userData.email,
                }),
              });

              if (!response.ok) {
                console.error("Failed to send verification email via API fallback");
              } else {
                console.log("Verification email sent successfully via API fallback");
              }
            } catch (apiError) {
              console.error("Error sending verification email via API:", apiError);
            }
          } else {
            console.log("Verification email sent successfully via Supabase resend");
          }
        } catch (emailError) {
          console.error("Error sending verification email:", emailError);
          // Try the custom API as fallback
          try {
            await fetch("/api/auth/send-verification-email", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: userData.email,
              }),
            });
          } catch (apiError) {
            console.error("Error sending verification email via API fallback:", apiError);
          }
        }
        
        // Send welcome email after registration (even if verification is required)
        // Don't wait for it to complete - send asynchronously
        fetch("/api/auth/send-welcome-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userData.email,
            fullName: userData.fullName,
          }),
        })
        .then((response) => {
          if (response.ok) {
            console.log("Welcome email sent successfully for email/password signup");
          } else {
            console.error("Failed to send welcome email:", response.statusText);
          }
        })
        .catch((emailError) => {
          console.error("Error sending welcome email:", emailError);
          // Don't fail signup if welcome email fails
        });
        
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

      // Send welcome email after successful registration
      // Don't wait for it to complete - send asynchronously
      fetch("/api/auth/send-welcome-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          fullName: userData.fullName,
        }),
      })
      .then((response) => {
        if (response.ok) {
          console.log("Welcome email sent successfully for email/password signup");
        } else {
          console.error("Failed to send welcome email:", response.statusText);
        }
      })
      .catch((emailError) => {
        console.error("Error sending welcome email:", emailError);
        // Don't fail signup if welcome email fails
      });

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
      console.log("SupabaseAuthService logout called");
      const { error } = await supabase.auth.signOut();
      console.log("Supabase signOut result:", { error });

      if (error) {
        console.log("Logout error:", error.message);
        return {
          success: false,
          error: error.message || "Logout failed",
        };
      }

      console.log("Logout successful");
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
      console.log("Starting password reset for:", email);
      const normalizedEmail = email.trim().toLowerCase();

      // For OTP-based password reset, we need to use resetPasswordForEmail
      // The email template in Supabase must be configured to include {{ .Token }} for OTP
      // Make sure the "Reset Password" email template includes the OTP token
      const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("Password reset error:", error);
        console.error("Full error details:", JSON.stringify(error, null, 2));
        
        // Check for specific error types
        const errorMessage = error.message.toLowerCase();
        const errorString = JSON.stringify(error).toLowerCase();
        
        // Check for SMTP authentication errors (535 Invalid username)
        // The error code might be in the error object, not just the message
        if (errorString.includes("535") || errorString.includes("invalid username") || 
            errorMessage.includes("authentication failed") || errorMessage.includes("535")) {
          return {
            success: false,
            error: "SMTP Authentication Failed: The SMTP username in Supabase is incorrect. Go to Supabase → Settings → Auth → SMTP Settings and verify:\n1. Username is your FULL email (e.g., yourname@gmail.com)\n2. For Gmail, use App Password (not regular password)\n3. No extra spaces in username/password",
          };
        }
        
        // Generic email sending error - likely SMTP configuration issue
        if (errorMessage.includes("error sending") || errorMessage.includes("recovery email") || errorMessage.includes("confirmation email")) {
          return {
            success: false,
            error: "Unable to send password reset email. Based on Supabase logs, this is likely an SMTP authentication issue (535 Invalid username). Please:\n1. Check SMTP username is correct (full email for Gmail)\n2. Verify password (App Password for Gmail)\n3. Check Supabase → Settings → Auth → SMTP Settings",
          };
        }
        
        return {
          success: false,
          error: error.message || "Failed to send password reset email",
        };
      }

      console.log("Password reset email sent successfully", { data });
      return { success: true };
    } catch (error: any) {
      console.error("Password reset error:", error);
      return {
        success: false,
        error: error.message || "Failed to send password reset email",
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

      // Verify OTP using Supabase
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "recovery",
      });

      if (verifyError) {
        console.error("OTP verification error:", verifyError);
        return {
          success: false,
          error: verifyError.message || "Invalid or expired OTP",
        };
      }

      // OTP is valid, now update password
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
