"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { supabaseAuthService, AuthUser } from "@/services/supabaseAuthService";
import { toast } from "react-hot-toast";
import { validateSupabaseConfig, supabase } from "@/lib/supabase";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigValid: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    userData: any
  ) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to wait for initial auth check
  const [isConfigValid, setIsConfigValid] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Check authentication status on mount
  useEffect(() => {
    let isMounted = true;

    // First validate configuration
    const configValid = validateSupabaseConfig();
    setIsConfigValid(configValid);

    console.log(configValid);
    console.log("after supabase validation");

    if (configValid) {
      // First, check the current session immediately
      const checkInitialSession = async () => {
        try {
          // Wait a bit to ensure localStorage is available
          if (typeof window !== "undefined") {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);
            if (isMounted) {
              setUser(null);
              setIsLoading(false);
            }
            return;
          }

          if (session?.user && isMounted) {
            try {
              console.log("Found existing session, restoring user...");
              const currentUser = await supabaseAuthService.getCurrentUser();
              if (isMounted) {
                if (currentUser) {
                  console.log("User restored from session:", currentUser.email);
                  setUser(currentUser);
                  // Store in localStorage as backup
                  if (typeof window !== "undefined") {
                    localStorage.setItem("kanyiji_auth_user", JSON.stringify(currentUser));
                  }
                } else {
                  // Fallback: use session data if getCurrentUser fails
                  console.log("Using session data as fallback");
                  const fallbackUser = {
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.full_name || session.user.email!.split("@")[0],
                    role: session.user.user_metadata?.role || "customer",
                    isEmailVerified: session.user.email_confirmed_at !== null,
                    createdAt: session.user.created_at,
                  };
                  setUser(fallbackUser);
                  // Store in localStorage as backup
                  if (typeof window !== "undefined") {
                    localStorage.setItem("kanyiji_auth_user", JSON.stringify(fallbackUser));
                  }
                }
                setIsLoading(false);
              }
            } catch (error) {
              console.error("Error getting current user:", error);
              // Fallback: use session data
              if (session?.user && isMounted) {
                const fallbackUser = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.full_name || session.user.email!.split("@")[0],
                  role: session.user.user_metadata?.role || "customer",
                  isEmailVerified: session.user.email_confirmed_at !== null,
                  createdAt: session.user.created_at,
                };
                setUser(fallbackUser);
                // Store in localStorage as backup
                if (typeof window !== "undefined") {
                  localStorage.setItem("kanyiji_auth_user", JSON.stringify(fallbackUser));
                }
              } else if (isMounted) {
                setUser(null);
              }
              if (isMounted) {
                setIsLoading(false);
              }
            }
          } else {
            console.log("No existing session found");
            // Check localStorage backup
            if (typeof window !== "undefined" && isMounted) {
              try {
                const storedUser = localStorage.getItem("kanyiji_auth_user");
                if (storedUser) {
                  const parsedUser = JSON.parse(storedUser);
                  console.log("Found user in localStorage backup, verifying session...");
                  // Verify session still exists
                  const { data: { session: verifySession } } = await supabase.auth.getSession();
                  if (verifySession) {
                    console.log("Session verified, restoring from backup");
                    setUser(parsedUser);
                    setIsLoading(false);
                    return;
                  } else {
                    // Session expired, clear backup
                    localStorage.removeItem("kanyiji_auth_user");
                  }
                }
              } catch (e) {
                console.error("Error checking localStorage backup:", e);
              }
            }
            if (isMounted) {
              setUser(null);
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Error checking initial session:", error);
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
        }
      };

      checkInitialSession();

      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!isMounted) return;

        console.log("Auth state change:", event, session?.user?.email);
        console.log("Session exists:", !!session);
        console.log("User exists:", !!session?.user);

        if (event === "SIGNED_IN" && session) {
          try {
            console.log("User signed in, getting current user...");
            setIsLoading(true);
            
            // Wait a bit for session to be fully established
            await new Promise((resolve) => setTimeout(resolve, 500));
            
            const currentUser = await supabaseAuthService.getCurrentUser();

            if (!currentUser) {
              console.warn("No current user found, but session exists. Creating user from session...");
              // Fallback: create user object from session if getCurrentUser fails
              if (session.user) {
                const fallbackUser = {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.full_name || session.user.email!.split("@")[0],
                  role: session.user.user_metadata?.role || "customer",
                  isEmailVerified: session.user.email_confirmed_at !== null,
                  createdAt: session.user.created_at,
                };
                console.log("Using fallback user from session:", fallbackUser);
                if (isMounted) {
                  setUser(fallbackUser);
                  queryClient.invalidateQueries({ queryKey: ["currentUser"] });
                  setIsLoading(false);
                }
                return;
              }
              throw new Error("No current user found after sign-in");
            }
            console.log("Current user:", currentUser);
            if (isMounted) {
              setUser(currentUser);
              // Invalidate React Query cache to trigger refetch of current user
              queryClient.invalidateQueries({ queryKey: ["currentUser"] });
              setIsLoading(false);
            }
          } catch (error) {
            console.error("Error in SIGNED_IN handler:", error);
            // Don't set user to null if we have a session - try to use session data
            if (session?.user && isMounted) {
              const fallbackUser = {
                id: session.user.id,
                email: session.user.email!,
                name: session.user.user_metadata?.full_name || session.user.email!.split("@")[0],
                role: session.user.user_metadata?.role || "customer",
                isEmailVerified: session.user.email_confirmed_at !== null,
                createdAt: session.user.created_at,
              };
              console.log("Using fallback user after error:", fallbackUser);
              setUser(fallbackUser);
              // Store in localStorage as backup
              if (typeof window !== "undefined") {
                localStorage.setItem("kanyiji_auth_user", JSON.stringify(fallbackUser));
              }
            } else if (isMounted) {
              setUser(null);
            }
            setIsLoading(false);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          if (isMounted) {
            setUser(null);
            // Clear localStorage backup
            if (typeof window !== "undefined") {
              localStorage.removeItem("kanyiji_auth_user");
            }
            // Invalidate React Query cache to clear current user data
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            setIsLoading(false);
          }
        } else if (event === "TOKEN_REFRESHED") {
          // Handle token refresh - update user if session exists
          if (session?.user) {
            try {
              const currentUser = await supabaseAuthService.getCurrentUser();
              if (isMounted) {
                setUser(currentUser);
                setIsLoading(false);
              }
            } catch (error) {
              console.error("Error refreshing user after token refresh:", error);
              if (isMounted) {
                setIsLoading(false);
              }
            }
          }
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fix Bug #1: Reset loading state when window is closed or loses focus
  // This prevents the continuous spinning spinner when the web window is exited
  // Cross-platform compatible: Works on Windows, macOS, and Linux
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const handleBeforeUnload = () => {
      // Reset loading state when window is about to close
      // Works on Windows (Edge, Chrome, Firefox) and all modern browsers
      setIsLoading(false);
    };

    const handleVisibilityChange = () => {
      // Reset loading state when page becomes hidden (tab switch, window close, minimize, etc.)
      // Most reliable cross-platform event - works consistently on Windows
      if (document.visibilityState === 'hidden' || document.hidden) {
        setIsLoading(false);
      }
    };

    const handleWindowBlur = () => {
      // Reset loading state when window loses focus
      // Backup handler for Windows - may not fire in all scenarios (e.g., Alt+F4)
      setIsLoading(false);
    };

    // Add event listeners with error handling for Windows compatibility
    try {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
    } catch (error) {
      console.warn('Error adding event listeners for Bug #1 fix:', error);
    }

    // Cleanup
    return () => {
      try {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
      } catch (error) {
        console.warn('Error removing event listeners for Bug #1 fix:', error);
      }
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await supabaseAuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 AuthContext: Starting login for:", email);
      setIsLoading(true);
      const response = await supabaseAuthService.login({ email, password });

      console.log("📥 AuthContext: Login response:", {
        success: response.success,
        hasUser: !!response.user,
        error: response.error,
      });

      if (response.success && response.user) {
        console.log("✅ AuthContext: Login successful, setting user");
        setUser(response.user);
        // Invalidate React Query cache to trigger refetch of current user
        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        toast.success("Login successful!");
        
        // Verify session is persisted and store backup
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          console.log("✅ Session persisted successfully");
          // Store user in localStorage as backup
          if (typeof window !== "undefined") {
            localStorage.setItem("kanyiji_auth_user", JSON.stringify(response.user));
          }
        } else {
          console.warn("⚠️ Session not found after login, attempting to restore...");
        }
        
        return true;
      } else {
        console.error("❌ AuthContext: Login failed:", response.error);
        toast.error(response.error || "Login failed");
        return false;
      }
    } catch (error: any) {
      console.error("❌ AuthContext: Login exception:", error);
      toast.error(error?.message || "An unexpected error occurred");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    userData: any
  ): Promise<{ success: boolean; requiresVerification?: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const response = await supabaseAuthService.register(userData);

      if (!response.success) {
        return { success: false, error: response.error };
      }

      if (response.success && response.user) {
        // Check if email verification is required
        if (response.requiresVerification) {
          toast.success(
            response.message ||
              "Please check your email to verify your account."
          );
          // Redirect to verification page
          window.location.href = `/verify-email?email=${encodeURIComponent(
            userData.email
          )}`;
          return { success: true, requiresVerification: true };
        }

        // Wait a bit for the session to be fully established
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Force a session refresh
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Session after registration:", session);

        if (session) {
          // Get fresh user data
          const currentUser = await supabaseAuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            toast.success("Account created successfully! You are now logged in.");
            // Force page reload to ensure all data is fresh
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            setUser(response.user);
            toast.success("Account created successfully! You are now logged in.");
            // Force page reload to ensure all data is fresh
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        } else {
          // If no session, try to get the user directly
          const currentUser = await supabaseAuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            toast.success(
              "Account created successfully! You are now logged in."
            );
            // Force page reload to ensure all data is fresh
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } else {
            setUser(response.user);
            toast.success(
              "Account created successfully! Please refresh the page to log in."
            );
            // Force page reload
            setTimeout(() => {
              window.location.reload();
            }, 500);
          }
        }
        return { success: true, requiresVerification: false };
      } else {
        const errorMessage = response.error || "Registration failed";
        toast.error(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error?.message || "An unexpected error occurred";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("AuthContext logout called");
      setIsLoading(true);
      const response = await supabaseAuthService.logout();
      console.log("Supabase logout response:", response);

      if (response.success) {
        console.log("Logout successful - clearing user and redirecting");
        setUser(null);
        // Clear localStorage backup
        if (typeof window !== "undefined") {
          localStorage.removeItem("kanyiji_auth_user");
        }
        // Clear loading state before redirect to prevent spinner from staying
        setIsLoading(false);
        toast.success("Logged out successfully");
        // Use window.location for a full page reload to ensure clean state
        // This prevents the loading spinner from getting stuck
        window.location.href = "/";
      } else {
        console.log("Logout failed:", response.error);
        toast.error(response.error || "Logout failed");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    await checkAuthStatus();
  };

  // Manual session refresh
  const refreshSession = async (): Promise<void> => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Session refresh error:", error);
        return;
      }

      if (session) {
        const currentUser = await supabaseAuthService.getCurrentUser();
        setUser(currentUser);
        console.log("Session refreshed, user:", currentUser);
      } else {
        setUser(null);
        console.log("No session found during refresh");
      }
    } catch (error) {
      console.error("Session refresh failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isConfigValid,
    login,
    register,
    logout,
    refreshUser,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
