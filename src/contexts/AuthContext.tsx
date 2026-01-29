"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseAuthService, AuthUser } from "@/services/supabaseAuthService";
import { toast } from "react-hot-toast";
import { validateSupabaseConfig, supabase } from "@/lib/supabase";
import { SessionStorage } from "@/utils/sessionStorage";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isConfigValid: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requiresMFA?: boolean; mfaFactorId?: string; error?: string }>;
  verifyMFA: (code: string, factorId: string) => Promise<boolean>;
  register: (
    userData: any
  ) => Promise<{ success: boolean; requiresVerification?: boolean; error?: string }>;
  logout: () => void;
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
  // CRITICAL: kanyiji_auth_user (localStorage), kanyiji_currentUser (session), kanyiji_profile_data (session) = auth data. If any is present, treat user as logged in.
  const getInitialUser = (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    try {
      const fromLocal = localStorage.getItem("kanyiji_auth_user");
      if (fromLocal) {
        return JSON.parse(fromLocal);
      }
      const fromSession = SessionStorage.getWithExpiry<AuthUser>("currentUser");
      if (fromSession && fromSession.id && fromSession.email) {
        return fromSession;
      }
      const profileDataRaw = sessionStorage.getItem("kanyiji_profile_data");
      if (profileDataRaw) {
        const parsed = JSON.parse(profileDataRaw) as { userId?: string; profileData?: Record<string, unknown> };
        const uid = parsed?.userId;
        if (uid) {
          const p = parsed?.profileData as Record<string, unknown> | undefined;
          return {
            id: uid,
            email: (p?.email as string) || "",
            name: (p?.full_name as string) || (p?.firstName as string) || "User",
            role: (p?.role as "customer" | "vendor" | "admin") || "customer",
            isEmailVerified: false,
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.error("Error reading initial user:", e);
    }
    return null;
  };

  const [user, setUser] = useState<AuthUser | null>(getInitialUser());
  // CRITICAL: Start with false if we have cached user, true only if no cache
  const [isLoading, setIsLoading] = useState(!getInitialUser());
  const [isConfigValid, setIsConfigValid] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    let isMounted = true;

    // First validate configuration
    const configValid = validateSupabaseConfig();
    setIsConfigValid(configValid);

    console.log(configValid);
    console.log("after supabase validation");

    if (configValid) {
      const INITIAL_LOAD_SAFETY_MS = 8_000; // stop blocking if getSession hangs
      const GET_SESSION_RACE_MS = 7_500;  // race timeout; on timeout treat as no session (no user-facing error)
      const safetyTimeoutId = setTimeout(() => {
        if (isMounted) {
          setIsLoading(false);
          setUser(null);
        }
      }, INITIAL_LOAD_SAFETY_MS);

      const checkInitialSession = async () => {
        try {
          // Restore from kanyiji_auth_user / kanyiji_currentUser / kanyiji_profile_data immediately so UI never shows "Please Sign In" when we have the data
          const cachedUser = getInitialUser();
          if (cachedUser && isMounted) {
            setUser(cachedUser);
            setIsLoading(false);
            if (typeof window !== "undefined") {
              localStorage.setItem("kanyiji_auth_user", JSON.stringify(cachedUser));
            }
          }

          if (typeof window !== "undefined") {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          const {
            data: { session },
            error: sessionError,
          } = await Promise.race([
            supabase.auth.getSession(),
            new Promise<{ data: { session: null }; error: null }>((resolve) =>
              setTimeout(() => resolve({ data: { session: null }, error: null }), GET_SESSION_RACE_MS)
            ),
          ]).then(
            (r) => r,
            () => ({ data: { session: null }, error: null }) // timeout or throw → treat as no session, never surface message
          );

          if (sessionError) {
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
            // Restore from localStorage, kanyiji_currentUser, or kanyiji_profile_data — if any present, user should be logged in
            if (typeof window !== "undefined" && isMounted) {
              try {
                let parsedUser: AuthUser | null = null;
                const fromLocal = localStorage.getItem("kanyiji_auth_user");
                if (fromLocal) {
                  parsedUser = JSON.parse(fromLocal);
                }
                if (!parsedUser) {
                  const fromSession = SessionStorage.getWithExpiry<AuthUser>("currentUser");
                  if (fromSession && fromSession.id) {
                    parsedUser = fromSession;
                  }
                }
                if (!parsedUser) {
                  const profileDataRaw = sessionStorage.getItem("kanyiji_profile_data");
                  if (profileDataRaw) {
                    const parsed = JSON.parse(profileDataRaw) as { userId?: string; profileData?: Record<string, unknown> };
                    const uid = parsed?.userId;
                    if (uid) {
                      const p = parsed?.profileData as Record<string, unknown> | undefined;
                      parsedUser = {
                        id: uid,
                        email: (p?.email as string) || "",
                        name: (p?.full_name as string) || (p?.firstName as string) || "User",
                        role: (p?.role as "customer" | "vendor" | "admin") || "customer",
                        isEmailVerified: false,
                        createdAt: new Date().toISOString(),
                      };
                    }
                  }
                }
                if (parsedUser) {
                  console.log("Found user in backup (local or session), restoring...");
                  const { data: { session: verifySession } } = await supabase.auth.getSession();
                  if (verifySession) {
                    console.log("Session verified, restoring from backup");
                  } else {
                    console.log("Restoring user from backup (getSession was null)");
                  }
                  setUser(parsedUser);
                  setIsLoading(false);
                  if (typeof window !== "undefined" && !fromLocal) {
                    localStorage.setItem("kanyiji_auth_user", JSON.stringify(parsedUser));
                  }
                  supabase.auth.getSession().then(({ data: { session: retrySession } }) => {
                    if (isMounted && retrySession) {
                      supabaseAuthService.getCurrentUser().then((u) => {
                        if (isMounted && u) {
                          setUser(u);
                          if (typeof window !== "undefined") {
                            localStorage.setItem("kanyiji_auth_user", JSON.stringify(u));
                          }
                        }
                      }).catch(() => {});
                    }
                  }).catch(() => {});
                  return;
                }
              } catch (e) {
                console.error("Error checking user backup:", e);
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

        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session?.user) {
          // Use session immediately — do not await getCurrentUser(); it can hang (getSession inside).
          let role: "customer" | "vendor" | "admin" =
            (session.user.user_metadata?.role as "customer" | "vendor" | "admin") || "customer";
          // Persist vendor/admin role: don't downgrade when session has no role but we previously stored one
          if (typeof window !== "undefined" && role === "customer") {
            try {
              const stored = localStorage.getItem("kanyiji_auth_user");
              const existing = stored ? JSON.parse(stored) : null;
              if (existing?.id === session.user.id && (existing?.role === "vendor" || existing?.role === "admin")) {
                role = existing.role;
              }
            } catch (_) {}
          }
          const userFromSession = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email!.split("@")[0],
            role,
            isEmailVerified: session.user.email_confirmed_at !== null,
            createdAt: session.user.created_at || new Date().toISOString(),
          };
          if (isMounted) {
            setUser(userFromSession);
            SessionStorage.remove("currentUser");
            setIsLoading(false);
            if (typeof window !== "undefined") {
              localStorage.setItem("kanyiji_auth_user", JSON.stringify(userFromSession));
            }
          }
          // Refresh from profile in background so role/name stay in sync; persist when we get it
          supabaseAuthService.getCurrentUser().then((currentUser) => {
            if (isMounted && currentUser) {
              setUser(currentUser);
              if (typeof window !== "undefined") {
                localStorage.setItem("kanyiji_auth_user", JSON.stringify(currentUser));
              }
            }
          }).catch(() => {});
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          if (isMounted) {
            setUser(null);
            // Clear localStorage backup
            if (typeof window !== "undefined") {
              localStorage.removeItem("kanyiji_auth_user");
            }
            // Clear sessionStorage cache to clear current user data
            SessionStorage.remove("currentUser");
            setIsLoading(false);
          }
        } else if (event === "TOKEN_REFRESHED") {
          // Handle token refresh - update user if session exists and persist
          if (session?.user) {
            try {
              const currentUser = await supabaseAuthService.getCurrentUser();
              if (isMounted && currentUser) {
                setUser(currentUser);
                setIsLoading(false);
                if (typeof window !== "undefined") {
                  localStorage.setItem("kanyiji_auth_user", JSON.stringify(currentUser));
                }
              } else if (isMounted) {
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
        clearTimeout(safetyTimeoutId);
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  // When user is null but session/local has kanyiji_currentUser or kanyiji_profile_data, rehydrate so we never show "Please Sign In" when the data exists (e.g. written by a child after mount)
  useEffect(() => {
    if (user !== null || typeof window === "undefined") return;
    const t = setTimeout(() => {
      const u = getInitialUser();
      if (u) {
        setUser(u);
        setIsLoading(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("kanyiji_auth_user", JSON.stringify(u));
        }
      }
    }, 400);
    return () => clearTimeout(t);
  }, [user]);

  // Fix Bug #1: Reset loading state when window is closed or loses focus
  // This prevents the continuous spinning spinner when the web window is exited
  // Cross-platform compatible: Works on Windows, macOS, and Linux
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const getCachedUser = () => {
      try {
        const storedUser = localStorage.getItem("kanyiji_auth_user");
        return storedUser ? JSON.parse(storedUser) : null;
      } catch (error) {
        console.warn("Error reading cached user:", error);
        return null;
      }
    };

    const forceStopLoadingIfPossible = () => {
      const cachedUser = getCachedUser();
      if (user || cachedUser) {
        setIsLoading(false);
      }
    };

    const handleBeforeUnload = () => {
      // Reset loading state when window is about to close
      setIsLoading(false);
    };

    const handleVisibilityChange = () => {
      // Stop loading both when hidden and when visible again
      if (document.visibilityState === 'hidden' || document.hidden) {
        setIsLoading(false);
        return;
      }
      // When tab becomes visible, ensure loader isn't stuck
      forceStopLoadingIfPossible();
    };

    const handleWindowBlur = () => {
      // Reset loading state when window loses focus
      setIsLoading(false);
    };

    const handleWindowFocus = () => {
      // When window gains focus, ensure loader isn't stuck
      forceStopLoadingIfPossible();
    };

    // Add event listeners with error handling for Windows compatibility
    try {
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('blur', handleWindowBlur);
      window.addEventListener('focus', handleWindowFocus);
      window.addEventListener('pageshow', handleWindowFocus);
    } catch (error) {
      console.warn('Error adding event listeners for Bug #1 fix:', error);
    }

    // Cleanup
    return () => {
      try {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        window.removeEventListener('blur', handleWindowBlur);
        window.removeEventListener('focus', handleWindowFocus);
        window.removeEventListener('pageshow', handleWindowFocus);
      } catch (error) {
        console.warn('Error removing event listeners for Bug #1 fix:', error);
      }
    };
  }, [user]);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await supabaseAuthService.getCurrentUser();
      setUser(currentUser);
      if (currentUser && typeof window !== "undefined") {
        localStorage.setItem("kanyiji_auth_user", JSON.stringify(currentUser));
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; requiresMFA?: boolean; mfaChallenge?: any; error?: string }> => {
    try {
      console.log("🔐 AuthContext: Starting login for:", email);
      setIsLoading(true);
      const response = await supabaseAuthService.login({ email, password });

      console.log("📥 AuthContext: Login response:", {
        success: response.success,
        hasUser: !!response.user,
        requiresMFA: response.requiresMFA,
        error: response.error,
      });

      // Check if MFA is required
      if (response.requiresMFA) {
        console.log("⚠️ MFA required for login");
        setIsLoading(false);
        return {
          success: false,
          requiresMFA: true,
          mfaChallenge: response.mfaChallenge,
          error: response.error,
        };
      }

      if (response.success && response.user) {
        console.log("✅ AuthContext: Login successful, setting user");
        setUser(response.user);
        SessionStorage.remove("currentUser");
        if (typeof window !== "undefined") {
          localStorage.setItem("kanyiji_auth_user", JSON.stringify(response.user));
        }
        toast.success("Login successful!");
        // Do not await getSession() — it can hang; we already have the user from the login response
        return { success: true };
      } else {
        console.error("❌ AuthContext: Login failed:", response.error);
        toast.error(response.error || "Login failed");
        return { success: false, error: response.error };
      }
    } catch (error: any) {
      console.error("❌ AuthContext: Login exception:", error);
      toast.error(error?.message || "An unexpected error occurred");
      return { success: false, error: error?.message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyMFA = async (code: string, factorId: string): Promise<boolean> => {
    try {
      console.log("🔐 AuthContext: Verifying MFA code...");
      setIsLoading(true);
      const response = await supabaseAuthService.verifyMFA(code, factorId);

      if (response.success && response.user) {
        console.log("✅ AuthContext: MFA verification successful, setting user");
        setUser(response.user);
        SessionStorage.remove("currentUser");
        if (typeof window !== "undefined") {
          localStorage.setItem("kanyiji_auth_user", JSON.stringify(response.user));
        }
        toast.success("Login successful!");
        return true;
      } else {
        console.error("❌ AuthContext: MFA verification failed:", response.error);
        toast.error(response.error || "Invalid verification code");
        return false;
      }
    } catch (error: any) {
      console.error("❌ AuthContext: MFA verification exception:", error);
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

  const logout = (): void => {
    const userId = user?.id;

    // Fire-and-forget: try to sign out from Supabase (signOut() can hang)
    supabase.auth.signOut().catch(() => {});

    // Clear local state first
    setUser(null);
    setIsLoading(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("kanyiji_auth_user");
      // Clear Supabase session so reload doesn't restore auth (matches storageKey in lib/supabase.ts)
      localStorage.removeItem("supabase.auth.token");
      // Clear any other Supabase auth keys (e.g. sb-<project>-auth-token)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-") && key.includes("auth-token")) {
          localStorage.removeItem(key);
        }
      });
      SessionStorage.clear();
      sessionStorage.removeItem("kanyiji_profile_data");
      if (userId) {
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.includes(`vendorOrders_${userId}`) || key.includes(`userOrders_${userId}`)) {
            sessionStorage.removeItem(key);
          }
        });
      }
    }
    toast.success("Logged out successfully");
    // Defer redirect so it runs after React flushes; use replace for a hard navigation
    setTimeout(() => {
      window.location.replace("/");
    }, 0);
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
    verifyMFA,
    register,
    logout,
    refreshUser,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
