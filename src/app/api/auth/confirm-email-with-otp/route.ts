import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Verifies the custom OTP (from email_otp_tokens), marks it used,
 * and confirms the user's email in Supabase Auth so they can sign in.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, token } = await req.json();

    if (!email || !token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Verify token from email_otp_tokens (type verification)
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from("email_otp_tokens")
      .select("id, email")
      .eq("email", normalizedEmail)
      .eq("token", token.trim())
      .eq("type", "verification")
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from("email_otp_tokens")
      .update({ used: true })
      .eq("id", tokenRecord.id);

    // 2. Find auth user by email (admin listUsers and filter)
    const {
      data: { users },
      error: listError,
    } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

    if (listError) {
      console.error("List users error:", listError);
      return NextResponse.json(
        { error: "Failed to confirm email" },
        { status: 500 }
      );
    }

    const authUser = users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );

    if (!authUser) {
      return NextResponse.json(
        { error: "No account found for this email" },
        { status: 404 }
      );
    }

    // 3. Confirm email in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      { email_confirm: true }
    );

    if (updateError) {
      console.error("Update user email_confirm error:", updateError);
      return NextResponse.json(
        { error: "Failed to confirm email" },
        { status: 500 }
      );
    }

    // 4. Update profile email_verified if profiles table exists
    await supabaseAdmin
      .from("profiles")
      .update({
        email_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id);

    return NextResponse.json({
      success: true,
      message: "Email verified. You can now sign in.",
    });
  } catch (error: any) {
    console.error("Confirm email with OTP API error:", error);
    return NextResponse.json(
      { error: "Failed to verify" },
      { status: 500 }
    );
  }
}
