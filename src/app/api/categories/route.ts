import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public API route to fetch categories
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get optional query parameters
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const featured = searchParams.get("featured");
    const slug = searchParams.get("slug");

    // If slug is provided, fetch a single category
    if (slug) {
      const { data: category, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, image_url, product_count")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Get category by slug error:", error);
        return NextResponse.json(
          { error: error.message || "Category not found", category: null },
          { status: 404 }
        );
      }

      return NextResponse.json({
        category: category,
      });
    }

    // Otherwise, fetch all categories
    let query = supabase
      .from("categories")
      .select("id, name, slug, description, image_url, product_count")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    // Limit results if specified
    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    const { data: categories, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      categories: categories || [],
    });
  } catch (error: any) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", categories: [] },
      { status: 500 }
    );
  }
}

