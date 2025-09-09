import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Debug configuration
console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key exists:", !!supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Validate configuration
export const validateSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Missing required Supabase environment variables");
    console.warn("URL:", supabaseUrl);
    console.warn("Key exists:", !!supabaseAnonKey);
    return false;
  }
  console.log("Supabase configuration is valid");
  return true;
};
