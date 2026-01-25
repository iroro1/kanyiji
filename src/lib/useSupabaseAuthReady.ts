import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useSupabaseAuthReady() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // CRITICAL: Check localStorage first to prevent blocking on route/tab switches
  const getInitialUser = (): any => {
    if (typeof window === "undefined") return null;
    try {
      const storedUser = localStorage.getItem("kanyiji_auth_user");
      if (storedUser) {
        return JSON.parse(storedUser);
      }
    } catch (e) {
      console.error("Error reading initial user from localStorage:", e);
    }
    return null;
  };

  const [user, setUser] = useState<any>(getInitialUser());
  // CRITICAL: Start with false if we have cached user, true only if no cache
  // This prevents authLoading from blocking UI on route/tab switches
  const [authLoading, setAuthLoading] = useState(!getInitialUser());

  useEffect(() => {
    let isMounted = true;
    const SAFETY_TIMEOUT_MS = 12_000; // stop blocking after 12s if getSession hangs

    // If we have cached user, verify session but don't block UI
    const cachedUser = getInitialUser();
    if (cachedUser && isMounted) {
      setAuthLoading(false); // Don't block UI while verifying
    }

    const stopLoading = () => {
      if (isMounted) setAuthLoading(false);
    };

    const timeoutId = setTimeout(stopLoading, SAFETY_TIMEOUT_MS);

    // 1️⃣ Check immediately on mount
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(timeoutId);
        if (!isMounted) return;

        if (error) {
          console.error("Error getting session:", error);
          setAuthLoading(false);
          return;
        }

        setUser(session?.user ?? null);
        setAuthLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.error("Error in getSession:", error);
        if (isMounted) {
          setAuthLoading(false);
        }
      });

    // 2️⃣ Listen for future auth changes (login/logout)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    // 3️⃣ Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { user, authLoading };
}
