import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client for server-side operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface RateLimitCheck {
  identifier: string;
  actionType: "signup" | "resend";
  maxAttempts?: number;
  windowDuration?: string; // e.g., "1 hour"
}

export async function POST(req: NextRequest) {
  try {
    const { identifier, actionType, maxAttempts = 3, windowDuration = "1 hour" }: RateLimitCheck = await req.json();

    if (!identifier || !actionType) {
      return NextResponse.json(
        { error: "Identifier and actionType are required" },
        { status: 400 }
      );
    }

    // Normalize identifier (email to lowercase)
    const normalizedIdentifier = identifier.toLowerCase();

    // Call the database function to check rate limit
    const { data, error } = await supabaseAdmin.rpc("check_email_rate_limit", {
      p_identifier: normalizedIdentifier,
      p_action_type: actionType,
      p_max_attempts: maxAttempts,
      p_window_duration: windowDuration,
    });

    if (error) {
      // Check if it's a "function not found" error (expected if DB setup not done)
      if (error.code === 'PGRST204' || error.message?.includes('Could not find the function')) {
        console.log("Rate limit function not found, falling back to manual check or allowing request");
        // Fall back to manual check
        return await manualRateLimitCheck(normalizedIdentifier, actionType, maxAttempts);
      }
      console.error("Rate limit check error:", error);
      // For other errors, fall back to manual check
      return await manualRateLimitCheck(normalizedIdentifier, actionType, maxAttempts);
    }

    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error("Rate limit API error:", error);
    return NextResponse.json(
      { error: "Failed to check rate limit", details: error.message },
      { status: 500 }
    );
  }
}

// Fallback manual rate limit check if function doesn't exist
async function manualRateLimitCheck(
  identifier: string,
  actionType: string,
  maxAttempts: number
) {
  try {
    const windowStart = new Date();
    windowStart.setMinutes(0, 0, 0); // Round to current hour

    // Check existing entry
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from("email_rate_limits")
      .select("*")
      .eq("identifier", identifier)
      .eq("action_type", actionType)
      .eq("window_start", windowStart.toISOString())
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Error other than "not found"
      throw fetchError;
    }

    if (existing) {
      // Update existing entry
      const newCount = existing.attempt_count + 1;
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("email_rate_limits")
        .update({
          attempt_count: newCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) throw updateError;

      const windowEnd = new Date(existing.window_start);
      windowEnd.setHours(windowEnd.getHours() + 1);
      const timeUntilReset = Math.max(0, windowEnd.getTime() - Date.now());

      return NextResponse.json({
        success: true,
        is_limited: newCount > maxAttempts,
        attempt_count: newCount,
        max_attempts: maxAttempts,
        time_until_reset_ms: timeUntilReset,
        window_start: existing.window_start,
      });
    } else {
      // Create new entry
      const { data: created, error: createError } = await supabaseAdmin
        .from("email_rate_limits")
        .insert({
          identifier,
          action_type: actionType,
          attempt_count: 1,
          window_start: windowStart.toISOString(),
          window_duration: "1 hour",
        })
        .select()
        .single();

      if (createError) throw createError;

      const windowEnd = new Date(windowStart);
      windowEnd.setHours(windowEnd.getHours() + 1);
      const timeUntilReset = Math.max(0, windowEnd.getTime() - Date.now());

      return NextResponse.json({
        success: true,
        is_limited: false,
        attempt_count: 1,
        max_attempts: maxAttempts,
        time_until_reset_ms: timeUntilReset,
        window_start: windowStart.toISOString(),
      });
    }
  } catch (error: any) {
    // Check if it's a "table not found" error (expected if DB setup not done)
    if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
      console.log("Rate limit table not found, allowing request (graceful degradation)");
      // If table doesn't exist, allow the request (graceful degradation)
      return NextResponse.json({
        success: true,
        is_limited: false,
        attempt_count: 0,
        max_attempts: maxAttempts,
        time_until_reset_ms: 0,
        fallback: true,
      });
    }
    console.error("Manual rate limit check error:", error);
    // For other errors, allow the request (graceful degradation)
    return NextResponse.json({
      success: true,
      is_limited: false,
      attempt_count: 0,
      max_attempts: maxAttempts,
      time_until_reset_ms: 0,
      fallback: true,
    });
  }
}

