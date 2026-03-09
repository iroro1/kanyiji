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

    const { data: groups, error } = await adminSupabase
      .from("marketing_groups")
      .select("id, name, description, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const withCount = await Promise.all(
      (groups || []).map(async (g: { id: string }) => {
        const { count } = await adminSupabase
          .from("marketing_group_members")
          .select("*", { count: "exact", head: true })
          .eq("group_id", g.id);
        return { ...(groups!.find((x: { id: string }) => x.id === g.id)), members_count: count ?? 0 };
      })
    );

    return NextResponse.json({ groups: withCount });
  } catch (err: unknown) {
    console.error("Marketing groups list error:", err);
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
    const { name, description } = body;
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }

    const { data, error } = await adminSupabase
      .from("marketing_groups")
      .insert({ name: name.trim(), description: (description || "").trim() })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ group: data });
  } catch (err: unknown) {
    console.error("Marketing group create error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
