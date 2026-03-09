import { NextRequest, NextResponse } from "next/server";
import { getMarketingAuth, SERVICE_KEY_REQUIRED } from "../../_lib/auth";

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

    const { data: campaign, error } = await adminSupabase
      .from("marketing_campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    return NextResponse.json({ campaign });
  } catch (err: unknown) {
    console.error("Marketing campaign get error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
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
    const body = await req.json();
    const { name, subject, content, sender_name, sender_email } = body;

    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = String(name).trim();
    if (subject !== undefined) update.subject = String(subject).trim();
    if (content !== undefined) update.content = String(content);
    if (sender_name !== undefined) update.sender_name = String(sender_name).trim();
    if (sender_email !== undefined) update.sender_email = String(sender_email).trim();

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: campaign, error } = await adminSupabase
      .from("marketing_campaigns")
      .update(update)
      .eq("id", id)
      .eq("status", "draft")
      .select()
      .single();

    if (error) throw error;
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found or not a draft" }, { status: 404 });
    }
    return NextResponse.json({ campaign });
  } catch (err: unknown) {
    console.error("Marketing campaign update error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
