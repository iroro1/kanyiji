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

    // Get session first to ensure authentication
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error("Vendor orders API: No session found", sessionError);
      return { user: null, supabase: null };
    }

    // Get user from session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Vendor orders API: Error getting user", userError);
      return { user: null, supabase: null };
    }

    return { user, supabase };
  } catch (error) {
    console.error("Vendor orders API: Error in getAuthenticatedUser", error);
    return { user: null, supabase: null };
  }
}

export async function GET(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS and authentication)
    if (!supabaseServiceKey) {
      console.error("Vendor orders API: Service role key not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("=== Vendor Orders API (Using Admin Service Key) ===");

    // Create service role client (admin key - bypasses RLS completely)
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Try to get vendor ID from session (optional - for filtering)
    let vendorId: string | null = null;
    try {
      const { user } = await getAuthenticatedUser();
      if (user) {
        const { data: vendor } = await adminSupabase
          .from("vendors")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (vendor) {
          vendorId = String(vendor.id);
          console.log("Vendor ID from session:", vendorId);
        }
      }
    } catch (authError) {
      console.log("Could not get vendor from session, will show all orders");
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = (page - 1) * limit;

    // Fetch ALL orders from the database using admin service key (bypasses RLS)
    console.log("Fetching all orders from orders table using admin key...");

    // First, try a simple query to get orders
    let simpleQuery = adminSupabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status) {
      simpleQuery = simpleQuery.eq("status", status);
    }

    const { data: simpleOrders, error: simpleError, count } = await simpleQuery;

    console.log("=== SIMPLE QUERY RESULTS ===");
    console.log(
      "Error:",
      simpleError ? JSON.stringify(simpleError, null, 2) : "None"
    );
    console.log("Total count in database:", count);
    console.log("Orders fetched:", simpleOrders?.length || 0);

    if (simpleError) {
      console.error("Error fetching orders (simple query):", simpleError);
      return NextResponse.json(
        {
          error: "Failed to fetch orders",
          details: simpleError.message,
          code: simpleError.code,
          hint: simpleError.hint,
        },
        { status: 500 }
      );
    }

    // If we have orders, fetch related data and filter by vendor
    let allOrders: any[] = [];

    if (simpleOrders && simpleOrders.length > 0) {
      console.log("Fetching related data for orders...");

      // Fetch order items and related data for each order
      const ordersWithData = await Promise.all(
        simpleOrders.map(async (order: any) => {
          // Fetch order items
          const { data: orderItems } = await adminSupabase
            .from("order_items")
            .select(
              `
              id,
              product_id,
              vendor_id,
              quantity,
              unit_price,
              total_price,
              size,
              color,
              products (
                id,
                name,
                product_images (
                  image_url
                )
              )
            `
            )
            .eq("order_id", order.id);

          // Fetch customer data from profiles table (customer_id is user id)
          let customer = null;
          if (order.customer_id) {
            const { data: profile, error: profileError } = await adminSupabase
              .from("profiles")
              .select("id, email, full_name, phone")
              .eq("id", order.customer_id)
              .single();

            if (!profileError && profile) {
              customer = profile;
            }
          }

          return {
            ...order,
            order_items: orderItems || [],
            customer: customer,
          };
        })
      );

      console.log("Orders with related data:", ordersWithData.length);

      // Filter orders to only include those belonging to this vendor.
      // If we cannot identify the vendor from the session, return empty — never return other vendors' orders.
      if (vendorId) {
        allOrders = ordersWithData.filter((order: any) => {
          const orderVendorId = order.vendor_id
            ? String(order.vendor_id)
            : null;
          const hasVendorItem = order.order_items?.some(
            (item: any) => item.vendor_id && String(item.vendor_id) === vendorId
          );

          return orderVendorId === vendorId || hasVendorItem;
        });
        console.log("Orders filtered for vendor:", allOrders.length);
      } else {
        // No vendor ID from session: do not return other vendors' data. Return empty.
        allOrders = [];
        console.log(
          "No vendor ID from session — returning empty orders for vendor dashboard."
        );
      }
    }

    console.log("=== QUERY RESULTS ===");
    console.log("Total orders for this vendor:", allOrders.length);

    // Ensure order_items is always an array
    const filteredOrders = allOrders.map((order: any) => ({
      ...order,
      order_items: order.order_items || [],
    }));

    console.log("=== FINAL STATE ===");
    console.log("Total orders to return:", filteredOrders.length);
    if (filteredOrders.length > 0) {
      console.log("Sample order:", {
        id: filteredOrders[0].id,
        vendor_id: filteredOrders[0].vendor_id,
        status: filteredOrders[0].status,
        total_amount: filteredOrders[0].total_amount,
        order_items_count: filteredOrders[0].order_items?.length || 0,
      });
    }

    // Apply pagination
    const paginatedOrders = filteredOrders.slice(offset, offset + limit);

    // Calculate stats from filtered orders
    const totalRevenue = filteredOrders
      .filter((o) => o.status === "delivered")
      .reduce((sum, order) => sum + parseFloat(order.total_amount || "0"), 0);

    const totalOrders = filteredOrders.length;
    const uniqueCustomers = new Set(
      filteredOrders.map((o) => o.customer_id).filter(Boolean)
    ).size;

    const response = {
      orders: paginatedOrders,
      stats: {
        totalOrders: totalOrders,
        totalRevenue,
        totalCustomers: uniqueCustomers,
      },
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    };

    console.log("=== FINAL API RESPONSE ===");
    console.log("Response orders count:", response.orders.length);
    console.log("Response stats:", response.stats);
    console.log("Response pagination:", response.pagination);
    console.log("==========================");

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Get vendor orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", stack: error.stack },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS and authentication)
    if (!supabaseServiceKey) {
      console.error("Vendor orders API: Service role key not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create service role client (admin key - bypasses RLS completely)
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Try to get vendor ID from session (optional - for validation)
    let vendorId: string | null = null;
    try {
      const { user } = await getAuthenticatedUser();
      if (user) {
        const { data: vendor } = await adminSupabase
          .from("vendors")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (vendor) {
          vendorId = String(vendor.id);
          console.log("Vendor ID from session:", vendorId);
        }
      }
    } catch (authError) {
      console.log("Could not get vendor from session, proceeding with update");
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    // Verify the order exists using service role key
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .select("id, vendor_id, order_items(vendor_id)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Validate vendor ownership if vendor ID was found
    if (vendorId) {
      const vendorIdStr = String(vendorId);
      const orderVendorId = order.vendor_id ? String(order.vendor_id) : null;
      const orderItems = order.order_items || [];
      const hasVendorItem = orderItems.some(
        (item: any) => item.vendor_id && String(item.vendor_id) === vendorIdStr
      );

      if (orderVendorId !== vendorIdStr && !hasVendorItem) {
        return NextResponse.json(
          { error: "Order does not belong to this vendor" },
          { status: 403 }
        );
      }
    }

    // Update order status using service role key
    const { data: updatedOrder, error: updateError } = await adminSupabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", orderId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating order status:", updateError);
      return NextResponse.json(
        {
          error: "Failed to update order status",
          details: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
