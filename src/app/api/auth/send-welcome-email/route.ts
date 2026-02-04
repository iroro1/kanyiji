import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeEmail } from "@/services/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, fullName } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    try {
      await sendWelcomeEmail({
        email: email.toLowerCase(),
        fullName,
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

