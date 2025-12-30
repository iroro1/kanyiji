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
      // Normalize slug: remove trailing dashes and convert to lowercase
      const normalizedSlug = slug.trim().toLowerCase().replace(/-+$/, ''); // Remove trailing dashes
      
      // First try exact match with normalized slug
      let { data: category, error } = await supabase
        .from("categories")
        .select("id, name, slug, description, image_url, product_count")
        .eq("slug", normalizedSlug)
        .eq("is_active", true)
        .single();

      // If not found, try with original slug (in case it has trailing dash)
      if (error && slug !== normalizedSlug) {
        const { data: categoryAlt, error: errorAlt } = await supabase
          .from("categories")
          .select("id, name, slug, description, image_url, product_count")
          .eq("slug", slug.trim().toLowerCase())
          .eq("is_active", true)
          .single();
        
        if (!errorAlt && categoryAlt) {
          category = categoryAlt;
          error = null;
        }
      }

      // If still not found, try partial match (slug starts with normalized slug)
      if (error) {
        const { data: categories, error: partialError } = await supabase
          .from("categories")
          .select("id, name, slug, description, image_url, product_count")
          .eq("is_active", true)
          .ilike("slug", `${normalizedSlug}%`); // Case-insensitive partial match
        
        if (!partialError && categories && categories.length > 0) {
          // Use the first matching category
          category = categories[0];
          error = null;
        }
      }

      // If still not found, try matching by category name (case-insensitive partial match)
      if (error) {
        // Generate a slug-like string from the search term (e.g., "fashion" -> "fashion")
        const searchTerm = normalizedSlug.replace(/-/g, ' '); // Replace dashes with spaces for name matching
        
        const { data: categories, error: nameError } = await supabase
          .from("categories")
          .select("id, name, slug, description, image_url, product_count")
          .eq("is_active", true)
          .or(`name.ilike.%${searchTerm}%,name.ilike.%${normalizedSlug}%`);
        
        if (!nameError && categories && categories.length > 0) {
          // Find the best match (exact name match or contains the search term)
          const exactMatch = categories.find(cat => 
            cat.name.toLowerCase().includes(searchTerm) || 
            cat.name.toLowerCase().includes(normalizedSlug)
          );
          category = exactMatch || categories[0];
          error = null;
        }
      }

      if (error || !category) {
        console.error("Get category by slug error:", error);
        return NextResponse.json(
          { error: error?.message || "Category not found", category: null },
          { status: 404 }
        );
      }

      // Calculate actual product count for this category dynamically
      const { data: allProducts, error: productsError } = await supabase
        .from("products")
        .select("id, category_id, category, sub_category, status");

      let productCount = 0;
      if (!productsError && allProducts) {
        // Normalize category names for matching
        const normalizeCategoryName = (name: string) => {
          return name
            .toLowerCase()
            .trim()
            .replace(/[&]/g, "and")
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        };

        const normalizedCategoryName = normalizeCategoryName(category.name);
        const normalizedCategorySlug = normalizeCategoryName(category.slug);

        // Filter products by status and match to category
        const matchingProducts = allProducts.filter((p: any) => {
          const status = p.status?.toLowerCase();
          if (status && status !== "active" && status !== "approved" && status !== "published") {
            return false;
          }

          // Match by category_id
          if (p.category_id === category.id) return true;

          // Match by category name
          if (p.category) {
            const normalizedProductCategory = normalizeCategoryName(p.category);
            if (
              normalizedProductCategory === normalizedCategoryName ||
              normalizedProductCategory === normalizedCategorySlug ||
              normalizedProductCategory.includes(normalizedCategoryName) ||
              normalizedCategoryName.includes(normalizedProductCategory)
            ) {
              return true;
            }
          }

          // Match by sub_category
          if (p.sub_category) {
            const normalizedProductSubCategory = normalizeCategoryName(p.sub_category);
            if (
              normalizedProductSubCategory === normalizedCategoryName ||
              normalizedProductSubCategory === normalizedCategorySlug ||
              normalizedProductSubCategory.includes(normalizedCategoryName) ||
              normalizedCategoryName.includes(normalizedProductSubCategory)
            ) {
              return true;
            }
          }

          return false;
        });

        productCount = matchingProducts.length;
      }

      return NextResponse.json({
        category: {
          ...category,
          product_count: productCount,
        },
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

    // Calculate actual product counts for each category dynamically
    // This ensures accuracy since products can match by category_id, category, or sub_category
    if (categories && categories.length > 0) {
      // Fetch all products to count (we'll filter client-side)
      const { data: allProducts, error: productsError } = await supabase
        .from("products")
        .select("id, category_id, category, sub_category, status");

      if (!productsError && allProducts) {
        // Normalize category names for matching
        const normalizeCategoryName = (name: string) => {
          return name
            .toLowerCase()
            .trim()
            .replace(/[&]/g, "and")
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        };

        // Filter products by status (only active/approved/published)
        const activeProducts = allProducts.filter((p: any) => {
          const status = p.status?.toLowerCase();
          return (
            !status ||
            status === "active" ||
            status === "approved" ||
            status === "published"
          );
        });

        // Calculate product count for each category
        const categoriesWithCounts = categories.map((cat: any) => {
          const normalizedCategoryName = normalizeCategoryName(cat.name);
          const normalizedCategorySlug = normalizeCategoryName(cat.slug);

          const productCount = activeProducts.filter((p: any) => {
            // Match by category_id
            if (p.category_id === cat.id) return true;

            // Match by category name
            if (p.category) {
              const normalizedProductCategory = normalizeCategoryName(p.category);
              if (
                normalizedProductCategory === normalizedCategoryName ||
                normalizedProductCategory === normalizedCategorySlug ||
                normalizedProductCategory.includes(normalizedCategoryName) ||
                normalizedCategoryName.includes(normalizedProductCategory)
              ) {
                return true;
              }
            }

            // Match by sub_category
            if (p.sub_category) {
              const normalizedProductSubCategory = normalizeCategoryName(p.sub_category);
              if (
                normalizedProductSubCategory === normalizedCategoryName ||
                normalizedProductSubCategory === normalizedCategorySlug ||
                normalizedProductSubCategory.includes(normalizedCategoryName) ||
                normalizedCategoryName.includes(normalizedProductSubCategory)
              ) {
                return true;
              }
            }

            return false;
          }).length;

          return {
            ...cat,
            product_count: productCount,
          };
        });

        return NextResponse.json({
          categories: categoriesWithCounts,
        });
      }
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

