import { NextRequest, NextResponse } from "next/server";
import { getMarketingAuth, SERVICE_KEY_REQUIRED } from "../../_lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized, adminSupabase, serviceKeyMissing } = await getMarketingAuth();
    if (serviceKeyMissing) {
      return NextResponse.json({ error: SERVICE_KEY_REQUIRED }, { status: 503 });
    }
    if (!authorized || !adminSupabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;

    const { data: group, error } = await adminSupabase
      .from("marketing_groups")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const { data: members } = await adminSupabase
      .from("marketing_group_members")
      .select("user_id")
      .eq("group_id", id);
    const userIds = (members || []).map((m: { user_id: string }) => m.user_id);

    let profiles: unknown[] = [];
    if (userIds.length) {
      const { data: p } = await adminSupabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds);
      profiles = p || [];
    }

    return NextResponse.json({ group, members: profiles });
  } catch (err: unknown) {
    console.error("Marketing group get error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const sendJson = (body: object, status: number) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    });

  try {
    const pathname = req.nextUrl?.pathname ?? "";
    const match = pathname.match(/\/api\/marketing\/groups\/([a-f0-9-]{36})/i);
    const id = match?.[1];
    if (!id) {
      return sendJson({ error: "Group ID required" }, 400);
    }

    const auth = await getMarketingAuth();
    if (auth.serviceKeyMissing) {
      return sendJson({ error: SERVICE_KEY_REQUIRED }, 503);
    }
    if (!auth.authorized || !auth.adminSupabase) {
      return sendJson({ error: "Unauthorized" }, 403);
    }

    const adminSupabase = auth.adminSupabase;

    const membersResult = await adminSupabase
      .from("marketing_group_members")
      .delete()
      .eq("group_id", id);
    if (membersResult.error) {
      console.error("Marketing group delete members error:", membersResult.error);
    }

    const groupResult = await adminSupabase
      .from("marketing_groups")
      .delete()
      .eq("id", id);

    if (groupResult.error) {
      console.error("Marketing group delete error:", groupResult.error);
      return sendJson(
        { error: groupResult.error.message || "Failed to delete group" },
        400
      );
    }

    return sendJson({ success: true }, 200);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Marketing group DELETE error:", err);
    return sendJson(
      { error: message || "Internal server error" },
      500
    );
  }
}
