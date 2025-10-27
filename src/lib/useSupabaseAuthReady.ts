import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export function useSupabaseAuthReady() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // 1️⃣ Check immediately on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    // 2️⃣ Listen for future auth changes (login/logout)
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setAuthLoading(false);
      }
    );

    // 3️⃣ Cleanup
    return () => subscription.subscription.unsubscribe();
  }, []);

  return { user, authLoading };
}
