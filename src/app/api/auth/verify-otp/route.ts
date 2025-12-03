import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { email, token, type } = await req.json();

    if (!email || !token || !type) {
      return NextResponse.json(
        { error: "Email, token, and type are required" },
        { status: 400 }
      );
    }

    if (!["verification", "password_reset"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid token type" },
        { status: 400 }
      );
    }

    // Verify token using database function
    const { data, error } = await supabaseAdmin.rpc("verify_email_otp", {
      p_email: email.toLowerCase(),
      p_token: token,
      p_type: type,
    });

    if (error) {
      console.error("OTP verification error:", error);
      // Fallback to manual verification if function doesn't exist
      return await manualVerifyOTP(email.toLowerCase(), token, type);
    }

    if (!data.valid) {
      return NextResponse.json(
        { error: data.error || "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      email: data.email,
      type: data.type,
    });
  } catch (error: any) {
    console.error("Verify OTP API error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}

// Fallback manual verification
async function manualVerifyOTP(email: string, token: string, type: string) {
  try {
    const { data: tokenRecord, error } = await supabaseAdmin
      .from("email_otp_tokens")
      .select("*")
      .eq("email", email)
      .eq("token", token)
      .eq("type", type)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Mark token as used
    await supabaseAdmin
      .from("email_otp_tokens")
      .update({ used: true })
      .eq("id", tokenRecord.id);

    return NextResponse.json({
      success: true,
      valid: true,
      email: tokenRecord.email,
      type: tokenRecord.type,
    });
  } catch (error: any) {
    console.error("Manual OTP verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify token" },
      { status: 500 }
    );
  }
}

