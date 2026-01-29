"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

const STUCK_FALLBACK_MS = 15_000;
const SET_SESSION_TIMEOUT_MS = 8_000;

const SUPABASE_STORAGE_KEY = "supabase.auth.token";

// Decode JWT payload (base64url) to get user info when setSession hangs (client-only)
function decodeJwtPayload(accessToken: string): { sub?: string; email?: string; exp?: number; user_metadata?: { full_name?: string; name?: string }; app_metadata?: { provider?: string } } | null {
  if (typeof atob === "undefined") return null;
  try {
    const parts = accessToken.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json) as { sub?: string; email?: string; exp?: number; user_metadata?: { full_name?: string; name?: string }; app_metadata?: { provider?: string } };
  } catch {
    return null;
  }
}

/** Persist session to Supabase storage so getSession() works after redirect (e.g. for 2FA). */
function persistSessionToSupabaseStorage(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  const payload = decodeJwtPayload(accessToken);
  if (!payload?.sub) return;
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = payload.exp ?? nowSec + 3600;
  const expiresIn = Math.max(1, exp - nowSec);
  const session = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    expires_at: exp,
    token_type: "bearer",
    user: {
      id: payload.sub,
      email: payload.email ?? "",
      app_metadata: payload.app_metadata ?? {},
      user_metadata: payload.user_metadata ?? {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
  try {
    window.localStorage.setItem(SUPABASE_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn("Failed to persist session to storage:", e);
  }
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stuck, setStuck] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaFactorId, setMfaFactorId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaVerifying, setMfaVerifying] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    const getHash = () => {
      if (typeof window === "undefined") return "";
      const href = window.location.href;
      const i = href.indexOf("#");
      return i >= 0 ? href.slice(i) : (window.location.hash || "");
    };

    const writeUserAndRedirect = (authUser: { id: string; email: string; name: string; role: "customer" | "vendor" | "admin"; isEmailVerified: boolean; createdAt: string }) => {
      if (typeof window === "undefined") return;
      doneRef.current = true;
      localStorage.setItem("kanyiji_auth_user", JSON.stringify(authUser));
      toast.success("Successfully signed in!");
      window.history.replaceState(null, "", window.location.pathname);
      window.location.href = "/";
    };

    /** If user has 2FA enabled (AAL2), return factorId so we show OTP; else return null and caller can redirect. */
    const checkAALAndGetMFAFactorId = async (): Promise<string | null> => {
      try {
        const { data: aalData, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalError || aalData?.nextLevel !== "aal2") return null;
        const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
        if (factorsError || !factorsData?.totp?.length) return null;
        return factorsData.totp[0].id;
      } catch {
        return null;
      }
    };

    const tryHashLogin = async (): Promise<boolean> => {
      const hash = getHash();
      if (!hash || !hash.includes("access_token")) return false;
      const hashStr = hash.substring(1);
      const getParam = (key: string): string | null => {
        const prefix = key + "=";
        const start = hashStr.indexOf(prefix);
        if (start === -1) return null;
        const valueStart = start + prefix.length;
        const end = hashStr.indexOf("&", valueStart);
        return end === -1 ? hashStr.slice(valueStart) : hashStr.slice(valueStart, end);
      };
      const accessToken = getParam("access_token");
      const refreshToken = getParam("refresh_token");
      if (!accessToken || !refreshToken) return false;

      const sessionPromise = supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: "Timeout" } }), SET_SESSION_TIMEOUT_MS)
      );
      const { data: sessionData, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]);

      if (sessionError) {
        if (sessionError.message === "Timeout") {
          // setSession hung – persist session to storage so Supabase has it (2FA, profile, etc.) then redirect
          persistSessionToSupabaseStorage(accessToken, refreshToken);
          const payload = decodeJwtPayload(accessToken);
          if (payload?.sub && typeof window !== "undefined") {
            const authUser = {
              id: payload.sub,
              email: payload.email ?? "",
              name: payload.user_metadata?.full_name ?? payload.user_metadata?.name ?? payload.email?.split("@")[0] ?? "User",
              role: "customer" as const,
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
            };
            writeUserAndRedirect(authUser);
            return true;
          }
        }
        console.error("Error setting session from hash:", sessionError);
        toast.error("Authentication failed. Please try again.");
        router.push("/");
        return true;
      }

      const user = sessionData?.session?.user;
      if (user && typeof window !== "undefined") {
        const factorId = await checkAALAndGetMFAFactorId();
        if (factorId) {
          setRequiresMFA(true);
          setMfaFactorId(factorId);
          setIsLoading(false);
          return true;
        }
        const authUser = {
          id: user.id,
          email: user.email ?? "",
          name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User",
          role: (user.user_metadata?.role as "customer" | "vendor" | "admin") ?? "customer",
          isEmailVerified: !!user.email_confirmed_at,
          createdAt: user.created_at ?? new Date().toISOString(),
        };
        localStorage.setItem("kanyiji_auth_user", JSON.stringify(authUser));
      }
      doneRef.current = true;
      toast.success("Successfully signed in!");
      window.history.replaceState(null, "", window.location.pathname);
      await new Promise((r) => setTimeout(r, 150));
      window.location.href = "/";
      return true;
    };

    const handleAuthCallback = async () => {
      if (doneRef.current) return;
      try {
        // Try hash login immediately (from href or location.hash)
        if (await tryHashLogin()) return;

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (code) {
          console.log("Processing OAuth code callback...");
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (doneRef.current) return;
            if (error) {
              const { data: sessionCheck } = await supabase.auth.getSession();
              if (sessionCheck?.session?.user) {
                doneRef.current = true;
                toast.success("Successfully signed in!");
                window.location.href = "/";
                return;
              }
              console.error("Error exchanging code for session:", error);
              toast.error(`Authentication failed: ${error.message || "Please try again."}`);
              router.push(`/?auth_error=${encodeURIComponent(error.message || "authentication_failed")}`);
              return;
            }

            if (data?.session) {
              const factorId = await checkAALAndGetMFAFactorId();
              if (factorId) {
                setRequiresMFA(true);
                setMfaFactorId(factorId);
                setIsLoading(false);
                return;
              }
              doneRef.current = true;
              console.log("Session created successfully from code");
              toast.success("Successfully signed in!");
              window.location.href = "/";
              return;
            }
            toast.error("Authentication failed: No session created");
            router.push("/?auth_error=no_session");
            return;
          } catch (err: any) {
            if (doneRef.current) return;
            const { data: sessionCheck } = await supabase.auth.getSession();
            if (sessionCheck?.session?.user) {
              doneRef.current = true;
              toast.success("Successfully signed in!");
              window.location.href = "/";
              return;
            }
            console.error("Exception during code exchange:", err);
            const msg = err?.message || "Unknown error";
            toast.error(`Authentication error: ${msg}`);
            router.push(`/?auth_error=${encodeURIComponent(msg)}`);
            return;
          }
        }

        // No code and no hash: maybe session was set by detectSessionInUrl
        const { data: existingSession } = await supabase.auth.getSession();
        if (existingSession?.session?.user) {
          const factorId = await checkAALAndGetMFAFactorId();
          if (factorId) {
            setRequiresMFA(true);
            setMfaFactorId(factorId);
            setIsLoading(false);
            return;
          }
          toast.success("Successfully signed in!");
          window.location.href = "/";
          return;
        }

        // Brief wait in case session is still being set
        await new Promise((resolve) => setTimeout(resolve, 800));

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed. Please try again.");
          router.push("/");
          return;
        }

        if (data.session) {
          const user = data.session.user;

          const factorId = await checkAALAndGetMFAFactorId();
          if (factorId) {
            setRequiresMFA(true);
            setMfaFactorId(factorId);
            setIsLoading(false);
            return;
          }
          
          // Check if this is a new user (created within the last 2 minutes)
          // This helps detect new Google OAuth signups
          const userCreatedAt = new Date(user.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();
          const isNewUser = timeDiff < 2 * 60 * 1000; // 2 minutes

          // Check if user signed up via Google OAuth
          const isGoogleUser = user.app_metadata?.provider === "google" || 
                               user.identities?.some((identity: any) => identity.provider === "google");

          // If it's a new user from Google OAuth, send welcome email
          if (isNewUser && isGoogleUser) {
            // Check if profile exists to avoid duplicate emails
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("id, created_at")
                .eq("id", user.id)
                .maybeSingle();
              
              // If profile was just created (within last 2 minutes) or doesn't exist yet, send welcome email
              const profileIsNew = !profile || (profile.created_at && 
                (now.getTime() - new Date(profile.created_at).getTime()) < 2 * 60 * 1000);
              
              if (profileIsNew) {
                // Send welcome email
                try {
                  const response = await fetch("/api/auth/send-welcome-email", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: user.email,
                      fullName: user.user_metadata?.full_name || 
                               user.user_metadata?.name ||
                               user.user_metadata?.display_name,
                    }),
                  });

                  if (response.ok) {
                    console.log("Welcome email sent to new Google user");
                  } else {
                    console.error("Failed to send welcome email");
                  }
                } catch (emailError) {
                  console.error("Error sending welcome email:", emailError);
                  // Don't block the auth flow if email fails
                }
              }
            } catch (profileError) {
              console.error("Error checking profile:", profileError);
              // If we can't check profile, still try to send welcome email for very new users
              if (timeDiff < 60 * 1000) { // Less than 1 minute old
                try {
                  await fetch("/api/auth/send-welcome-email", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: user.email,
                      fullName: user.user_metadata?.full_name || 
                               user.user_metadata?.name ||
                               user.user_metadata?.display_name,
                    }),
                  });
                } catch (emailError) {
                  console.error("Error sending welcome email:", emailError);
                }
              }
            }
          }

          // User is authenticated
          toast.success("Successfully signed in!");
          window.location.href = "/";
        } else {
          toast.error("Authentication failed. Please try again.");
          router.push("/");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Authentication failed. Please try again.");
        router.push("/");
      } finally {
        if (!doneRef.current) setIsLoading(false);
      }
    };

    handleAuthCallback();

    // Retry hash login on load and after short delays (hash may not be ready on first tick)
    const onLoadOrRetry = () => {
      if (doneRef.current) return;
      tryHashLogin();
    };
    if (typeof window !== "undefined") {
      if (document.readyState === "complete") {
        setTimeout(onLoadOrRetry, 100);
      } else {
        window.addEventListener("load", onLoadOrRetry);
      }
    }
    const retryId = setTimeout(onLoadOrRetry, 500);
    return () => {
      clearTimeout(retryId);
      if (typeof window !== "undefined") window.removeEventListener("load", onLoadOrRetry);
    };
  }, [router]);

  const handleMFAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaFactorId || !mfaCode.trim() || mfaCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit code from your authenticator app");
      return;
    }
    setMfaVerifying(true);
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaFactorId,
        code: mfaCode.trim(),
      });
      if (error) {
        toast.error(error.message || "Invalid code. Please try again.");
        setMfaVerifying(false);
        return;
      }
      if (data?.user) {
        doneRef.current = true;
        const user = data.user;
        const authUser = {
          id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email?.split("@")[0] ?? "User") as string,
          role: (user.user_metadata?.role as "customer" | "vendor" | "admin") ?? "customer",
          isEmailVerified: !!user.email_confirmed_at,
          createdAt: user.created_at ?? new Date().toISOString(),
        };
        localStorage.setItem("kanyiji_auth_user", JSON.stringify(authUser));
        toast.success("Successfully signed in!");
        window.history.replaceState(null, "", window.location.pathname);
        window.location.href = "/";
      } else {
        toast.error("Verification failed. Please try again.");
        setMfaVerifying(false);
      }
    } catch (err: any) {
      toast.error(err?.message || "Verification failed. Please try again.");
      setMfaVerifying(false);
    }
  };

  // If still loading after a while, show fallback so user isn't stuck
  useEffect(() => {
    const t = setTimeout(() => {
      setStuck((prev) => {
        if (prev) return prev;
        setIsLoading(false);
        return true;
      });
    }, STUCK_FALLBACK_MS);
    return () => clearTimeout(t);
  }, []);

  if (requiresMFA && mfaFactorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
            <p className="text-sm font-medium text-amber-800 text-center">
              Two-factor authentication is required. Enter the code from your authenticator app to continue.
            </p>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Enter verification code</h2>
          <form onSubmit={handleMFAVerify} className="space-y-4">
            <div>
              <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700 mb-2">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                id="mfaCode"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoFocus
                disabled={mfaVerifying}
              />
            </div>
            <button
              type="submit"
              disabled={mfaVerifying || mfaCode.trim().length !== 6}
              className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {mfaVerifying ? "Verifying..." : "Verify and continue"}
            </button>
          </form>
          <Link
            href="/"
            className="block mt-4 text-center text-sm text-gray-600 hover:text-gray-800"
          >
            ← Back to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (stuck) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-gray-700 mb-2">Sign-in is taking longer than usual.</p>
          <p className="text-gray-600 text-sm mb-6">
            You can go to the homepage and try signing in again.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto" />
          <p className="mt-4 text-gray-600">Completing sign in...</p>
          <p className="mt-2 text-sm text-gray-400">If this takes more than 15 seconds, you&apos;ll see a link to continue.</p>
        </div>
      </div>
    );
  }

  return null;
}
