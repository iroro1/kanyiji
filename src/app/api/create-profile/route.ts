import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use service role key for server-side operations that bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

// Only create admin client if service key is available
const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if service role key is available
    if (!supabaseServiceKey || !supabaseAdmin) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    const { userId, email, fullName, role, phone, emailVerified } =
      await request.json();

    console.log("Creating profile with data:", {
      userId,
      email,
      fullName,
      role,
      phone,
      emailVerified,
    });

    if (!userId || !email || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create profile using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        role,
        phone: phone || "", // Use phone from request or empty string
        address: "", // Initialize address as empty string
        city: "", // Initialize city as empty string
        state: "", // Initialize state as empty string
        zip_code: "", // Initialize zip_code as empty string
        country: "Nigeria", // Default country
        email_verified: emailVerified || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Profile creation error:", error);
      return NextResponse.json(
        { error: `Failed to create profile: ${error.message}` },
        { status: 500 }
      );
    }

    console.log("Profile created successfully:", data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      {
        error: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
