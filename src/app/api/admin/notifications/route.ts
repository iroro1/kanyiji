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

// GET - Fetch notifications
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const unreadOnly = searchParams.get("unread_only") === "true";

    // Try to fetch from notifications table if it exists
    let query = adminSupabase
      .from("notifications")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data: notifications, error, count } = await query;

    if (error) {
      // If notifications table doesn't exist, return empty array
      if (error.code === "42P01") {
        console.log("Notifications table does not exist yet");
        return NextResponse.json({
          notifications: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
          unreadCount: 0,
        });
      }
      throw error;
    }

    const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

    return NextResponse.json({
      notifications: notifications || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
      unreadCount,
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification as read or update
export async function PATCH(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { notificationId, is_read, ...updates } = await req.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      ...updates,
      // updated_at will be managed by the database
    };

    if (typeof is_read === "boolean") {
      updateData.is_read = is_read;
      updateData.read_at = is_read ? new Date().toISOString() : null;
    }

    const { data: notification, error } = await adminSupabase
      .from("notifications")
      .update(updateData)
      .eq("id", notificationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      notification,
    });
  } catch (error: any) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create notification or mark all as read
export async function POST(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { action, title, message, type, user_id, recipient_type, metadata } = await req.json();

    // Create notification
    if (action === "create" || (!action && title && message)) {
      if (!title || !message) {
        return NextResponse.json(
          { error: "Title and message are required" },
          { status: 400 }
        );
      }

      // Get current admin user ID for created_by
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
      } = await supabase.auth.getUser();

      const notificationData: any = {
        title,
        message,
        type: type || "system",
        recipient_type: recipient_type || (user_id ? "user" : "all"),
        created_by: user?.id || null,
        created_at: new Date().toISOString(),
        // updated_at is optional - only include if column exists
      };

      // Only include metadata if provided and not empty (metadata column might not exist)
      if (metadata && typeof metadata === "object" && Object.keys(metadata).length > 0) {
        notificationData.metadata = metadata;
      }

      // If user_id is provided, send to specific user
      if (user_id && recipient_type === "user") {
        notificationData.user_id = user_id;
        notificationData.recipient_type = "user";

        // Create notification for specific user
        const { data: notification, error } = await adminSupabase
          .from("notifications")
          .insert(notificationData)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          notification,
        });
      } else {
        // If recipient_type is 'all', create notification for all users
        // Create one notification with recipient_type='all' that all users can see
        notificationData.recipient_type = "all";
        notificationData.user_id = null;

        const { data: notification, error } = await adminSupabase
          .from("notifications")
          .insert(notificationData)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return NextResponse.json({
          success: true,
          notification,
        });
      }
    }

    // Mark all as read
    if (action === "mark_all_read") {
      const { error } = await adminSupabase
        .from("notifications")
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
          // updated_at will be managed by the database
        })
        .eq("is_read", false);

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    return NextResponse.json(
      { error: "Invalid action or missing required fields" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Post notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

