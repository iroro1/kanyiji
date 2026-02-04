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
  requiresMFA?: boolean;
  mfaChallenge?: any;
  /** TOTP factor ID to use with challengeAndVerify when requiresMFA is true */
  mfaFactorId?: string;
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
          // After user clicks confirmation link in email, Supabase redirects here with tokens in URL hash.
          // /auth/callback handles the hash and establishes the session.
          emailRedirectTo: typeof window !== "undefined"
            ? `${window.location.origin}/auth/callback`
            : process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
            : `https://kanyiji.ng/auth/callback`,
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
            includeVerificationLink: true,
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
        
        // Ensure no session is active until user clicks the confirmation link
        await supabase.auth.signOut();

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
            "Please check your email and click the confirmation link to activate your account.",
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
      console.log("🔐 Starting login for:", credentials.email);
      console.log("🌐 Environment:", {
        hasWindow: typeof window !== "undefined",
        origin: typeof window !== "undefined" ? window.location.origin : "server",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
      });
      
      if (!validateSupabaseConfig()) {
        console.error("❌ Supabase configuration invalid");
        return {
          success: false,
          error:
            "Supabase configuration is missing. Please check your environment variables.",
        };
      }

      console.log("📤 Calling signInWithPassword...");
      const LOGIN_TIMEOUT_MS = 60_000; // 60s so slow connections can complete
      let data: { user: any; session: any } | null = null;
      let error: { message: string } | null = null;
      try {
        const result = await Promise.race([
          supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Login timed out. Please check your connection and try again.")), LOGIN_TIMEOUT_MS)
          ),
        ]);
        data = result.data as { user: any; session: any };
        error = result.error as { message: string } | null;
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || "Login timed out. Please check your connection and try again.",
        };
      }

      if (error) {
        console.error("❌ Supabase auth error:", error);
        return {
          success: false,
          error: error.message || "Login failed",
        };
      }

      // Log session immediately after login
      if (data?.session) {
        console.log("✅ Login successful, session created:", {
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: new Date(data.session.expires_at! * 1000).toISOString(),
        });
      }

      if (!data.user || !data.session) {
        console.error("❌ No user/session returned from authentication");
        return {
          success: false,
          error: "No user returned from authentication",
        };
      }

      // Check if MFA (AAL2) is required — user has TOTP enrolled and must verify
      try {
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (!aalError && aalData?.nextLevel === "aal2") {
          const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
          if (!factorsError && factorsData?.totp?.length) {
            const factorId = factorsData.totp[0].id;
            console.log("⚠️ MFA required (AAL2), factorId:", factorId);
            return {
              success: false,
              error: "Two-factor authentication is enabled. Please enter the code from your authenticator app.",
              requiresMFA: true,
              mfaFactorId: factorId,
            };
          }
        }
      } catch (aalErr) {
        console.warn("AAL check failed, continuing as normal login:", aalErr);
      }

      console.log("✅ Auth successful, user ID:", data.user.id);

      // Build user from session immediately so login doesn't hang on profile fetch
      const userFromSession = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
        role: (data.user.user_metadata?.role as "customer" | "vendor" | "admin") || "customer",
        isEmailVerified: data.user.email_confirmed_at !== null,
        createdAt: data.user.created_at || new Date().toISOString(),
      };

      // Profile fetch with short timeout so login returns quickly; use session data if it hangs
      const PROFILE_TIMEOUT_MS = 4_000;
      let profile: { full_name?: string; role?: string; created_at?: string } | null = null;
      let profileError: { code?: string; message?: string } | null = null;
      try {
        const profileResult = await Promise.race([
          supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle(),
          new Promise<{ data: null; error: { message: string } }>((_, reject) =>
            setTimeout(() => reject(new Error("Profile fetch timed out")), PROFILE_TIMEOUT_MS)
          ),
        ]);
        if (profileResult && "data" in profileResult) {
          profile = (profileResult as { data: any; error: any }).data;
          profileError = (profileResult as { data: any; error: any }).error;
        }
      } catch (_) {
        // Timeout or error: use session user
        return { success: true, user: userFromSession };
      }

      if (profileError) {
        const msg = profileError.message ?? "";
        const isNotFound = profileError.code === "PGRST116" || msg.includes("No rows");
        if (isNotFound) {
          // Create profile in background so it exists next time
          void Promise.resolve(
            supabase.from("profiles").insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: data.user.user_metadata?.full_name || data.user.email!.split("@")[0],
              role: data.user.user_metadata?.role || "customer",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
          ).catch(() => {});
        }
        // Never fail login when sign-in succeeded — use session user for any profile error
        return { success: true, user: userFromSession };
      }

      if (!profile) {
        return { success: true, user: userFromSession };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: profile.full_name ?? userFromSession.name,
          role: (profile.role as "customer" | "vendor" | "admin") ?? userFromSession.role,
          isEmailVerified: data.user.email_confirmed_at !== null,
          createdAt: profile.created_at ?? userFromSession.createdAt,
        },
      };
    } catch (error: any) {
      console.error("❌ Login error:", error);
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
      const getRedirectUrl = () => {
        if (typeof window !== "undefined") {
          return `${window.location.origin}/reset-password`;
        }
        return process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
          : "https://kanyiji.ng/reset-password";
      };

      const { data, error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: getRedirectUrl(),
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

  /**
   * Verify MFA (TOTP) code after login — uses factorId from login response.
   * @param code - The 6-digit code from the user's authenticator app
   * @param factorId - The MFA factor ID returned when login returned requiresMFA
   */
  async verifyMFA(code: string, factorId?: string): Promise<AuthResponse> {
    try {
      if (!validateSupabaseConfig()) {
        return {
          success: false,
          error:
            "Supabase configuration is missing. Please check your environment variables.",
        };
      }

      if (!factorId || !code.trim()) {
        return {
          success: false,
          error: "Verification code and factor are required. Please try logging in again.",
        };
      }

      console.log("🔐 Verifying MFA (TOTP) code...");
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim(),
      });

      if (error) {
        console.error("❌ MFA verification error:", error);
        return {
          success: false,
          error: error.message || "Invalid verification code. Please try again.",
        };
      }

      // Supabase MFA verify returns { access_token, refresh_token, user } and updates session internally
      if (data?.user) {
        console.log("✅ MFA verification successful");
        const currentUser = await this.getCurrentUser();
        return {
          success: true,
          user: currentUser || undefined,
        };
      }

      return {
        success: false,
        error: "MFA verification failed. Please try again.",
      };
    } catch (error: any) {
      console.error("❌ MFA verification exception:", error);
      return {
        success: false,
        error: error?.message || "An unexpected error occurred during MFA verification",
      };
    }
  }

  /**
   * Get current MFA factors (for profile/settings).
   */
  async listMFAFactors(): Promise<{ totp: { id: string; friendly_name?: string }[]; error?: string }> {
    try {
      if (!validateSupabaseConfig()) {
        return { totp: [], error: "Supabase not configured." };
      }
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return { totp: [], error: error.message };
      return {
        totp: (data?.totp ?? []).map((f) => ({ id: f.id, friendly_name: f.friendly_name })),
      };
    } catch (e: any) {
      return { totp: [], error: e?.message ?? "Failed to list factors." };
    }
  }

  /**
   * Get authenticator assurance level (aal1 vs aal2).
   */
  async getMFALevel(): Promise<{ currentLevel: "aal1" | "aal2" | null; nextLevel: "aal1" | "aal2" | null; error?: string }> {
    try {
      if (!validateSupabaseConfig()) {
        return { currentLevel: null, nextLevel: null, error: "Supabase not configured." };
      }
      const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (error) return { currentLevel: null, nextLevel: null, error: error.message };
      return {
        currentLevel: data?.currentLevel ?? null,
        nextLevel: data?.nextLevel ?? null,
      };
    } catch (e: any) {
      return { currentLevel: null, nextLevel: null, error: e?.message };
    }
  }

  /**
   * Enroll a new TOTP factor. Returns QR code data and factor id; caller must then verify with verifyMFAEnrollment.
   * Requires a valid Supabase session; returns a friendly error if session is missing (avoids 403).
   */
  async enrollMFA(friendlyName?: string): Promise<{
    success: boolean;
    factorId?: string;
    qrCode?: string;
    secret?: string;
    uri?: string;
    error?: string;
  }> {
    try {
      if (!validateSupabaseConfig()) {
        return { success: false, error: "Supabase not configured." };
      }
      const SESSION_CHECK_MS = 4_000;
      let sessionPromise = supabase.auth.getSession();
      let sessionTimeout = new Promise<{ data: { session: null } }>((resolve) =>
        setTimeout(() => resolve({ data: { session: null } }), SESSION_CHECK_MS)
      );
      let { data: sessionData } = await Promise.race([sessionPromise, sessionTimeout]);
      if (!sessionData?.session?.user) {
        // Try refreshing the session (e.g. after OAuth callback or expired token)
        try {
          const { data: refreshData } = await Promise.race([
            supabase.auth.refreshSession(),
            new Promise<{ data: { session: null } }>((r) => setTimeout(() => r({ data: { session: null } }), 3_000)),
          ]);
          if (refreshData?.session?.user) {
            sessionData = { session: refreshData.session };
          }
        } catch {
          // ignore
        }
      }
      if (!sessionData?.session?.user) {
        return {
          success: false,
          error: "Please sign out and sign in again to set up 2FA.",
        };
      }
      const ENROLL_TIMEOUT_MS = 10_000;
      const enrollPromise = supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: friendlyName ?? "Kanyiji Authenticator",
        issuer: typeof window !== "undefined" ? window.location?.hostname ?? "Kanyiji" : "Kanyiji",
      });
      const enrollTimeout = new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "Request timed out. Please sign out and sign in again, then try Enable 2FA." } }), ENROLL_TIMEOUT_MS)
      );
      const result = await Promise.race([enrollPromise, enrollTimeout]);
      const { data, error } = result;
      if (error) return { success: false, error: error.message };
      if (!data?.id || !data?.totp) return { success: false, error: "Invalid enroll response." };
      return {
        success: true,
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      };
    } catch (e: any) {
      return { success: false, error: e?.message ?? "Enrollment failed." };
    }
  }

  /**
   * Verify TOTP enrollment with a code from the authenticator app; completes enrollment.
   */
  async verifyMFAEnrollment(factorId: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!validateSupabaseConfig()) {
        return { success: false, error: "Supabase not configured." };
      }
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim(),
      });
      if (error) return { success: false, error: error.message };
      return { success: !!data };
    } catch (e: any) {
      return { success: false, error: e?.message ?? "Verification failed." };
    }
  }

  /**
   * Remove a TOTP factor. User must be at AAL2 (e.g. just verified).
   */
  async unenrollMFA(factorId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!validateSupabaseConfig()) {
        return { success: false, error: "Supabase not configured." };
      }
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message ?? "Unenroll failed." };
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

      // Get the redirect URL dynamically based on the current environment
      const getRedirectUrl = () => {
        if (typeof window !== "undefined") {
          // Use current origin for local development
          return `${window.location.origin}/auth/callback`;
        }
        // Fallback to environment variable or production URL
        return process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
          : "https://kanyiji.ng/auth/callback";
      };

      const redirectTo = getRedirectUrl();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        return {
          success: false,
          error: error.message || "Google authentication failed",
        };
      }

      // Supabase returns data.url — the browser must navigate there to start the OAuth flow
      if (data?.url && typeof window !== "undefined") {
        window.location.href = data.url;
        return { success: true };
      }

      // Fallback if no URL (e.g. server-side): caller may need to redirect
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
