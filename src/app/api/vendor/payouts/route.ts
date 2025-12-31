import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getAuthenticatedUser() {
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
      return { user: null, vendorId: null };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, vendorId: null };
    }

    // Get vendor ID
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: vendor, error: vendorError } = await adminSupabase
      .from("vendors")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      return { user, vendorId: null };
    }

    return { user, vendorId: vendor.id };
  } catch (error) {
    console.error("Error in getAuthenticatedUser:", error);
    return { user: null, vendorId: null };
  }
}

// GET - Fetch vendor account summary, earnings, and payout history
export async function GET(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS)
    if (!supabaseServiceKey) {
      console.error("Vendor payouts API: Service role key not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to get authenticated user and vendor ID (optional - for validation)
    const { user, vendorId } = await getAuthenticatedUser();

    if (!vendorId) {
      console.error("Vendor payouts API: No vendor ID found");
      return NextResponse.json(
        { error: "Unauthorized. Vendor account not found." },
        { status: 401 }
      );
    }

    console.log("Vendor payouts API: Fetching data for vendor:", vendorId);

    // Fetch vendor earnings
    const { data: earnings, error: earningsError } = await adminSupabase
      .from("vendor_earnings")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false });

    if (earningsError) {
      console.error("Vendor payouts API: Error fetching earnings:", earningsError);
    } else {
      console.log("Vendor payouts API: Fetched earnings count:", earnings?.length || 0);
    }

    // Calculate account summary
    const totalEarnings = earnings?.reduce((sum, e) => sum + parseFloat(e.gross_amount || 0), 0) || 0;
    const totalCommission = earnings?.reduce((sum, e) => sum + parseFloat(e.commission_amount || 0), 0) || 0;
    const availableBalance = earnings
      ?.filter((e) => e.status === "available")
      .reduce((sum, e) => sum + parseFloat(e.net_amount || 0), 0) || 0;
    const pendingEarnings = earnings
      ?.filter((e) => e.status === "pending")
      .reduce((sum, e) => sum + parseFloat(e.net_amount || 0), 0) || 0;
    const paidEarnings = earnings
      ?.filter((e) => e.status === "paid")
      .reduce((sum, e) => sum + parseFloat(e.net_amount || 0), 0) || 0;

    // Fetch payout history
    const { data: payouts, error: payoutsError } = await adminSupabase
      .from("vendor_payouts")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (payoutsError) {
      console.error("Vendor payouts API: Error fetching payouts:", payoutsError);
    } else {
      console.log("Vendor payouts API: Fetched payouts count:", payouts?.length || 0);
    }

    // Fetch bank accounts
    const { data: bankAccounts, error: bankAccountsError } = await adminSupabase
      .from("vendor_bank_accounts")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (bankAccountsError) {
      console.error("Vendor payouts API: Error fetching bank accounts:", bankAccountsError);
    } else {
      console.log("Vendor payouts API: Fetched bank accounts count:", bankAccounts?.length || 0);
    }

    // Fetch vendor payout method and details
    const { data: vendor, error: vendorError } = await adminSupabase
      .from("vendors")
      .select("payout_method, payout_details")
      .eq("id", vendorId)
      .single();

    if (vendorError) {
      console.error("Vendor payouts API: Error fetching vendor:", vendorError);
    }

    const response = {
      accountSummary: {
        totalEarnings,
        totalCommission,
        availableBalance,
        pendingEarnings,
        paidEarnings,
      },
      earnings: earnings || [],
      payouts: payouts || [],
      bankAccounts: bankAccounts || [],
      payoutMethod: vendor?.payout_method || "bank_transfer",
      payoutDetails: vendor?.payout_details || {},
    };

    console.log("Vendor payouts API: Successfully returning data:", {
      earningsCount: response.earnings.length,
      payoutsCount: response.payouts.length,
      bankAccountsCount: response.bankAccounts.length,
      availableBalance: response.accountSummary.availableBalance,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Vendor payouts API: Error in GET handler:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Request a payout
export async function POST(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS)
    if (!supabaseServiceKey) {
      console.error("Vendor payouts API: Service role key not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Try to get authenticated user and vendor ID (optional - for validation)
    const { user, vendorId } = await getAuthenticatedUser();

    if (!vendorId) {
      console.error("Vendor payouts API: No vendor ID found for payout request");
      return NextResponse.json(
        { error: "Unauthorized. Vendor account not found." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, bankAccountId } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payout amount" },
        { status: 400 }
      );
    }

    console.log("Vendor payouts API: Processing payout request:", {
      vendorId,
      amount,
      bankAccountId,
    });

    // Check available balance
    const { data: earnings } = await adminSupabase
      .from("vendor_earnings")
      .select("net_amount")
      .eq("vendor_id", vendorId)
      .eq("status", "available");

    const availableBalance = earnings?.reduce(
      (sum, e) => sum + parseFloat(e.net_amount || 0),
      0
    ) || 0;

    if (amount > availableBalance) {
      return NextResponse.json(
        { error: "Insufficient balance. Available balance is less than requested amount." },
        { status: 400 }
      );
    }

    // Get bank account details if provided
    let paymentDetails: any = {};
    if (bankAccountId) {
      const { data: bankAccount } = await adminSupabase
        .from("vendor_bank_accounts")
        .select("*")
        .eq("id", bankAccountId)
        .eq("vendor_id", vendorId)
        .single();

      if (!bankAccount) {
        return NextResponse.json(
          { error: "Bank account not found" },
          { status: 404 }
        );
      }

      paymentDetails = {
        account_name: bankAccount.account_name,
        account_number: bankAccount.account_number,
        bank_name: bankAccount.bank_name,
        bank_code: bankAccount.bank_code,
        account_type: bankAccount.account_type,
      };
    }

    // Get vendor payout method
    const { data: vendor } = await adminSupabase
      .from("vendors")
      .select("payout_method, payout_details")
      .eq("id", vendorId)
      .single();

    // Create payout request
    const { data: payout, error: payoutError } = await adminSupabase
      .from("vendor_payouts")
      .insert({
        vendor_id: vendorId,
        amount: amount.toString(),
        status: "pending",
        payment_method: vendor?.payout_method || "bank_transfer",
        payment_details: paymentDetails,
        reference: `PAYOUT-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      })
      .select()
      .single();

    if (payoutError) {
      console.error("Error creating payout:", payoutError);
      return NextResponse.json(
        { error: "Failed to create payout request", details: payoutError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      payout,
      message: "Payout request submitted successfully",
    });
  } catch (error: any) {
    console.error("Error in vendor payout request API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

