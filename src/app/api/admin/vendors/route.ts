import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notificationHelpers";
import {
  sendVendorApprovalEmail,
  sendVendorSuspensionEmail,
  sendVendorReinstatedEmail,
  sendVendorRejectionEmail,
} from "@/services/emailService";

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
      .from("vendors")
      .select(
        `
        *,
        profiles:user_id (
          id,
          email,
          full_name,
          phone,
          created_at
        )
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: vendors, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get product counts for each vendor
    const vendorsWithCounts = await Promise.all(
      (vendors || []).map(async (vendor: any) => {
        const { count: productCount } = await adminSupabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendor.id);

        return {
          ...vendor,
          productsCount: productCount || 0,
        };
      })
    );

    return NextResponse.json({
      vendors: vendorsWithCounts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Get vendors error:", error);
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
    const { user_id, business_name, business_description, business_type, ...vendorData } = data;

    if (!user_id || !business_name) {
      return NextResponse.json(
        { error: "User ID and business name are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const { data: user, error: userError } = await adminSupabase
      .from("profiles")
      .select("id, email, role")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Create vendor
    const vendorPayload = {
      user_id,
      business_name,
      business_description: business_description || null,
      business_type: business_type || "individual",
      status: "pending",
      verification_status: "unverified",
      ...vendorData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: vendor, error } = await adminSupabase
      .from("vendors")
      .insert(vendorPayload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      vendor,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create vendor error:", error);
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

    const { vendorId, action, ...updates } = await req.json();

    if (!vendorId || !action) {
      return NextResponse.json(
        { error: "Vendor ID and action are required" },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ["approve", "reject", "suspend", "reinstated", "update"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (action === "approve" || action === "reinstated") {
      updateData.status = "approved";
      updateData.verification_status = "verified";
    } else if (action === "reject") {
      updateData.status = "rejected";
    } else if (action === "suspend") {
      updateData.status = "suspended";
    } else if (action === "update") {
      updateData = { ...updateData, ...updates };
    }

    // Get vendor details before update (include business_email for email fallback)
    const { data: vendorBefore, error: fetchError } = await adminSupabase
      .from("vendors")
      .select("user_id, business_name, business_email, status")
      .eq("id", vendorId)
      .single();

    const { data: vendor, error } = await adminSupabase
      .from("vendors")
      .update(updateData)
      .eq("id", vendorId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // When approving or reinstating, set profiles.role to "vendor" so Navbar and getCurrentUser show Vendor Dashboard
    if ((action === "approve" || action === "reinstated") && vendorBefore?.user_id) {
      await adminSupabase
        .from("profiles")
        .update({ role: "vendor" })
        .eq("id", vendorBefore.user_id);
    }

    // Create notification for vendor based on action
    if (vendorBefore && vendor && action !== "update" && vendorBefore.user_id) {
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

      if (action === "approve") {
        await createNotification({
          title: "Vendor Application Approved",
          message: `Your vendor application for "${vendorBefore.business_name}" has been approved. You can now start selling on Kanyiji!`,
          type: "success",
          user_id: vendorBefore.user_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });

        // Also notify admins
        await createNotification({
          title: "Vendor Approved",
          message: `Vendor "${vendorBefore.business_name}" has been approved.`,
          type: "vendor",
          recipient_type: "admin",
          created_by: adminUser?.id || null,
        });
      } else if (action === "reject") {
        await createNotification({
          title: "Vendor Application Rejected",
          message: `Your vendor application for "${vendorBefore.business_name}" has been rejected. Please contact support for more information.`,
          type: "warning",
          user_id: vendorBefore.user_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });
      } else if (action === "suspend") {
        await createNotification({
          title: "Vendor Account Suspended",
          message: `Your vendor account "${vendorBefore.business_name}" has been suspended. Please contact support for assistance.`,
          type: "alert",
          user_id: vendorBefore.user_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });
      } else if (action === "reinstated") {
        await createNotification({
          title: "Vendor Account Reinstated",
          message: `Your vendor account "${vendorBefore.business_name}" has been reinstated. You can now access your vendor dashboard.`,
          type: "success",
          user_id: vendorBefore.user_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });
      }
    }

    // Send vendor action emails (approval, suspension, reinstatement)
    // Use profile email first; fallback to vendor business_email so emails are received
    try {
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", vendorBefore?.user_id)
        .single();

      const toEmail = profile?.email || (vendorBefore as any)?.business_email;
      if (toEmail && vendorBefore?.business_name) {
        if (action === "approve") {
          await sendVendorApprovalEmail({
            email: toEmail,
            businessName: vendorBefore.business_name,
            fullName: profile?.full_name || undefined,
          });
        } else if (action === "suspend") {
          await sendVendorSuspensionEmail({
            email: toEmail,
            businessName: vendorBefore.business_name,
            fullName: profile?.full_name || undefined,
          });
        } else if (action === "reinstated") {
          await sendVendorReinstatedEmail({
            email: toEmail,
            businessName: vendorBefore.business_name,
            fullName: profile?.full_name || undefined,
          });
        } else if (action === "reject") {
          await sendVendorRejectionEmail({
            email: toEmail,
            businessName: vendorBefore.business_name,
            fullName: profile?.full_name || undefined,
          });
        }
      }
    } catch (emailErr: any) {
      console.error("Vendor action email failed:", emailErr);
      // Don't fail the request; status update already succeeded
    }

    return NextResponse.json({
      success: true,
      vendor,
    });
  } catch (error: any) {
    console.error("Update vendor error:", error);
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
    const vendorId = searchParams.get("id");

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    // Delete vendor (cascade will delete related products)
    const { error } = await adminSupabase
      .from("vendors")
      .delete()
      .eq("id", vendorId);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete vendor error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

