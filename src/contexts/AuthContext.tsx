"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigValid, setIsConfigValid] = useState(true);
  const router = useRouter();

  // console.log("from auth context", isLoading);

  // Check authentication status on mount
  useEffect(() => {
    // setIsLoading(true);
    // First validate configuration
    const configValid = validateSupabaseConfig();
    setIsConfigValid(configValid);

    console.log(configValid);

    console.log("after supabase validation");

    if (configValid) {
      // Listen for auth state changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        console.log("Session exists:", !!session);
        console.log("User exists:", !!session?.user);

        if (event === "SIGNED_IN" && session) {
          try {
            console.log("User signed in, getting current user...");
            const currentUser = await supabaseAuthService.getCurrentUser();

            if (!currentUser)
              throw new Error("No current user found after sign-in");
            console.log("Current user:", currentUser);
            setUser(currentUser);
            setIsLoading(false);
          } catch (error) {
            console.log(error);
          }
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          setUser(null);
          setIsLoading(false);
        } else if (event === "INITIAL_SESSION") {
          console.log("Initial session check");
          setIsLoading(false);

          // Handle initial session restoration
          if (session) {
            console.log(
              "Session found on initial load, getting current user..."
            );

            try {
              const currentUser = await supabaseAuthService.getCurrentUser();
              console.log("Current user from initial session:", currentUser);
              setUser(currentUser);
              setIsLoading(false);
            } catch (error) {
              console.log(error);
            }
          } else {
            console.log("No session found on initial load");
            setIsLoading(false);
          }
          console.log("after user has been successfully validated");
          setIsLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsLoading(false);
    }

    setIsLoading(false);
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
      setIsLoading(true);
      const response = await supabaseAuthService.login({ email, password });

      if (response.success && response.user) {
        setUser(response.user);
        toast.success("Login successful!");
        return true;
      } else {
        toast.error(response.error || "Login failed");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred");
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
        toast.success("Logged out successfully");
        // Redirect to home page after successful logout
        router.push("/");
      } else {
        console.log("Logout failed:", response.error);
        toast.error(response.error || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An unexpected error occurred");
    } finally {
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
