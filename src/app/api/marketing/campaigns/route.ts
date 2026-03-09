import { NextRequest, NextResponse } from "next/server";
import { getMarketingAuth, SERVICE_KEY_REQUIRED } from "../_lib/auth";

export async function GET() {
  try {
    const { authorized, adminSupabase, serviceKeyMissing } = await getMarketingAuth();
    if (serviceKeyMissing) {
      return NextResponse.json({ error: SERVICE_KEY_REQUIRED }, { status: 503 });
    }
    if (!authorized || !adminSupabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: campaigns, error } = await adminSupabase
      .from("marketing_campaigns")
      .select("id, name, subject, status, created_at, sent_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const withCount = await Promise.all(
      (campaigns || []).map(async (c: { id: string }) => {
        const { count } = await adminSupabase
          .from("marketing_campaign_recipients")
          .select("*", { count: "exact", head: true })
          .eq("campaign_id", c.id);
        const row = campaigns!.find((x: { id: string }) => x.id === c.id);
        return { ...row, recipients_count: count ?? 0 };
      })
    );

    return NextResponse.json({ campaigns: withCount });
  } catch (err: unknown) {
    console.error("Marketing campaigns list error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, adminSupabase, serviceKeyMissing } = await getMarketingAuth();
    if (serviceKeyMissing) {
      return NextResponse.json({ error: SERVICE_KEY_REQUIRED }, { status: 503 });
    }
    if (!authorized || !adminSupabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      subject,
      content,
      sender_name,
      sender_email,
    } = body;

    if (!name || !subject) {
      return NextResponse.json(
        { error: "Name and subject required" },
        { status: 400 }
      );
    }

    const { data, error } = await adminSupabase
      .from("marketing_campaigns")
      .insert({
        name: String(name).trim(),
        subject: String(subject).trim(),
        content: content ? String(content) : "",
        sender_name: sender_name ? String(sender_name).trim() : "Kanyiji",
        sender_email: sender_email ? String(sender_email).trim() : "hello@kanyiji.ng",
        status: "draft",
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ campaign: data });
  } catch (err: unknown) {
    console.error("Marketing campaign create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
