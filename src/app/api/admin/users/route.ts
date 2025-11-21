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

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      query = query.eq("role", role);
    }

    const { data: users, error, count } = await query;

    if (error) {
      throw error;
    }

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      (users || []).map(async (user: any) => {
        const [
          { count: orderCount },
          { count: vendorCount },
        ] = await Promise.all([
          adminSupabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", user.id),
          adminSupabase
            .from("vendors")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

        return {
          ...user,
          ordersCount: orderCount || 0,
          isVendor: (vendorCount || 0) > 0,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Get users error:", error);
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
    const { email, password, full_name, role, phone, ...userData } = data;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["admin", "vendor", "customer"];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be admin, vendor, or customer" },
        { status: 400 }
      );
    }

    // Create user in auth.users first
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create user" },
        { status: 400 }
      );
    }

    // Create profile
    const profilePayload = {
      id: authData.user.id,
      email,
      full_name,
      role: role || "customer",
      phone: phone || null,
      is_active: true,
      ...userData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: profile, error: profileError } = await adminSupabase
      .from("profiles")
      .insert(profilePayload)
      .select()
      .single();

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return NextResponse.json({
      success: true,
      user: profile,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Create user error:", error);
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

    const { userId, action, ...updates } = await req.json();

    if (!userId || !action) {
      return NextResponse.json(
        { error: "User ID and action are required" },
        { status: 400 }
      );
    }

    // Check if user is the protected admin user
    const { data: userProfile } = await adminSupabase
      .from("profiles")
      .select("email")
      .eq("id", userId)
      .single();

    if (userProfile?.email === "kanyiji.dev+admin@gmail.com") {
      // Prevent any modifications to role or status
      if (action === "suspend" || action === "activate" || updates.is_active !== undefined) {
        return NextResponse.json(
          { error: "Cannot modify the admin user's status" },
          { status: 403 }
        );
      }
      if (action === "change_role" || updates.role !== undefined) {
        return NextResponse.json(
          { error: "Cannot modify the admin user's role" },
          { status: 403 }
        );
      }
    }

    // Validate action
    const validActions = ["suspend", "activate", "update", "change_role"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (action === "suspend") {
      updateData.is_active = false;
    } else if (action === "activate") {
      updateData.is_active = true;
    } else if (action === "change_role") {
      if (!updates.role) {
        return NextResponse.json(
          { error: "Role is required for change_role action" },
          { status: 400 }
        );
      }
      updateData.role = updates.role;
    } else if (action === "update") {
      updateData = { ...updateData, ...updates };
      // Double-check that we're not modifying protected admin user
      if (userProfile?.email === "kanyiji.dev+admin@gmail.com") {
        // Remove role and is_active from updates if present
        delete updateData.role;
        delete updateData.is_active;
      }
    }

    const { data: user, error } = await adminSupabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
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
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent deleting own admin account
    const { data: currentUser } = await adminSupabase.auth.getUser();
    if (currentUser?.user?.id === userId) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Check if user is an admin - prevent deleting other admins
    const { data: userProfile } = await adminSupabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (userProfile?.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin accounts" },
        { status: 403 }
      );
    }

    // Delete user (cascade will delete profile, orders, vendors, etc.)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

