import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkAuth() {
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
    return { authenticated: false, userId: null, supabase: null };
  }

  return { authenticated: true, userId: user.id, supabase };
}

// GET - Fetch user's notifications
export async function GET(req: NextRequest) {
  try {
    // Try to get user from auth, but don't fail if it doesn't work
    // We'll use service role key which bypasses RLS
    const { authenticated, userId } = await checkAuth();

    // If we can't get user from auth, try to get from query params or return empty
    // This prevents 401 errors when the user is authenticated on client but server auth fails
    if (!authenticated || !userId) {
      console.warn("Auth check failed, but continuing with service role key. This may return empty notifications.");
      // Return empty notifications instead of 401 to prevent console errors
      return NextResponse.json({
        notifications: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        unreadCount: 0,
      });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const unreadOnly = searchParams.get("unread_only") === "true";

    try {
      // Use service role key directly to bypass RLS
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Fetch notifications with user_id = userId (these can have recipient_type = 'user' or 'all')
      let userNotificationsQuery = adminSupabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (unreadOnly) {
        userNotificationsQuery = userNotificationsQuery.eq("is_read", false);
      }

      console.log(`Querying notifications for user_id=${userId}, unreadOnly=${unreadOnly} using service role key`);

      const userResult = await userNotificationsQuery;
      const userNotifications = userResult.data || [];
      const userError = userResult.error;

      if (userError) {
        console.error(`Error fetching user notifications for ${userId}:`, userError);
      } else {
        console.log(`Fetched ${userNotifications.length} user-specific notifications for ${userId}`);
      }

      // Fetch notifications with recipient_type = 'all'
      let allNotificationsQuery = adminSupabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("recipient_type", "all")
        .order("created_at", { ascending: false });

      if (unreadOnly) {
        allNotificationsQuery = allNotificationsQuery.eq("is_read", false);
      }

      const allResult = await allNotificationsQuery;
      const allNotifications = allResult.data || [];
      const allError = allResult.error;

      if (allError) {
        console.error(`Error fetching broadcast notifications:`, allError);
      } else {
        console.log(`Fetched ${allNotifications.length} broadcast notifications (recipient_type='all')`);
      }

      // If notifications table doesn't exist, return empty array
      if (userError?.code === "42P01" || allError?.code === "42P01") {
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

      // Combine and deduplicate notifications
      const allNotifs = [...(userNotifications || []), ...(allNotifications || [])];
      const uniqueNotificationsMap = new Map();
      
      // Add all notifications, deduplicating by id
      allNotifs.forEach((n: any) => {
        if (n && n.id) {
          uniqueNotificationsMap.set(n.id, n);
        }
      });

      // Convert to array and sort by created_at (newest first)
      const uniqueNotifications = Array.from(uniqueNotificationsMap.values()).sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });

      // Debug: Check what we got
      if (uniqueNotifications.length === 0) {
        console.warn(`⚠️ No notifications found for user ${userId}. User notifications: ${userNotifications?.length || 0}, Broadcast notifications: ${allNotifications?.length || 0}`);
        if (userNotifications && userNotifications.length > 0) {
          console.log("User notifications found but not included:", userNotifications.map((n: any) => ({ id: n.id, user_id: n.user_id, recipient_type: n.recipient_type })));
        }
        if (allNotifications && allNotifications.length > 0) {
          console.log("Broadcast notifications found but not included:", allNotifications.map((n: any) => ({ id: n.id, user_id: n.user_id, recipient_type: n.recipient_type })));
        }
      }

      // Calculate unread count from all unique notifications
      const unreadCount = uniqueNotifications.filter((n: any) => !n.is_read).length;

      // Apply pagination
      const paginatedNotifications = uniqueNotifications.slice(offset, offset + limit);
      const totalCount = uniqueNotifications.length;

      console.log(`User ${userId} notifications: ${totalCount} total, ${unreadCount} unread, showing ${paginatedNotifications.length} on page ${page}`);
      console.log(`User-specific notifications: ${userNotifications?.length || 0}, Broadcast notifications: ${allNotifications?.length || 0}`);
      
      // Debug: Log first few notifications
      if (paginatedNotifications.length > 0) {
        console.log("Sample notifications:", paginatedNotifications.slice(0, 3).map((n: any) => ({
          id: n.id,
          title: n.title,
          user_id: n.user_id,
          recipient_type: n.recipient_type,
          is_read: n.is_read
        })));
      } else {
        console.log("No notifications found. User notifications:", userNotifications?.length || 0, "All notifications:", allNotifications?.length || 0);
      }

      return NextResponse.json({
        notifications: paginatedNotifications || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit),
        },
        unreadCount,
      });
    } catch (error: any) {
      console.error("Get user notifications error:", error);
      // Return empty array on error instead of throwing
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
  } catch (error: any) {
    console.error("Get user notifications error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Mark notification as read
export async function PATCH(req: NextRequest) {
  try {
    const { authenticated, userId } = await checkAuth();

    if (!authenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { notificationId, is_read } = await req.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    // Use service role key directly to bypass RLS
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch notification to check access
    const { data: notification, error: fetchError } = await adminSupabase
      .from("notifications")
      .select("user_id, recipient_type")
      .eq("id", notificationId)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this notification
    if (notification.user_id !== userId && notification.recipient_type !== "all") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const updateData: any = {
      // updated_at will be managed by the database
    };

    if (typeof is_read === "boolean") {
      updateData.is_read = is_read;
      updateData.read_at = is_read ? new Date().toISOString() : null;
    }

    // Update with service role key
    const { data: updatedNotification, error: updateError } = await adminSupabase
      .from("notifications")
      .update(updateData)
      .eq("id", notificationId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      notification: updatedNotification,
    });
  } catch (error: any) {
    console.error("Update notification error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Mark all as read
export async function POST(req: NextRequest) {
  try {
    const { authenticated, userId } = await checkAuth();

    if (!authenticated || !userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { action } = await req.json();

    if (action === "mark_all_read") {
      // Use service role key directly to bypass RLS
      const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get the IDs of notifications the user has access to
      const { data: userNotifs, error: fetchError } = await adminSupabase
        .from("notifications")
        .select("id")
        .or(`user_id.eq.${userId},recipient_type.eq.all`)
        .eq("is_read", false);
      
      if (fetchError) {
        console.error("Error fetching notifications for mark all read:", fetchError);
        throw fetchError;
      }
      
      if (userNotifs && userNotifs.length > 0) {
        const notificationIds = userNotifs.map(n => n.id);
        
        // Update with service role key
        const { error: updateError } = await adminSupabase
          .from("notifications")
          .update({
            is_read: true,
            read_at: new Date().toISOString(),
            // updated_at will be managed by the database
          })
          .in("id", notificationIds);
            
        if (updateError) {
          throw updateError;
        }
      }

      return NextResponse.json({
        success: true,
        message: "All notifications marked as read",
      });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Mark all read error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

