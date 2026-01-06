import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!;

async function getAuthenticatedUser() {
  try {
    const cookieStore = await cookies();
    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
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
    } = await supabase.auth.getSession();

    if (!session) {
      return { user: null };
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    return { user };
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return { user: null };
  }
}

// GET - Get vendor subscription status
export async function GET(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get vendor
    const { data: vendor, error: vendorError } = await adminSupabase
      .from("vendors")
      .select("id, trial_start_date, trial_end_date, subscription_status, paystack_subscription_code, paystack_customer_code, subscription_start_date, subscription_end_date, last_reminder_sent_at, reminder_count")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    // Calculate trial days remaining
    const trialDaysRemaining = vendor.trial_end_date
      ? Math.max(0, Math.ceil((new Date(vendor.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

    // Check if reminder should be sent (30 days before trial ends, weekly)
    const shouldSendReminder = vendor.trial_end_date && 
      trialDaysRemaining <= 30 && 
      trialDaysRemaining > 0 &&
      (!vendor.last_reminder_sent_at || 
       (Date.now() - new Date(vendor.last_reminder_sent_at).getTime()) >= 7 * 24 * 60 * 60 * 1000); // 7 days

    return NextResponse.json({
      vendor: {
        id: vendor.id,
        trialStartDate: vendor.trial_start_date,
        trialEndDate: vendor.trial_end_date,
        subscriptionStatus: vendor.subscription_status,
        subscriptionStartDate: vendor.subscription_start_date,
        subscriptionEndDate: vendor.subscription_end_date,
        trialDaysRemaining,
        hasCardDetails: !!vendor.paystack_customer_code,
        shouldSendReminder,
        reminderCount: vendor.reminder_count || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching subscription status:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription status" },
      { status: 500 }
    );
  }
}

// POST - Initialize Paystack subscription
export async function POST(req: NextRequest) {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get vendor
    const { data: vendor, error: vendorError } = await adminSupabase
      .from("vendors")
      .select("id, business_email, trial_end_date, paystack_customer_code")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const body = await req.json();
    const { email, amount } = body;

    // DEMO MODE: Skip actual Paystack implementation to avoid breaking the app
    // This is a placeholder implementation that returns mock data
    const isDemoMode = !paystackSecretKey || paystackSecretKey.includes("sk_test") || paystackSecretKey === "demo";
    
    if (isDemoMode) {
      // Return mock subscription data
      const mockSubscriptionCode = `SUB_DEMO_${Date.now()}`;
      const mockCustomerCode = vendor.paystack_customer_code || `CUS_DEMO_${Date.now()}`;
      
      // Update vendor with demo subscription details
      await adminSupabase
        .from("vendors")
        .update({
          paystack_subscription_code: mockSubscriptionCode,
          paystack_customer_code: mockCustomerCode,
          subscription_status: "active",
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        })
        .eq("id", vendor.id);

      return NextResponse.json({
        success: true,
        message: "Demo subscription created (Paystack integration pending)",
        subscription: {
          subscription_code: mockSubscriptionCode,
          customer_code: mockCustomerCode,
          status: "active",
        },
      });
    }

    // Production Paystack implementation (commented out for now)
    // Initialize Paystack subscription plan (N5,000 monthly)
    // const subscriptionAmount = amount || 500000; // N5,000 in kobo
    // 
    // const paystackRes = await fetch(
    //   "https://api.paystack.co/subscription",
    //   {
    //     method: "POST",
    //     headers: {
    //       Authorization: `Bearer ${paystackSecretKey}`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       customer: vendor.paystack_customer_code || email || vendor.business_email,
    //       plan: process.env.PAYSTACK_SUBSCRIPTION_PLAN_CODE || "PLAN_CODE_HERE",
    //       authorization: body.authorization_code,
    //     }),
    //   }
    // );
    // 
    // const paystackData = await paystackRes.json();
    // 
    // if (!paystackRes.ok) {
    //   return NextResponse.json(
    //     { error: paystackData.message || "Failed to create subscription" },
    //     { status: paystackRes.status }
    //   );
    // }
    // 
    // await adminSupabase
    //   .from("vendors")
    //   .update({
    //     paystack_subscription_code: paystackData.data.subscription_code,
    //     paystack_customer_code: paystackData.data.customer || vendor.paystack_customer_code,
    //     subscription_status: "active",
    //     subscription_start_date: new Date().toISOString(),
    //     subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    //   })
    //   .eq("id", vendor.id);
    // 
    // return NextResponse.json({
    //   success: true,
    //   subscription: paystackData.data,
    // });
  } catch (error: any) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}

