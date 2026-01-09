import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Step 1: Try to sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json({
        step: "authentication",
        success: false,
        error: authError.message,
        code: authError.status,
        details: {
          message: authError.message,
          status: authError.status,
        },
      });
    }

    if (!authData.user) {
      return NextResponse.json({
        step: "authentication",
        success: false,
        error: "No user returned",
      });
    }

    // Step 2: Check session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    // Step 3: Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    return NextResponse.json({
      step: "complete",
      success: true,
      authSuccess: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        emailConfirmed: !!authData.user.email_confirmed_at,
      },
      session: {
        exists: !!sessionData.session,
        error: sessionError?.message || null,
      },
      profile: {
        found: !!profile,
        error: profileError?.message || null,
        code: profileError?.code || null,
        data: profile ? {
          full_name: profile.full_name,
          role: profile.role,
        } : null,
      },
      hints: {
        profileMissing: profileError?.code === "PGRST116" 
          ? "Profile doesn't exist - will be created automatically"
          : null,
        rlsIssue: profileError && profileError.code !== "PGRST116"
          ? "Check RLS policies on profiles table"
          : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        step: "exception",
        success: false,
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST with { email, password } to test authentication",
    endpoint: "/api/auth/test-auth",
    method: "POST",
    example: {
      email: "your@email.com",
      password: "yourpassword",
    },
  });
}

