import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Configuration validated at build time

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "supabase.auth.token",
    // Remove PKCE flow - it may cause issues in production
    // flowType: "pkce",
  },
});

// Validate configuration
export const validateSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === 'undefined') {
      console.warn("Missing required Supabase environment variables");
    } else {
      console.error("❌ Missing Supabase environment variables:");
      console.error("NEXT_PUBLIC_SUPABASE_URL:", supabaseUrl ? "✅ Set" : "❌ Missing");
      console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅ Set" : "❌ Missing");
    }
    return false;
  }
  return true;
};
