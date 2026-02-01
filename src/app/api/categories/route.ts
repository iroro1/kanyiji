import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const isMissingColumnError = (error: any) =>
  error?.code === "42703" || /column .* does not exist/i.test(error?.message || "");

const getMissingColumn = (error: any) => {
  const message = error?.message || "";
  const match = message.match(/column (?:\w+\.)?([a-z_]+) does not exist/i);
  return match?.[1] || null;
};

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value
  );

// Public API route to fetch categories
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get optional query parameters
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const featured = searchParams.get("featured");
    const slug = searchParams.get("slug");

    const categorySelect = "id, name, slug, description, image_url";
    const categorySelectMinimal = "id, name, slug";
    const categorySelectFallback = "id, name";

    const runSingleCategoryQuery = async (
      buildQuery: (select: string, useActive: boolean) => any
    ) => {
      const attempts = [
        { select: categorySelect, useActive: true },
        { select: categorySelect, useActive: false },
        { select: categorySelectMinimal, useActive: false },
        { select: categorySelectFallback, useActive: false },
      ];

      let lastError: any = null;
      let missingColumn: string | null = null;

      for (const attempt of attempts) {
        const { data, error } = await buildQuery(attempt.select, attempt.useActive);
        if (!error) {
          return { category: data?.[0] || null, error: null, missingColumn: null };
        }
        lastError = error;
        if (!isMissingColumnError(error)) {
          break;
        }
        missingColumn = getMissingColumn(error) || missingColumn;
      }

      return { category: null, error: lastError, missingColumn };
    };

    // If slug is provided, fetch a single category
    if (slug) {
      // Normalize slug: remove trailing dashes and convert to lowercase
      const normalizedSlug = slug.trim().toLowerCase().replace(/-+$/, ""); // Remove trailing dashes
      const slugIsId = isUuid(normalizedSlug);
      const slugCandidates = [normalizedSlug];
      if (slug.trim().toLowerCase() !== normalizedSlug) {
        slugCandidates.push(slug.trim().toLowerCase());
      }
      
      let category: any = null;
      let error: any = null;
      let slugColumnMissing = false;

      if (slugIsId) {
        const result = await runSingleCategoryQuery((select, useActive) => {
          let query = supabase.from("categories").select(select).eq("id", normalizedSlug);
          if (useActive) {
            query = query.eq("is_active", true);
          }
          return query.limit(1);
        });
        category = result.category;
        error = result.error;
      }

      // Try exact match with normalized slug
      if (!category) {
        for (const candidate of slugCandidates) {
          const result = await runSingleCategoryQuery((select, useActive) => {
            let query = supabase.from("categories").select(select).eq("slug", candidate);
            if (useActive) {
              query = query.eq("is_active", true);
            }
            return query.limit(1);
          });
          if (result.category) {
            category = result.category;
            error = null;
            break;
          }
          if (result.missingColumn === "slug") {
            slugColumnMissing = true;
            error = result.error;
            break;
          }
          error = result.error;
        }
      }

      // Try partial slug match if slug column exists
      if (!category && !slugColumnMissing) {
        const result = await runSingleCategoryQuery((select, useActive) => {
          let query = supabase.from("categories").select(select).ilike("slug", `${normalizedSlug}%`);
          if (useActive) {
            query = query.eq("is_active", true);
          }
          return query.limit(1);
        });
        if (result.category) {
          category = result.category;
          error = null;
        } else {
          if (result.missingColumn === "slug") {
            slugColumnMissing = true;
          }
          error = result.error;
        }
      }

      // If still not found, try matching by category name (case-insensitive partial match)
      if (!category) {
        const searchTerm = normalizedSlug.replace(/-/g, " ");
        const result = await runSingleCategoryQuery((select, useActive) => {
          let query = supabase
            .from("categories")
            .select(select)
            .or(`name.ilike.%${searchTerm}%,name.ilike.%${normalizedSlug}%`);
          if (useActive) {
            query = query.eq("is_active", true);
          }
          return query.limit(1);
        });
        if (result.category) {
          category = result.category;
          error = null;
        } else {
          error = result.error;
        }
      }

      if (error && !isMissingColumnError(error)) {
        console.error("Get category by slug error:", error);
        return NextResponse.json(
          { error: error?.message || "Failed to fetch category", category: null },
          { status: 500 }
        );
      }

      if (!category) {
        return NextResponse.json(
          { error: "Category not found", category: null },
          { status: 404 }
        );
      }

      // Calculate actual product count for this category dynamically
      const { data: allProducts, error: productsError } = await supabase
        .from("products")
        .select("id, category_id, category, sub_category, status");

      let productCount = 0;
      if (!productsError && allProducts) {
        // Normalize category names for matching (hyphen->space so "home-decor" matches "Home Decor")
        const normalizeCategoryName = (name: string) => {
          return name
            .toLowerCase()
            .trim()
            .replace(/-/g, " ")
            .replace(/[&]/g, "and")
            .replace(/[^a-z0-9\s]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        };

        const normalizedCategoryName = normalizeCategoryName(category?.name ?? "");
        const normalizedCategorySlug = normalizeCategoryName(category?.slug ?? category?.name ?? "");

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

      if (productsError && isMissingColumnError(productsError)) {
        return NextResponse.json({
          category: {
            ...category,
            product_count: 0,
          },
        });
      }

      return NextResponse.json({
        category: {
          ...category,
          product_count: productCount,
        },
      });
    }

    // Otherwise, fetch all categories
    const listAttempts = [
      { select: categorySelect, useActive: true, useSortOrder: true },
      { select: categorySelect, useActive: true, useSortOrder: false },
      { select: categorySelect, useActive: false, useSortOrder: false },
      { select: categorySelectMinimal, useActive: false, useSortOrder: false },
      { select: categorySelectFallback, useActive: false, useSortOrder: false },
    ];

    let categories: any[] | null = null;
    let listError: any = null;

    for (const attempt of listAttempts) {
      let query = supabase.from("categories").select(attempt.select);
      if (attempt.useActive) {
        query = query.eq("is_active", true);
      }
      if (attempt.useSortOrder) {
        query = query.order("sort_order", { ascending: true });
      }
      query = query.order("name", { ascending: true });

      // Limit results if specified
      if (limit) {
        const limitNum = parseInt(limit, 10);
        if (!isNaN(limitNum) && limitNum > 0) {
          query = query.limit(limitNum);
        }
      }

      const { data, error } = await query;
      if (!error) {
        categories = data || [];
        listError = null;
        break;
      }

      listError = error;
      if (!isMissingColumnError(error)) {
        break;
      }
    }

    if (listError) {
      throw listError;
    }

    // Calculate actual product counts for each category dynamically
    // This ensures accuracy since products can match by category_id, category, or sub_category
    if (categories && categories.length > 0) {
      // Fetch all products to count (we'll filter client-side)
      const { data: allProducts, error: productsError } = await supabase
        .from("products")
        .select("id, category_id, category, sub_category, status");

      if (!productsError && allProducts) {
        // Normalize category names for matching (hyphen->space so "home-decor" matches "Home Decor")
        const normalizeCategoryName = (name: string) => {
          return name
            .toLowerCase()
            .trim()
            .replace(/-/g, " ")
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
          const normalizedCategoryName = normalizeCategoryName(cat?.name ?? "");
          const normalizedCategorySlug = normalizeCategoryName(cat?.slug ?? cat?.name ?? "");

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

