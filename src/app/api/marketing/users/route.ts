import { NextRequest, NextResponse } from "next/server";
import { getMarketingAuth, SERVICE_KEY_REQUIRED } from "../_lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { authorized, adminSupabase, serviceKeyMissing } = await getMarketingAuth();
    if (serviceKeyMissing) {
      return NextResponse.json({ error: SERVICE_KEY_REQUIRED }, { status: 503 });
    }
    if (!authorized || !adminSupabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role"); // customer | vendor
    const dateFrom = searchParams.get("date_from"); // ISO date
    const dateTo = searchParams.get("date_to");
    const has_orders = searchParams.get("has_orders"); // none | any | high
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = (page - 1) * limit;

    let query = adminSupabase
      .from("profiles")
      .select("id, email, full_name, role, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (role) {
      if (role === "buyer") query = query.eq("role", "customer");
      else if (role === "vendor") query = query.eq("role", "vendor");
      else query = query.eq("role", role);
    }

    if (dateFrom) {
      query = query.gte("created_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("created_at", dateTo + "T23:59:59.999Z");
    }

    const { data: users, error, count } = await query;

    if (error) {
      throw error;
    }

    const userIds = (users || []).map((u: { id: string }) => u.id);

    const [orderCounts, orderTotals, vendorFlags] = await Promise.all([
      userIds.length
        ? Promise.all(
            userIds.map((id) =>
              adminSupabase
                .from("orders")
                .select("*", { count: "exact", head: true })
                .eq("customer_id", id)
            )
          ).then((r) => r.map((x) => x.count ?? 0))
        : [],
      userIds.length
        ? Promise.all(
            userIds.map((id) =>
              adminSupabase
                .from("orders")
                .select("total_amount")
                .eq("customer_id", id)
            )
          ).then((res) =>
            res.map((r) =>
              (r.data || []).reduce((sum: number, o: { total_amount?: number }) => sum + (o.total_amount ?? 0), 0)
            )
          )
        : [],
      userIds.length
        ? Promise.all(
            userIds.map((id) =>
              adminSupabase
                .from("vendors")
                .select("id", { count: "exact", head: true })
                .eq("user_id", id)
            )
          ).then((r) => r.map((x) => (x.count ?? 0) > 0))
        : [],
    ]);

    let list = (users || []).map((u: Record<string, unknown>, i: number) => ({
      ...u,
      total_orders: orderCounts[i] ?? 0,
      total_spent: orderTotals[i] ?? 0,
      is_vendor: vendorFlags[i] ?? false,
      user_type: vendorFlags[i] ? "Vendor" : "Buyer",
      last_active: u.updated_at ?? u.created_at,
    }));

    if (has_orders === "none") {
      list = list.filter((u: { total_orders: number }) => u.total_orders === 0);
    } else if (has_orders === "any") {
      list = list.filter((u: { total_orders: number }) => u.total_orders >= 1);
    } else if (has_orders === "high") {
      list = list.filter((u: { total_orders: number }) => u.total_orders >= 3);
    }

    return NextResponse.json({
      users: list,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    });
  } catch (err: unknown) {
    console.error("Marketing users error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
