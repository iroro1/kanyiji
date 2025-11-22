import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notificationHelpers";

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

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from("orders")
      .select(
        `
        *,
        customer:customer_id (
          id,
          email,
          full_name
        ),
        vendor:vendor_id (
          id,
          business_name
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: orders, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      orders: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { customer_id, vendor_id, subtotal, items, shipping_address, ...orderData } = data;

    if (!customer_id || !vendor_id || !subtotal || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer ID, vendor ID, subtotal, and items are required" },
        { status: 400 }
      );
    }

    // Verify customer and vendor exist
    const [customerResult, vendorResult] = await Promise.all([
      adminSupabase.from("profiles").select("id").eq("id", customer_id).single(),
      adminSupabase.from("vendors").select("id").eq("id", vendor_id).single(),
    ]);

    if (customerResult.error || !customerResult.data) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (vendorResult.error || !vendorResult.data) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Calculate total amount
    const tax_amount = orderData.tax_amount || 0;
    const shipping_fee = orderData.shipping_fee || 0;
    const total_amount = parseFloat(subtotal) + tax_amount + shipping_fee;

    // Create order
    const orderPayload = {
      customer_id,
      vendor_id,
      subtotal: parseFloat(subtotal),
      tax_amount,
      shipping_fee,
      total_amount,
      status: "pending",
      payment_status: "pending",
      payment_method: orderData.payment_method || "unknown",
      shipping_address: shipping_address || {},
      items: items || [],
      ...orderData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: order, error } = await adminSupabase
      .from("orders")
      .insert(orderPayload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create notifications for new order
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    });
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    // Notify customer
    await createNotification({
      title: "Order Placed Successfully",
      message: `Your order #${order.id.slice(0, 8)} has been placed successfully. Total: ₦${order.total_amount.toLocaleString()}`,
      type: "order",
      user_id: customer_id,
      recipient_type: "user",
      created_by: adminUser?.id || null,
    });

    // Notify vendor
    const { data: vendorData } = await adminSupabase
      .from("vendors")
      .select("user_id, business_name")
      .eq("id", vendor_id)
      .single();

    if (vendorData?.user_id) {
      await createNotification({
        title: "New Order Received",
        message: `You have received a new order #${order.id.slice(0, 8)} worth ₦${order.total_amount.toLocaleString()}`,
        type: "order",
        user_id: vendorData.user_id,
        recipient_type: "user",
        created_by: adminUser?.id || null,
      });
    }

    // Notify admins
    await createNotification({
      title: "New Order Placed",
      message: `New order #${order.id.slice(0, 8)} worth ₦${order.total_amount.toLocaleString()} has been placed.`,
      type: "order",
      recipient_type: "admin",
      created_by: adminUser?.id || null,
    });

    return NextResponse.json({
      success: true,
      order,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { orderId, status, ...updates } = await req.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
      ...updates,
    };

    // Get order details before update for notifications
    const { data: orderBefore } = await adminSupabase
      .from("orders")
      .select("customer_id, vendor_id, status, total_amount")
      .eq("id", orderId)
      .single();

    if (status) {
      // Validate status
      const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    const { data: order, error } = await adminSupabase
      .from("orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create notification for order status changes
    if (orderBefore && status && orderBefore.status !== status) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      });
      const { data: { user: adminUser } } = await supabase.auth.getUser();

      const orderShortId = orderId.slice(0, 8);
      let customerMessage = "";
      let vendorMessage = "";

      switch (status) {
        case "processing":
          customerMessage = `Your order #${orderShortId} is now being processed.`;
          vendorMessage = `Order #${orderShortId} status updated to processing.`;
          break;
        case "shipped":
          customerMessage = `Your order #${orderShortId} has been shipped! Track your package for updates.`;
          vendorMessage = `Order #${orderShortId} has been marked as shipped.`;
          break;
        case "delivered":
          customerMessage = `Your order #${orderShortId} has been delivered! Thank you for shopping with Kanyiji.`;
          vendorMessage = `Order #${orderShortId} has been delivered.`;
          break;
        case "cancelled":
          customerMessage = `Your order #${orderShortId} has been cancelled.`;
          vendorMessage = `Order #${orderShortId} has been cancelled.`;
          break;
      }

      // Notify customer
      if (customerMessage && orderBefore.customer_id) {
        await createNotification({
          title: "Order Status Updated",
          message: customerMessage,
          type: "order",
          user_id: orderBefore.customer_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });
      }

      // Notify vendor
      if (vendorMessage && orderBefore.vendor_id) {
        const { data: vendorData } = await adminSupabase
          .from("vendors")
          .select("user_id")
          .eq("id", orderBefore.vendor_id)
          .single();

        if (vendorData?.user_id) {
          await createNotification({
            title: "Order Status Updated",
            message: vendorMessage,
            type: "order",
            user_id: vendorData.user_id,
            recipient_type: "user",
            created_by: adminUser?.id || null,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("Update order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    // Delete order (cascade will delete related order items)
    const { error } = await adminSupabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete order error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

