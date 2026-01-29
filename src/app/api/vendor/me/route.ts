import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  // 1. Try cookie-based session (SSR / cookie auth)
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(_cookiesToSet) {},
    },
  });

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (!sessionError && session?.user?.id) {
    return session.user.id;
  }

  // 2. Fallback: Authorization Bearer (session in localStorage only, e.g. after Google sign-in)
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (token) {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await client.auth.getUser(token);
    if (!error && user?.id) return user.id;
  }

  return null;
}

/**
 * GET /api/vendor/me
 * Returns { isVendor: boolean } for the current session.
 * Supports cookie session or Authorization: Bearer <access_token> (for client-side session).
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ isVendor: false });
    }
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
