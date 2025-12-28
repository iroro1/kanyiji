import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPasswordResetEmail } from "@/services/emailService";

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

    // Check if user exists (but don't reveal if they don't - security best practice)
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    // Always send success response to prevent email enumeration
    // But only actually send email if user exists
    if (profile) {
      // Generate OTP token (6 digits)
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Token expires in 1 hour
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Store token in database
      const { error: dbError } = await supabaseAdmin
        .from("email_otp_tokens")
        .insert({
          email: email.toLowerCase(),
          token,
          type: "password_reset",
          expires_at: expiresAt.toISOString(),
          used: false,
        });

      if (!dbError) {
        // Send email via Resend
        try {
          await sendPasswordResetEmail({
            email: email.toLowerCase(),
            token,
            fullName: profile.full_name,
          });
        } catch (emailError: any) {
          console.error("Resend email error:", emailError);
          // Don't reveal error to user
        }
      }
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset email has been sent",
    });
  } catch (error: any) {
    console.error("Send password reset email API error:", error);
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists, a password reset email has been sent",
    });
  }
}

