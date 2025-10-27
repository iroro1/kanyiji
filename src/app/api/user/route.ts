import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(req: NextRequest) {
  try {
    const access_token = req.cookies.get("sb-access-token")?.value;

    if (!access_token) {
      return NextResponse.json(
        { user: null, error: "No access token found" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${access_token}` } },
    });

    const { data, error } = await supabase.auth.getUser(access_token);

    if (error) {
      return NextResponse.json(
        { user: null, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({ user: data.user }, { status: 200 });
  } catch (err: any) {
    console.error("Get user error:", err);
    return NextResponse.json(
      { user: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
