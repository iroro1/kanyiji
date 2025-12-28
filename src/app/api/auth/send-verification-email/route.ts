import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendVerificationEmail } from "@/services/emailService";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Generate OTP token (6 digits)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Token expires in 10 minutes
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Get user profile to get full name
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    // Store token in database
    const { error: dbError } = await supabaseAdmin
      .from("email_otp_tokens")
      .insert({
        email: email.toLowerCase(),
        token,
        type: "verification",
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (dbError) {
      console.error("Database error storing OTP:", dbError);
      return NextResponse.json(
        { error: "Failed to generate verification token" },
        { status: 500 }
      );
    }

    // Send email via Resend
    try {
      await sendVerificationEmail({
        email: email.toLowerCase(),
        token,
        fullName: profile?.full_name,
      });
    } catch (emailError: any) {
      console.error("Resend email error:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error: any) {
    console.error("Send verification email API error:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}

