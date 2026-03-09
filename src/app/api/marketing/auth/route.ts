import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const MARKETING_EMAIL = "kanyiji.dev@gmail.com";

function isMarketingAllowed(profile: { role?: string } | null, email: string): boolean {
  if (!profile) return false;
  return profile.role === "marketing" || email === MARKETING_EMAIL;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

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
            // ignore
          }
        },
      },
    });

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
    );

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (!isMarketingAllowed(profile, authData.user.email ?? "")) {
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: "Access denied. Marketing access only." },
        { status: 403 }
      );
    }

    const allCookies = cookieStore.getAll();
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      },
    });

    allCookies.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
    });

    return response;
  } catch (error: unknown) {
    console.error("Marketing login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
            // ignore
          }
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
    );
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || !isMarketingAllowed(profile, user.email ?? "")) {
      return NextResponse.json(
        { authenticated: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      },
    });
  } catch (error: unknown) {
    console.error("Marketing auth check error:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Marketing logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
