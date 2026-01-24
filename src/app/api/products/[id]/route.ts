import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateProductStock } from "@/utils/stockCalculator";

const isUuid = (v: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

/** GET /api/products/[id] – fetch a single product by id or slug */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params?.id?.trim();
    if (!id) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const select =
      "*, product_images( id, image_url ), product_attributes( id, size, color, quantity )";
    let q = supabase
      .from("products")
      .select(select)
      .or("status.eq.active,status.eq.approved,status.eq.published");

    if (isUuid(id)) {
      q = q.eq("id", id);
    } else {
      q = q.eq("slug", id);
    }

    const { data: row, error } = await q.single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      console.error("Single product API error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch product" },
        { status: 500 }
      );
    }

    if (!row) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product: any = { ...row };
    product.stock_quantity = calculateProductStock(product);
    product.product_images = product.product_images ?? [];
    product.product_attributes = product.product_attributes ?? [];

    return NextResponse.json({ product });
  } catch (e: any) {
    console.error("Single product API error:", e);
    return NextResponse.json(
      { error: e?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
