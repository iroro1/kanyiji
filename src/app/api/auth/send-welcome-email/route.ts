import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/services/emailService";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const getRedirectUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ||
  (typeof process.env.VERCEL_URL === "string"
    ? `https://${process.env.VERCEL_URL}`
    : "https://kanyiji.ng");

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, includeVerificationLink } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();
    let verificationLink: string | undefined;
    const siteUrl = getRedirectUrl();

    if (includeVerificationLink) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
          type: "signup",
          email: normalizedEmail,
          options: {
            redirectTo: `${siteUrl}/auth/callback`,
          },
        });
        if (!error && data?.properties?.action_link) {
          const raw = data.properties.action_link;
          // action_link can be relative (e.g. "auth/v1/verify?token=...") - make it absolute
          verificationLink = raw.startsWith("http")
            ? raw
            : `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")}/${raw.replace(/^\//, "")}`;
        }
        if (!verificationLink) {
          // Fallback: link to verify page where user can request resend
          verificationLink = `${siteUrl}/verify-email?email=${encodeURIComponent(normalizedEmail)}`;
        }
      } catch (linkError: any) {
        console.error("Failed to generate verification link:", linkError);
        verificationLink = `${siteUrl}/verify-email?email=${encodeURIComponent(normalizedEmail)}`;
      }
    }

    try {
      await sendWelcomeEmail({
        email: normalizedEmail,
        fullName,
        verificationLink,
      });
    } catch (emailError: any) {
      console.error("Resend email error:", emailError);
      return NextResponse.json(
        { error: "Failed to send welcome email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Welcome email sent",
    });
  } catch (error: any) {
    console.error("Send welcome email API error:", error);
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}

