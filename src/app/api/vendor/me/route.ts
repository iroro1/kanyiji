import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/vendor/me
 * Returns { isVendor: boolean } for the current session.
 * Uses service role to bypass RLS so vendor status is reliable for the navbar.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore
          }
        },
      },
    });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({ isVendor: false });
    }

    const userId = session.user.id;
    if (!supabaseServiceKey) {
      return NextResponse.json({ isVendor: false });
    }

    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: vendor, error } = await serviceSupabase
      .from("vendors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ isVendor: false });
    }

    return NextResponse.json({ isVendor: !!vendor });
  } catch {
    return NextResponse.json({ isVendor: false });
  }
}
