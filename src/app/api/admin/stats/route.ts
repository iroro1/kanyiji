import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkAdminAccess() {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore cookie errors
        }
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, adminSupabase: null };
  }

  // Check admin role using service role key to bypass RLS
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { authorized: false, adminSupabase: null };
  }

  return { authorized: true, adminSupabase };
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Get stats in parallel
    const [
      { count: totalUsers },
      { count: totalVendors },
      { count: pendingVendors },
      { count: totalProducts },
      { count: pendingProducts },
      { count: totalOrders },
      { count: pendingOrders },
      { data: revenueData },
    ] = await Promise.all([
      adminSupabase.from("profiles").select("*", { count: "exact", head: true }),
      adminSupabase.from("vendors").select("*", { count: "exact", head: true }),
      adminSupabase
        .from("vendors")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      adminSupabase.from("products").select("*", { count: "exact", head: true }),
      adminSupabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("status", "draft"),
      adminSupabase.from("orders").select("*", { count: "exact", head: true }),
      adminSupabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      adminSupabase
        .from("orders")
        .select("total_amount")
        .eq("status", "delivered"),
    ]);

    // Calculate revenue
    const totalRevenue =
      revenueData?.reduce((sum, order: any) => sum + parseFloat(order.total_amount || "0"), 0) || 0;

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        totalVendors: totalVendors || 0,
        pendingVendors: pendingVendors || 0,
        totalProducts: totalProducts || 0,
        pendingProducts: pendingProducts || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        totalRevenue: totalRevenue || 0,
      },
    });
  } catch (error: any) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

