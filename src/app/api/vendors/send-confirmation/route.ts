import { NextRequest, NextResponse } from "next/server";
import { sendVendorConfirmationEmail } from "@/services/emailService";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, businessName, userId } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!businessName) {
      return NextResponse.json(
        { error: "Business name is required" },
        { status: 400 }
      );
    }

    // Get user's full name from profile
    let fullName: string | undefined;
    if (userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();
      
      fullName = profile?.full_name || undefined;
    }

    // Send confirmation email via Resend
    try {
      await sendVendorConfirmationEmail({
        email: email.toLowerCase(),
        businessName,
        fullName,
      });
    } catch (emailError: any) {
      console.error("Resend email error:", emailError);
      // Don't fail the request if email fails - registration was successful
      // Just log the error
      return NextResponse.json({
        success: true,
        message: "Vendor registration successful, but confirmation email failed to send",
        emailSent: false,
        error: emailError.message,
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent successfully",
      emailSent: true,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Send vendor confirmation email API error:", error);
    return NextResponse.json(
      { error: "Failed to send confirmation email" },
      { status: 500 }
    );
  }
}

