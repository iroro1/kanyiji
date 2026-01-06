import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This endpoint should be called by a cron job or scheduled task
// to send weekly reminders to vendors whose trial is ending soon
export async function POST(req: NextRequest) {
  try {
    // Verify this is called from an authorized source (cron job, admin, etc.)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || "cron-secret-key"}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Find vendors whose trial ends in 30 days or less
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: vendors, error } = await adminSupabase
      .from("vendors")
      .select("id, user_id, business_name, business_email, trial_end_date, last_reminder_sent_at, reminder_count")
      .eq("subscription_status", "trial")
      .lte("trial_end_date", thirtyDaysFromNow.toISOString())
      .gt("trial_end_date", new Date().toISOString()); // Trial hasn't ended yet

    if (error) {
      console.error("Error fetching vendors for reminders:", error);
      return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
    }

    const vendorsToRemind = vendors?.filter((vendor) => {
      // Send reminder if:
      // 1. No reminder sent yet, OR
      // 2. Last reminder was sent more than 7 days ago
      if (!vendor.last_reminder_sent_at) {
        return true;
      }

      const daysSinceLastReminder =
        (Date.now() - new Date(vendor.last_reminder_sent_at).getTime()) /
        (1000 * 60 * 60 * 24);

      return daysSinceLastReminder >= 7;
    }) || [];

    // Update reminder count and last reminder sent date
    for (const vendor of vendorsToRemind) {
      await adminSupabase
        .from("vendors")
        .update({
          last_reminder_sent_at: new Date().toISOString(),
          reminder_count: (vendor.reminder_count || 0) + 1,
        })
        .eq("id", vendor.id);

      // TODO: Send email notification here
      // You can integrate with your email service (Resend, SendGrid, etc.)
      console.log(`Reminder sent to vendor ${vendor.business_name} (${vendor.business_email})`);
    }

    return NextResponse.json({
      success: true,
      remindersSent: vendorsToRemind.length,
      vendors: vendorsToRemind.map((v) => ({
        id: v.id,
        business_name: v.business_name,
        business_email: v.business_email,
      })),
    });
  } catch (error: any) {
    console.error("Error sending reminders:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}

