import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
      supabaseUrlValue: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "MISSING",
    };

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing Supabase environment variables",
          envCheck,
        },
        { status: 500 }
      );
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.getSession();

    return NextResponse.json({
      success: true,
      envCheck,
      session: data.session ? "Session exists" : "No session",
      error: error ? error.message : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

