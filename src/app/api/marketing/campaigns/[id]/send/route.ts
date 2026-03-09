import { NextRequest, NextResponse } from "next/server";
import { getMarketingAuth, SERVICE_KEY_REQUIRED } from "../../../_lib/auth";
import { sendMarketingEmail } from "@/services/emailService";

export async function POST(
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
    const { id: campaignId } = await params;

    const { data: campaign, error: campError } = await adminSupabase
      .from("marketing_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }
    if (campaign.status === "sent") {
      return NextResponse.json(
        { error: "Campaign already sent" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { target, user_ids, group_id } = body;

    let emails: { email: string; user_id: string | null }[] = [];

    if (target === "all") {
      const { data: profiles } = await adminSupabase
        .from("profiles")
        .select("id, email")
        .not("email", "is", null);
      emails = (profiles || []).map((p: { id: string; email: string }) => ({
        email: p.email,
        user_id: p.id,
      }));
    } else if (target === "selected" && Array.isArray(user_ids) && user_ids.length) {
      const { data: profiles } = await adminSupabase
        .from("profiles")
        .select("id, email")
        .in("id", user_ids);
      emails = (profiles || []).map((p: { id: string; email: string }) => ({
        email: p.email,
        user_id: p.id,
      }));
    } else if (target === "group" && group_id) {
      const { data: members } = await adminSupabase
        .from("marketing_group_members")
        .select("user_id")
        .eq("group_id", group_id);
      const ids = (members || []).map((m: { user_id: string }) => m.user_id);
      if (ids.length) {
        const { data: profiles } = await adminSupabase
          .from("profiles")
          .select("id, email")
          .in("id", ids);
        emails = (profiles || []).map((p: { id: string; email: string }) => ({
          email: p.email,
          user_id: p.id,
        }));
      }
    }

    if (emails.length === 0) {
      return NextResponse.json(
        { error: "No recipients selected" },
        { status: 400 }
      );
    }

    const recipients = emails.map((e) => ({
      campaign_id: campaignId,
      user_id: e.user_id,
      email: e.email,
      status: "pending",
    }));

    const { error: insError } = await adminSupabase
      .from("marketing_campaign_recipients")
      .insert(recipients);

    if (insError) throw insError;

    await adminSupabase
      .from("marketing_campaigns")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", campaignId);

    const fromName = campaign.sender_name || "Kanyiji";
    const fromEmail = campaign.sender_email || "hello@kanyiji.ng";
    const html = campaign.content || "<p>No content.</p>";
    const subject = campaign.subject;

    let sent = 0;
    let failed = 0;
    for (const r of recipients) {
      const result = await sendMarketingEmail({
        to: r.email,
        subject,
        html,
        fromName,
        fromEmail,
      });
      if (result.success) {
        sent++;
        await adminSupabase
          .from("marketing_campaign_recipients")
          .update({ status: "sent" })
          .eq("campaign_id", campaignId)
          .eq("email", r.email);
      } else {
        failed++;
        await adminSupabase
          .from("marketing_campaign_recipients")
          .update({ status: "failed" })
          .eq("campaign_id", campaignId)
          .eq("email", r.email);
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
      total: recipients.length,
    });
  } catch (err: unknown) {
    console.error("Marketing campaign send error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
