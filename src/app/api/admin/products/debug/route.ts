import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkAdminAccess() {
  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore cookie errors
        }
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { authorized: false, adminSupabase: null };
  }

  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { authorized: false, adminSupabase: null };
  }

  return { authorized: true, adminSupabase };
}

// Debug endpoint to check products and categories
export async function GET(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category_slug");

    // Get category by slug
    let category = null;
    if (categorySlug) {
      const { data: categoryData, error: categoryError } = await adminSupabase
        .from("categories")
        .select("*")
        .eq("slug", categorySlug)
        .single();

      if (!categoryError && categoryData) {
        category = categoryData;
      }
    }

    // Get all categories
    const { data: allCategories } = await adminSupabase
      .from("categories")
      .select("id, name, slug, product_count")
      .eq("is_active", true)
      .order("name");

    // Get all active products with category_id
    const { data: allProducts, error: productsError } = await adminSupabase
      .from("products")
      .select("id, name, status, category_id")
      .order("created_at", { ascending: false })
      .limit(100);

    // Get active products for the category if category is provided
    let categoryProducts = [];
    if (category) {
      const { data: catProducts, error: catProductsError } = await adminSupabase
        .from("products")
        .select("id, name, status, category_id")
        .eq("category_id", category.id)
        .eq("status", "active");

      if (!catProductsError && catProducts) {
        categoryProducts = catProducts;
      }
    }

    return NextResponse.json({
      category,
      allCategories: allCategories || [],
      allProducts: allProducts?.map((p: any) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        category_id: p.category_id,
        hasCategoryId: !!p.category_id,
      })) || [],
      categoryProducts: categoryProducts || [],
      debug: {
        categorySlug,
        categoryId: category?.id,
        totalCategories: allCategories?.length || 0,
        totalProducts: allProducts?.length || 0,
        activeProductsWithCategoryId: allProducts?.filter((p: any) => p.status === "active" && p.category_id).length || 0,
        categoryProductsCount: categoryProducts.length,
        productsError: productsError?.message,
      },
    });
  } catch (error: any) {
    console.error("Debug endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

