import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Helper function to create notifications for main events
 * This can be called from API routes
 */
export async function createNotification(options: {
  title: string;
  message: string;
  type?: string;
  user_id?: string | null;
  recipient_type?: "all" | "user" | "admin";
  metadata?: Record<string, any>;
  created_by?: string | null;
}) {
  try {
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

      const notificationData: any = {
        title: options.title,
        message: options.message,
        type: options.type || "system",
        recipient_type: options.recipient_type || (options.user_id ? "user" : "all"),
        user_id: options.user_id || null,
        created_by: options.created_by || null,
        created_at: new Date().toISOString(),
        // updated_at is optional - only include if column exists
      };

    // Only include metadata if provided and not empty
    if (options.metadata && Object.keys(options.metadata).length > 0) {
      notificationData.metadata = options.metadata;
    }

    const { data: notification, error } = await adminSupabase
      .from("notifications")
      .insert(notificationData)
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      // Don't throw - notification creation failure shouldn't break the main operation
      return null;
    }

    return notification;
  } catch (error) {
    console.error("Error in createNotification helper:", error);
    // Don't throw - notification creation failure shouldn't break the main operation
    return null;
  }
}

