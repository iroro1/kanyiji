import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseServiceKey && createClient(supabaseUrl, supabaseServiceKey);

async function getAuthUser(req: NextRequest): Promise<{
  id: string;
  email: string;
  user_metadata?: { full_name?: string; role?: string; phone?: string };
} | null> {
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
  } = await supabase.auth.getSession();

  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email ?? "",
      user_metadata: session.user.user_metadata,
    };
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (token) {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error } = await client.auth.getUser(token);
    if (!error && user?.id) {
      return {
        id: user.id,
        email: user.email ?? "",
        user_metadata: user.user_metadata,
      };
    }
  }

  return null;
}

/**
 * POST /api/ensure-profile
 * Ensures the current user has a row in public.profiles (fixes wishlist FK errors).
 * Call with credentials (cookies or Authorization: Bearer). Idempotent.
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    const authUser = await getAuthUser(request);
    if (!authUser?.id || !authUser.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: existing } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ensured: true, created: false });
    }

    const fullName =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email.split("@")[0];
    const role = (authUser.user_metadata?.role as string) || "customer";
    const phone = authUser.user_metadata?.phone ?? "";

    const { error } = await supabaseAdmin.from("profiles").insert({
      id: authUser.id,
      email: authUser.email,
      full_name: fullName,
      role,
      phone,
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "Nigeria",
      email_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("ensure-profile insert error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ensured: true, created: true });
  } catch (error) {
    console.error("ensure-profile API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
