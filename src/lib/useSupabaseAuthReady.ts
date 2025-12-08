import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useSupabaseAuthReady() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1️⃣ Check immediately on mount
    supabase.auth
      .getSession()
      .then(({ data: { session }, error }) => {
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
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { user, authLoading };
}
