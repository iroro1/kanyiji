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

// GET - Fetch vendor bank accounts
export async function GET(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS)
    if (!supabaseServiceKey) {
      console.error("Bank accounts API: Service role key not configured");
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
      console.error("Bank accounts API: No vendor ID found");
      return NextResponse.json(
        { error: "Unauthorized. Vendor account not found." },
        { status: 401 }
      );
    }

    const { data: bankAccounts, error } = await adminSupabase
      .from("vendor_bank_accounts")
      .select("*")
      .eq("vendor_id", vendorId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bank accounts:", error);
      return NextResponse.json(
        { error: "Failed to fetch bank accounts", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ bankAccounts: bankAccounts || [] });
  } catch (error: any) {
    console.error("Error in bank accounts API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Add a new bank account
export async function POST(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS)
    if (!supabaseServiceKey) {
      console.error("Bank accounts API: Service role key not configured");
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
      console.error("Bank accounts API: No vendor ID found for bank account creation");
      return NextResponse.json(
        { error: "Unauthorized. Vendor account not found." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { account_name, account_number, bank_name, bank_code, account_type, is_primary } = body;

    if (!account_name || !account_number || !bank_name) {
      return NextResponse.json(
        { error: "Account name, account number, and bank name are required" },
        { status: 400 }
      );
    }

    // If this is set as primary, unset other primary accounts
    if (is_primary) {
      await adminSupabase
        .from("vendor_bank_accounts")
        .update({ is_primary: false })
        .eq("vendor_id", vendorId)
        .eq("is_primary", true);
    }

    // Create new bank account
    const { data: bankAccount, error } = await adminSupabase
      .from("vendor_bank_accounts")
      .insert({
        vendor_id: vendorId,
        account_name,
        account_number,
        bank_name,
        bank_code: bank_code || null,
        account_type: account_type || "savings",
        is_primary: is_primary || false,
        is_verified: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating bank account:", error);
      return NextResponse.json(
        { error: "Failed to create bank account", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bankAccount,
      message: "Bank account added successfully",
    });
  } catch (error: any) {
    console.error("Error in bank account creation API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update a bank account
export async function PATCH(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS)
    if (!supabaseServiceKey) {
      console.error("Bank accounts API: Service role key not configured");
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
      console.error("Bank accounts API: No vendor ID found for bank account update");
      return NextResponse.json(
        { error: "Unauthorized. Vendor account not found." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, account_name, account_number, bank_name, bank_code, account_type, is_primary } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Bank account ID is required" },
        { status: 400 }
      );
    }

    // Verify bank account belongs to vendor
    const { data: existingAccount } = await adminSupabase
      .from("vendor_bank_accounts")
      .select("vendor_id")
      .eq("id", id)
      .single();

    if (!existingAccount || existingAccount.vendor_id !== vendorId) {
      return NextResponse.json(
        { error: "Bank account not found or unauthorized" },
        { status: 404 }
      );
    }

    // If setting as primary, unset other primary accounts
    if (is_primary) {
      await adminSupabase
        .from("vendor_bank_accounts")
        .update({ is_primary: false })
        .eq("vendor_id", vendorId)
        .eq("is_primary", true)
        .neq("id", id);
    }

    // Update bank account
    const updateData: any = {};
    if (account_name) updateData.account_name = account_name;
    if (account_number) updateData.account_number = account_number;
    if (bank_name) updateData.bank_name = bank_name;
    if (bank_code !== undefined) updateData.bank_code = bank_code;
    if (account_type) updateData.account_type = account_type;
    if (is_primary !== undefined) updateData.is_primary = is_primary;
    updateData.updated_at = new Date().toISOString();

    const { data: bankAccount, error } = await adminSupabase
      .from("vendor_bank_accounts")
      .update(updateData)
      .eq("id", id)
      .eq("vendor_id", vendorId)
      .select()
      .single();

    if (error) {
      console.error("Error updating bank account:", error);
      return NextResponse.json(
        { error: "Failed to update bank account", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bankAccount,
      message: "Bank account updated successfully",
    });
  } catch (error: any) {
    console.error("Error in bank account update API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a bank account
export async function DELETE(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS)
    if (!supabaseServiceKey) {
      console.error("Bank accounts API: Service role key not configured");
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
      console.error("Bank accounts API: No vendor ID found for bank account deletion");
      return NextResponse.json(
        { error: "Unauthorized. Vendor account not found." },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Bank account ID is required" },
        { status: 400 }
      );
    }

    // Verify bank account belongs to vendor
    const { data: existingAccount } = await adminSupabase
      .from("vendor_bank_accounts")
      .select("vendor_id, is_primary")
      .eq("id", id)
      .single();

    if (!existingAccount || existingAccount.vendor_id !== vendorId) {
      return NextResponse.json(
        { error: "Bank account not found or unauthorized" },
        { status: 404 }
      );
    }

    // Delete bank account
    const { error } = await adminSupabase
      .from("vendor_bank_accounts")
      .delete()
      .eq("id", id)
      .eq("vendor_id", vendorId);

    if (error) {
      console.error("Error deleting bank account:", error);
      return NextResponse.json(
        { error: "Failed to delete bank account", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bank account deleted successfully",
    });
  } catch (error: any) {
    console.error("Error in bank account deletion API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

