import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
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
      });
    }

    if (!authData.user) {
      return NextResponse.json({
        step: "authentication",
        success: false,
        error: "No user returned",
      });
    }

    // Step 2: Try to get profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json({
        step: "profile_fetch",
        success: false,
        authSuccess: true,
        userId: authData.user.id,
        error: profileError.message,
        code: profileError.code,
        hint: profileError.code === "PGRST116" 
          ? "Profile doesn't exist - might need to create it"
          : "Check RLS policies on profiles table",
      });
    }

    // Step 3: Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    return NextResponse.json({
      step: "complete",
      success: true,
      authSuccess: true,
      profileFound: !!profile,
      sessionExists: !!sessionData.session,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        hasProfile: !!profile,
        profileRole: profile?.role || null,
      },
      errors: {
        session: sessionError?.message || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        step: "exception",
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

