import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MARKETING_EMAIL = "kanyiji.dev@gmail.com";

export const SERVICE_KEY_REQUIRED =
  "SUPABASE_SERVICE_ROLE_KEY is required for marketing. Add it to .env.local.";

export async function getMarketingAuth(): Promise<{
  authorized: boolean;
  adminSupabase: ReturnType<typeof createClient> | null;
  serviceKeyMissing?: boolean;
}> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });

    const session = await supabase.auth.getUser();
    const user = session?.data?.user ?? null;
    const userError = session?.error;

    if (userError || !user) {
      return { authorized: false, adminSupabase: null };
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return { authorized: false, adminSupabase: null };
    }

    const allowed =
      profile.role === "marketing" || user.email === MARKETING_EMAIL;
    if (!allowed) {
      return { authorized: false, adminSupabase: null };
    }

    // Marketing API must use service role key to bypass RLS (group delete, add members, etc.)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set; marketing operations will fail.");
      return { authorized: true, adminSupabase: null, serviceKeyMissing: true };
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey);
    return { authorized: true, adminSupabase };
  } catch (e) {
    console.error("getMarketingAuth error:", e);
    return { authorized: false, adminSupabase: null };
  }
}
