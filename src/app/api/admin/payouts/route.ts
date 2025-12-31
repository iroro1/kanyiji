import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkAdminAccess() {
  try {
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
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { isAdmin: false, userId: null };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { isAdmin: false, userId: null };
    }

    // Check if user is admin
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "admin") {
      return { isAdmin: false, userId: null };
    }

    return { isAdmin: true, userId: user.id };
  } catch (error) {
    console.error("Error checking admin access:", error);
    return { isAdmin: false, userId: null };
  }
}

// GET - Fetch all payout requests, payout history, and vendor earnings
export async function GET(req: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAccess();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const vendorId = searchParams.get("vendor_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build query for payouts
    let payoutsQuery = adminSupabase
      .from("vendor_payouts")
      .select(`
        *,
        vendors (
          id,
          business_name,
          user_id,
          profiles (
            id,
            full_name,
            email
          )
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      payoutsQuery = payoutsQuery.eq("status", status);
    }

    if (vendorId) {
      payoutsQuery = payoutsQuery.eq("vendor_id", vendorId);
    }

    const { data: payouts, error: payoutsError } = await payoutsQuery;

    if (payoutsError) {
      console.error("Error fetching payouts:", payoutsError);
      return NextResponse.json(
        { error: "Failed to fetch payouts", details: payoutsError.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = adminSupabase
      .from("vendor_payouts")
      .select("*", { count: "exact", head: true });

    if (status) {
      countQuery = countQuery.eq("status", status);
    }

    if (vendorId) {
      countQuery = countQuery.eq("vendor_id", vendorId);
    }

    const { count, error: countError } = await countQuery;

    // Fetch vendor earnings summary
    const { data: earnings, error: earningsError } = await adminSupabase
      .from("vendor_earnings")
      .select("vendor_id, status, net_amount")
      .in("status", ["pending", "available"]);

    if (earningsError) {
      console.error("Error fetching earnings:", earningsError);
    }

    // Calculate earnings by vendor
    const earningsByVendor: Record<string, { pending: number; available: number }> = {};
    earnings?.forEach((earning) => {
      const vid = earning.vendor_id;
      if (!earningsByVendor[vid]) {
        earningsByVendor[vid] = { pending: 0, available: 0 };
      }
      const amount = parseFloat(earning.net_amount || 0);
      if (earning.status === "pending") {
        earningsByVendor[vid].pending += amount;
      } else if (earning.status === "available") {
        earningsByVendor[vid].available += amount;
      }
    });

    return NextResponse.json({
      payouts: payouts || [],
      total: count || 0,
      earningsByVendor,
    });
  } catch (error: any) {
    console.error("Error in admin payouts API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Process a payout (approve/reject)
export async function PATCH(req: NextRequest) {
  try {
    const { isAdmin } = await checkAdminAccess();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { payoutId, status, failureReason } = body;

    if (!payoutId || !status) {
      return NextResponse.json(
        { error: "Payout ID and status are required" },
        { status: 400 }
      );
    }

    if (!["processing", "completed", "failed"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be processing, completed, or failed" },
        { status: 400 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Get payout details
    const { data: payout, error: payoutFetchError } = await adminSupabase
      .from("vendor_payouts")
      .select("*")
      .eq("id", payoutId)
      .single();

    if (payoutFetchError || !payout) {
      return NextResponse.json(
        { error: "Payout not found" },
        { status: 404 }
      );
    }

    // Update payout status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "completed") {
      updateData.processed_at = new Date().toISOString();
    }

    if (status === "failed" && failureReason) {
      updateData.failure_reason = failureReason;
    }

    const { data: updatedPayout, error: updateError } = await adminSupabase
      .from("vendor_payouts")
      .update(updateData)
      .eq("id", payoutId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating payout:", updateError);
      return NextResponse.json(
        { error: "Failed to update payout", details: updateError.message },
        { status: 500 }
      );
    }

    // If payout is completed, mark related earnings as paid
    if (status === "completed") {
      // This is a simplified version - in production, you'd want to track which earnings were paid
      // For now, we'll just mark available earnings as paid up to the payout amount
      const payoutAmount = parseFloat(payout.amount);
      const { data: availableEarnings } = await adminSupabase
        .from("vendor_earnings")
        .select("*")
        .eq("vendor_id", payout.vendor_id)
        .eq("status", "available")
        .order("created_at", { ascending: true });

      let remainingAmount = payoutAmount;
      for (const earning of availableEarnings || []) {
        if (remainingAmount <= 0) break;
        const earningAmount = parseFloat(earning.net_amount || 0);
        if (earningAmount <= remainingAmount) {
          await adminSupabase
            .from("vendor_earnings")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
            })
            .eq("id", earning.id);
          remainingAmount -= earningAmount;
        }
      }
    }

    return NextResponse.json({
      success: true,
      payout: updatedPayout,
      message: `Payout ${status} successfully`,
    });
  } catch (error: any) {
    console.error("Error in admin payout processing API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

