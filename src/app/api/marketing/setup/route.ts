import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MARKETING_EMAIL = "kanyiji.dev@gmail.com";
const MARKETING_PASSWORD = "#AmazingMkt";

/**
 * POST /api/marketing/setup
 * Creates the marketing user (kanyiji.dev@gmail.com) in Supabase Auth + profiles
 * if they don't exist. Requires body.secret === MARKETING_SETUP_SECRET
 * (or in development, secret can be "dev" when NODE_ENV=development).
 */
export async function POST(req: NextRequest) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server not configured for setup" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const secret = body?.secret ?? "";
    const allowed =
      process.env.MARKETING_SETUP_SECRET &&
      secret === process.env.MARKETING_SETUP_SECRET;
    const devAllowed =
      process.env.NODE_ENV === "development" &&
      (secret === "dev" || secret === "development");

    if (!allowed && !devAllowed) {
      return NextResponse.json(
        { error: "Invalid or missing setup secret" },
        { status: 403 }
      );
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: listData } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const existingUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === MARKETING_EMAIL.toLowerCase()
    );

    if (existingUser) {
      const { error: updateError } = await admin.auth.admin.updateUserById(
        existingUser.id,
        { password: MARKETING_PASSWORD }
      );
      if (updateError) {
        console.error("Marketing setup password reset error:", updateError);
        return NextResponse.json(
          { error: updateError.message ?? "Failed to reset password" },
          { status: 400 }
        );
      }
      await admin
        .from("profiles")
        .update({
          role: "marketing",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id);
      return NextResponse.json({
        success: true,
        message: "Marketing user already existed. Password has been reset to #AmazingMkt. You can log in now at /marketing/login.",
      });
    }

    const { data: authData, error: authError } =
      await admin.auth.admin.createUser({
        email: MARKETING_EMAIL,
        password: MARKETING_PASSWORD,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      console.error("Marketing setup createUser error:", authError);
      return NextResponse.json(
        { error: authError?.message ?? "Failed to create user" },
        { status: 400 }
      );
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: authData.user.id,
      email: MARKETING_EMAIL,
      full_name: "Marketing",
      role: "marketing",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "Nigeria",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      console.error("Marketing setup profile error:", profileError);
      return NextResponse.json(
        { error: profileError.message ?? "Failed to create profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Marketing user created. You can now log in at /marketing with kanyiji.dev@gmail.com and your password.",
    });
  } catch (err: unknown) {
    console.error("Marketing setup error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
