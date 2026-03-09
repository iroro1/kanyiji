import { NextRequest, NextResponse } from "next/server";
import { getMarketingAuth, SERVICE_KEY_REQUIRED } from "../../../_lib/auth";

export const dynamic = "force-dynamic";

function sendJson(body: object, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const pathname = req.nextUrl?.pathname ?? "";
    const match = pathname.match(/\/api\/marketing\/groups\/([a-f0-9-]{36})\/members/i);
    const groupId = match?.[1];
    if (!groupId) {
      return sendJson({ error: "Group ID required" }, 400);
    }

    const auth = await getMarketingAuth();
    if (auth.serviceKeyMissing) {
      return sendJson({ error: SERVICE_KEY_REQUIRED }, 503);
    }
    if (!auth.authorized || !auth.adminSupabase) {
      return sendJson({ error: "Unauthorized" }, 403);
    }

    let body: { user_ids?: unknown };
    try {
      body = await req.json();
    } catch {
      return sendJson({ error: "Invalid JSON body" }, 400);
    }

    const user_ids = body?.user_ids;
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return sendJson({ error: "user_ids array required" }, 400);
    }

    const rows = user_ids.map((uid: string) => ({
      group_id: groupId,
      user_id: uid,
    }));

    const { error } = await auth.adminSupabase
      .from("marketing_group_members")
      .upsert(rows, { onConflict: "group_id,user_id" });

    if (error) {
      console.error("Marketing group add members error:", error);
      return sendJson({ error: error.message || "Failed to add members" }, 400);
    }
    return sendJson({ success: true }, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Marketing group add members error:", err);
    return sendJson({ error: message || "Internal server error" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const pathname = req.nextUrl?.pathname ?? "";
    const match = pathname.match(/\/api\/marketing\/groups\/([a-f0-9-]{36})\/members/i);
    const groupId = match?.[1];
    if (!groupId) {
      return sendJson({ error: "Group ID required" }, 400);
    }

    const userId = req.nextUrl?.searchParams?.get("user_id");
    if (!userId) {
      return sendJson({ error: "user_id query required" }, 400);
    }

    const auth = await getMarketingAuth();
    if (auth.serviceKeyMissing) {
      return sendJson({ error: SERVICE_KEY_REQUIRED }, 503);
    }
    if (!auth.authorized || !auth.adminSupabase) {
      return sendJson({ error: "Unauthorized" }, 403);
    }

    const { error } = await auth.adminSupabase
      .from("marketing_group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) {
      console.error("Marketing group remove member error:", error);
      return sendJson({ error: error.message || "Failed to remove" }, 400);
    }
    return sendJson({ success: true }, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Marketing group remove member error:", err);
    return sendJson({ error: message || "Internal server error" }, 500);
  }
}
