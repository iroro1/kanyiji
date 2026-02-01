import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateProductStock } from "@/utils/stockCalculator";

const isMissingColumnError = (error: any) =>
  error?.code === "42703" || /column .* does not exist/i.test(error?.message || "");

const getMissingColumn = (error: any) => {
  const message = error?.message || "";
  const match = message.match(/column (?:\w+\.)?([a-z_]+) does not exist/i);
  return match?.[1] || null;
};

const buildSelect = (fields: string[], includeAttributes: boolean) => {
  const base = fields.join(", ");
  return includeAttributes
    ? `${base}, product_attributes( id, size, color, quantity )`
    : base;
};

const applySort = (
  query: any,
  sortParam: string | null,
  availableFields: Set<string>
) => {
  if (sortParam === "trending" && availableFields.has("rating")) {
    return query.order("rating", { ascending: false });
  }
  if (sortParam === "price-asc" && availableFields.has("price")) {
    return query.order("price", { ascending: true, nullsFirst: false });
  }
  if (sortParam === "price-desc" && availableFields.has("price")) {
    return query.order("price", { ascending: false, nullsFirst: false });
  }
  if (sortParam === "newest" && availableFields.has("updated_at")) {
    return query.order("updated_at", { ascending: false });
  }
  if (availableFields.has("created_at")) {
    return query.order("created_at", { ascending: false });
  }
  return query;
};

// Public API route to fetch products
// Supports filtering by category_id
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client for server-side API routes
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get("category_id");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");
    const sale = searchParams.get("sale");
    const sortParam = searchParams.get("sort");

    const baseFields = [
      "id",
      "name",
      "description",
      "price",
      "original_price",
      "sku",
      "stock_quantity",
      "weight",
      "status",
      "is_featured",
      "is_on_sale",
      "created_at",
      "updated_at",
      "vendor_id",
      "category_id",
      "category",
      "sub_category",
      "rating",
      "review_count",
      "size_guide_url",
      "third_party_return_policy",
    ];
    const baseFieldsSet = new Set(baseFields);

    // Build query - fetch from products table
    let query = supabase
      .from("products")
      .select(buildSelect(baseFields, true))
      .or("status.eq.active,status.eq.approved,status.eq.published");

    // Apply search filter
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Apply featured filter
    if (featured === "true") {
      query = query.eq("is_featured", true);
    }

    // Apply sale filter
    if (sale === "true") {
      query = query.eq("is_on_sale", true);
    }

    // Apply category filter at database level - critical for /categories/[slug] to work
    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    // Apply sorting - CRITICAL: must be done before range() and after all filters
    // Supabase requires order() to be called before range() for proper sorting
    query = applySort(query, sortParam, baseFieldsSet);
    
    console.log("Products API: Sort applied:", {
      sortParam,
      sortType: sortParam === "price-desc" ? "descending (high to low)" : 
                sortParam === "price-asc" ? "ascending (low to high)" : 
                sortParam === "trending" ? "trending (rating)" :
                sortParam === "newest" ? "newest (updated_at)" :
                "default (created_at)"
    });

    // Apply pagination after sorting
    query = query.range(offset, offset + limit - 1);
    
    console.log("Products API: Applied filters and sorting:", {
      search,
      featured,
      sale,
      sortParam,
      limit,
      offset,
    });
      
    // Filter products by status after fetching (to see what statuses exist)
    // We'll filter out inactive/pending products in the response
    
    console.log("Products API: Querying products table with params:", {
      categoryId,
      limit,
      offset,
      statusFilter: "active",
      table: "products",
    });

    // useCategoryFilter: when categoryId is provided, we also run client-side fallback
    // (by category name) if DB filter returns 0 products (e.g. products use text category field)
    let useCategoryFilter = false;
    if (categoryId) {
      useCategoryFilter = true;
    }

    const { data: products, error: productsError } = await query;
    const missingColumn = productsError ? getMissingColumn(productsError) : null;

    const firstProduct = products?.[0] as { id?: string; name?: string; category_id?: string; status?: string; vendor_id?: string } | undefined;
    // Log for debugging
    console.log("Products API - Query result:", {
      categoryId,
      hasFilter: useCategoryFilter,
      productsFound: products?.length || 0,
      limit,
      offset,
      statusFilter: "active or approved",
      error: productsError?.message,
      errorCode: productsError?.code,
      errorDetails: productsError?.details,
      errorHint: productsError?.hint,
      sampleProduct: firstProduct ? {
        id: firstProduct.id,
        name: firstProduct.name,
        category_id: firstProduct.category_id,
        status: firstProduct.status,
        vendor_id: firstProduct.vendor_id,
      } : null,
      allStatuses: products?.map((p: any) => p.status) || [],
    });
    
    // Debug: If no products found, check what statuses exist
    if (!productsError && (!products || products.length === 0)) {
      console.log("Products API: No products found with status 'active' or 'approved'. Checking all products...");
      
      // Try to get all products regardless of status to see what statuses exist
      const { data: allProducts, error: allError } = await supabase
        .from("products")
        .select("id, name, status")
        .limit(10);
      
      if (!allError && allProducts) {
        console.log("Products API: Found products with these statuses:", {
          total: allProducts.length,
          statuses: Array.from(new Set(allProducts.map((p: any) => p.status))),
          products: allProducts.map((p: any) => ({ id: p.id, name: p.name, status: p.status })),
        });
      } else if (allError) {
        console.error("Products API: Error fetching all products:", {
          message: allError.message,
          code: allError.code,
          details: allError.details,
        });
      }
    }

    // If there's an error, return it clearly
    if (productsError) {
      console.error("Products API Error:", {
        message: productsError.message,
        code: productsError.code,
        details: productsError.details,
        hint: productsError.hint,
      });

      if (isMissingColumnError(productsError)) {
        const retryFields = missingColumn
          ? baseFields.filter((field) => field !== missingColumn)
          : [...baseFields];
        const retryFieldsSet = new Set(retryFields);
        const includeAttributes = missingColumn !== "product_attributes";

        let retryQuery = supabase
          .from("products")
          .select(buildSelect(retryFields, includeAttributes));

        if (search) {
          retryQuery = retryQuery.ilike("name", `%${search}%`);
        }
        if (retryFieldsSet.has("status")) {
          retryQuery = retryQuery.or("status.eq.active,status.eq.approved,status.eq.published");
        }
        if (featured === "true" && retryFieldsSet.has("is_featured")) {
          retryQuery = retryQuery.eq("is_featured", true);
        }
        if (sale === "true" && retryFieldsSet.has("is_on_sale")) {
          retryQuery = retryQuery.eq("is_on_sale", true);
        }

        retryQuery = applySort(retryQuery, sortParam, retryFieldsSet);
        retryQuery = retryQuery.range(offset, offset + limit - 1);

        if (categoryId && retryFieldsSet.has("category_id")) {
          retryQuery = retryQuery.eq("category_id", categoryId);
        }

        const { data: retryProducts, error: retryError } = await retryQuery;

        if (!retryError && retryProducts) {
          let list = retryProducts as any[];
          if (categoryId) {
            const { data: cat } = await supabase.from("categories").select("id, name, slug").eq("id", categoryId).single();
            if (cat) {
              const norm = (s: string) => (s || "").toLowerCase().trim().replace(/-/g, " ").replace(/[&]/g, "and").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
              const terms = [norm(cat.name), norm(cat.slug)].filter((t) => t && t.length >= 2);
              const match = (val: string) => val && terms.some((t) => norm(val) === t);
              list = list.filter((p: any) => p.category_id === categoryId || (p.category && match(p.category)) || (p.sub_category && match(p.sub_category)));
            }
          }
          console.log("Retry successful, found products:", list.length);
          const productIds = list.map((p) => p.id);
          let productImages: Record<string, string[]> = {};

          if (productIds.length > 0) {
            const { data: images } = await supabase
              .from("product_images")
              .select("product_id, image_url")
              .in("product_id", productIds)
              .order("sort_order", { ascending: true });

            if (images) {
              images.forEach((img) => {
                if (!productImages[img.product_id]) {
                  productImages[img.product_id] = [];
                }
                productImages[img.product_id].push(img.image_url);
              });
            }
          }

          const enrichedProducts = list.map((product: any) => {
            const calculatedStock = calculateProductStock(product);
            return {
              ...product,
              images: productImages[product.id] || [],
              stock_quantity: calculatedStock,
            };
          });

          return NextResponse.json({
            products: enrichedProducts,
            count: enrichedProducts.length,
          });
        }

        const minimalFields = [
          "id",
          "name",
          "description",
          "price",
          "original_price",
          "sku",
          "stock_quantity",
          "created_at",
          "updated_at",
          "vendor_id",
          "category",
          "sub_category",
        ];
        const minimalFieldsSet = new Set(minimalFields);
        let minimalQuery = supabase
          .from("products")
          .select(buildSelect(minimalFields, false));

        minimalQuery = applySort(minimalQuery, sortParam, minimalFieldsSet);
        minimalQuery = minimalQuery.range(offset, offset + limit - 1);

        const { data: minimalProducts, error: minimalError } = await minimalQuery;

        if (!minimalError && minimalProducts) {
          let minimalList = minimalProducts as any[];
          if (categoryId) {
            const { data: cat } = await supabase.from("categories").select("id, name, slug").eq("id", categoryId).single();
            if (cat) {
              const norm = (s: string) => (s || "").toLowerCase().trim().replace(/-/g, " ").replace(/[&]/g, "and").replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
              const terms = [norm(cat.name), norm(cat.slug)].filter((t) => t && t.length >= 2);
              const match = (val: string) => val && terms.some((t) => norm(val) === t);
              minimalList = minimalList.filter((p: any) => p.category_id === categoryId || (p.category && match(p.category)) || (p.sub_category && match(p.sub_category)));
            }
          }
          const productIds = minimalList.map((p) => p.id);
          let productImages: Record<string, string[]> = {};

          if (productIds.length > 0) {
            const { data: images } = await supabase
              .from("product_images")
              .select("product_id, image_url")
              .in("product_id", productIds)
              .order("sort_order", { ascending: true });

            if (images) {
              images.forEach((img) => {
                if (!productImages[img.product_id]) {
                  productImages[img.product_id] = [];
                }
                productImages[img.product_id].push(img.image_url);
              });
            }
          }

          const enrichedProducts = minimalList.map((product: any) => {
            const calculatedStock = calculateProductStock(product);
            return {
              ...product,
              images: productImages[product.id] || [],
              stock_quantity: calculatedStock,
            };
          });

          return NextResponse.json({
            products: enrichedProducts,
            count: enrichedProducts.length,
          });
        }
      }

      return NextResponse.json(
        { error: "Failed to fetch products", details: productsError.message },
        { status: 500 }
      );
    }

    // If we successfully got products, filter by status
    if (!productsError && products && products.length > 0) {
      // Filter products by status (only active/approved/published)
      const publicProducts = products.filter((p: any) => {
        const status = p.status?.toLowerCase();
        return (
          !status || 
          status === "active" || 
          status === "approved" || 
          status === "published"
        );
      });
      
      console.log("Products API: Status filtering result:", {
        totalFetched: products.length,
        publicProducts: publicProducts.length,
        statusesFound: Array.from(new Set(products.map((p: any) => p.status))),
        allProducts: products.map((p: any) => ({ 
          id: p.id, 
          name: p.name, 
          status: p.status,
          vendor_id: p.vendor_id,
          category: p.category,
          sub_category: p.sub_category,
          category_id: p.category_id,
        })),
      });

      // Apply category filter if provided
      // If category_id filter didn't work, try matching by category name or slug
      let finalProducts = publicProducts;
      if (useCategoryFilter && categoryId) {
        // First try exact category_id match
        let byCategoryId = publicProducts.filter((p: any) => p.category_id === categoryId);
        
        // Fetch category info for name validation (catches wrong category_id assignments)
        let categoryData: { id: string; name: string; slug: string } | null = null;
        try {
          const { data } = await supabase
            .from("categories")
            .select("id, name, slug")
            .eq("id", categoryId)
            .single();
          categoryData = data;
        } catch {
          categoryData = null;
        }
        
        const validateProductBelongsToCategory = (p: any): boolean => {
          if (p.category_id !== categoryId) return false;
          if (!categoryData) return true;
          const norm = (s: string) =>
            (s || "")
              .toLowerCase()
              .trim()
              .replace(/-/g, " ")
              .replace(/[&]/g, "and")
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, " ")
              .trim();
          const expectedTerms = [norm(categoryData.name), norm(categoryData.slug)].filter((t) => t && t.length >= 2);
          const productCat = p.category ? norm(p.category) : "";
          const productSub = p.sub_category ? norm(p.sub_category) : "";
          if (!productCat && !productSub) return true;
          const matches = (val: string) => val && expectedTerms.some((t) => val === t);
          if (productCat && !matches(productCat)) return false;
          if (productSub && !matches(productSub)) return false;
          return true;
        };
        
        finalProducts = byCategoryId.filter(validateProductBelongsToCategory);
        
        // If no results, try matching by category name (products may use text field only)
        if (finalProducts.length === 0 && categoryData) {
          {
              // Normalize category names for better matching (remove special chars, normalize spaces)
              const normalizeCategoryName = (name: string) => {
                return name
                  .toLowerCase()
                  .trim()
                  .replace(/-/g, " ") // "home-decor" -> "home decor" for slug matching
                  .replace(/[&]/g, "and") // Replace & with "and"
                  .replace(/[^a-z0-9\s]/g, "") // Remove special characters
                  .replace(/\s+/g, " ") // Normalize whitespace
                  .trim();
              };
              
              const normalizedCategoryName = normalizeCategoryName(categoryData.name);
              const normalizedCategorySlug = normalizeCategoryName(categoryData.slug);
              const categoryTerms = [normalizedCategoryName, normalizedCategorySlug].filter((t) => t && t.length >= 2);
              
              // Use EXACT match only - prevents "Accessories" matching "Jewelry & Accessories"
              // or "Fashion" matching "Fashion & Textiles" incorrectly
              const productMatchesCategory = (productCategory: string) => {
                if (!productCategory || productCategory.length < 2) return false;
                const norm = normalizeCategoryName(productCategory);
                return categoryTerms.some((term) => norm === term);
              };
              
              // Try matching by category name or slug (for products that only have category name, not category_id)
              finalProducts = publicProducts.filter((p: any) => {
                if (p.category_id === categoryId) return true;
                if (p.category && productMatchesCategory(p.category)) return true;
                if (p.sub_category && productMatchesCategory(p.sub_category)) return true;
                return false;
              });
              
              console.log("Products API: Category name fallback filter:", {
                categoryId,
                categoryName: categoryData.name,
                totalProducts: publicProducts.length,
                filteredProducts: finalProducts.length,
              });
          }
        }
      }

      // Fetch product images
      const finalList = finalProducts as any[];
      const productIds = finalList.map((p) => p.id);
      let productImages: Record<string, string[]> = {};

      if (productIds.length > 0) {
        const { data: images, error: imagesError } = await supabase
          .from("product_images")
          .select("product_id, image_url")
          .in("product_id", productIds)
          .order("sort_order", { ascending: true });

        if (!imagesError && images) {
          images.forEach((img) => {
            if (!productImages[img.product_id]) {
              productImages[img.product_id] = [];
            }
            productImages[img.product_id].push(img.image_url);
          });
        }
      }

      const enrichedProducts = finalList.map((product: any) => {
        const calculatedStock = calculateProductStock(product);
        return {
        ...product,
        images: productImages[product.id] || [],
          stock_quantity: calculatedStock,
        };
      });

      return NextResponse.json({
        products: enrichedProducts,
        count: enrichedProducts.length,
      });
    }

    // If filtering by category_id fails (column doesn't exist or no matches), 
    // fetch all products and filter client-side
    if (productsError || (useCategoryFilter && (!products || products.length === 0))) {
      console.log("Category filter issue - fetching all products:", {
        error: (productsError as any)?.message,
        categoryId,
        productsFound: (products as any[])?.length || 0,
      });
      
      // Fetch products for client-side category filter (no category_id in query)
      let allProductsQuery = supabase
        .from("products")
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          sku,
          stock_quantity,
          status,
          is_featured,
          is_on_sale,
          created_at,
          updated_at,
          vendor_id,
          category_id,
          category,
          sub_category,
          product_attributes( id, size, color, quantity )
        `)
        .or("status.eq.active,status.eq.approved,status.eq.published");
      
      // Apply the same sorting logic as main query
      if (sortParam === "trending") {
        allProductsQuery = allProductsQuery.order("rating", { ascending: false });
      } else if (sortParam === "price-asc") {
        allProductsQuery = allProductsQuery.order("price", { ascending: true, nullsFirst: false });
      } else if (sortParam === "price-desc") {
        allProductsQuery = allProductsQuery.order("price", { ascending: false, nullsFirst: false });
      } else if (sortParam === "newest") {
        allProductsQuery = allProductsQuery.order("updated_at", { ascending: false });
      } else {
        allProductsQuery = allProductsQuery.order("created_at", { ascending: false });
      }
      
      // When filtering by category, fetch all products for client-side filter (no pagination)
      // so we don't miss matches outside the first 50
      if (!categoryId) {
        allProductsQuery = allProductsQuery.range(offset, offset + limit - 1);
      } else {
        allProductsQuery = allProductsQuery.limit(1000);
      }
      
      const { data: allProducts, error: allProductsError } = await allProductsQuery;
      
      if (allProductsError) {
        console.error("Error fetching all products:", allProductsError);
        return NextResponse.json(
          { error: "Failed to fetch products", details: allProductsError.message },
          { status: 500 }
        );
      }
      
      // TEMPORARILY: Show all products regardless of status for debugging
      const publicProducts = allProducts || []; // Show all products for now
      
      console.log("Products API: Fallback - all products:", {
        totalFetched: allProducts?.length || 0,
        statusesFound: Array.from(new Set((allProducts || []).map((p: any) => p.status))),
        allProducts: (allProducts || []).map((p: any) => ({ 
          id: p.id, 
          name: p.name, 
          status: p.status 
        })),
      });
      
      // Filter by category_id on client side if we have products
      let filteredProducts = publicProducts || [];
      if (categoryId && publicProducts) {
        // First try filtering by category_id
        filteredProducts = publicProducts.filter((p: any) => p.category_id === categoryId);
        
        // If no results, try to find category by ID and match by name (for products with category name only)
        if (filteredProducts.length === 0) {
          try {
            const { data: categoryData } = await supabase
              .from("categories")
              .select("id, name, slug")
              .eq("id", categoryId)
              .single();
            
            if (categoryData) {
              // Normalize category names for better matching
              const normalizeCategoryName = (name: string) => {
                return name
                  .toLowerCase()
                  .trim()
                  .replace(/-/g, " ") // "home-decor" -> "home decor" for slug matching
                  .replace(/[&]/g, "and")
                  .replace(/[^a-z0-9\s]/g, "")
                  .replace(/\s+/g, " ")
                  .trim();
              };
              
              const normalizedCategoryName = normalizeCategoryName(categoryData.name);
              const normalizedCategorySlug = normalizeCategoryName(categoryData.slug);
              const categoryTerms = [normalizedCategoryName, normalizedCategorySlug].filter((t) => t && t.length >= 2);
              
              const productMatchesCategory = (productCategory: string) => {
                if (!productCategory || productCategory.length < 2) return false;
                return categoryTerms.some((t) => normalizeCategoryName(productCategory) === t);
              };
              filteredProducts = publicProducts.filter((p: any) => {
                if (p.category_id === categoryId) return true;
                if (p.category && productMatchesCategory(p.category)) return true;
                if (p.sub_category && productMatchesCategory(p.sub_category)) return true;
                return false;
              });
            }
          } catch (err) {
            console.error("Error fetching category for client-side filter:", err);
          }
        }
        
        console.log("Client-side filtered products:", {
          totalProducts: allProducts.length,
          publicProducts: publicProducts.length,
          filteredCount: filteredProducts.length,
          categoryId,
          productCategoryIds: publicProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            sub_category: p.sub_category,
            category_id: p.category_id,
            status: p.status,
          })),
        });
      }
      
      // Fetch images for filtered/all products
      const productIds = filteredProducts.map((p: any) => p.id);
      let productImages: Record<string, string[]> = {};

      if (productIds.length > 0) {
        const { data: images } = await supabase
          .from("product_images")
          .select("product_id, image_url")
          .in("product_id", productIds)
          .order("sort_order", { ascending: true });

        if (images) {
          images.forEach((img) => {
            if (!productImages[img.product_id]) {
              productImages[img.product_id] = [];
            }
            productImages[img.product_id].push(img.image_url);
          });
        }
      }

      // Filter products - only include active/approved/published products for public view
      // But when filtering by category, be more lenient to show products
      const publicFilteredProducts = filteredProducts.filter((p: any) => {
        const status = p.status?.toLowerCase();
        // Include products with no status, or common active statuses
        return (
          !status || 
          status === "active" || 
          status === "approved" || 
          status === "published"
        );
      });

      const enrichedProducts = publicFilteredProducts.map((product: any) => {
        const calculatedStock = calculateProductStock(product);
        return {
        ...product,
        images: productImages[product.id] || [],
          stock_quantity: calculatedStock,
        };
      });

      console.log("Products API: After status filtering (fallback):", {
        totalFetched: filteredProducts.length,
        publicProducts: enrichedProducts.length,
        statusesFound: Array.from(new Set(filteredProducts.map((p: any) => p.status))),
        publicStatuses: Array.from(new Set(enrichedProducts.map((p: any) => p.status))),
      });

      return NextResponse.json({
        products: enrichedProducts,
        count: enrichedProducts.length,
      });
    }

    // Final fallback - when categoryId is provided, never return unfiltered products
    if (categoryId) {
      return NextResponse.json({ products: [], count: 0 });
    }
    const publicProducts = (products || []) as any[];
    console.log("Products API: Final fallback - all products:", {
      totalFetched: publicProducts.length,
      statusesFound: Array.from(new Set(publicProducts.map((p: any) => p.status))),
      allProducts: publicProducts.map((p: any) => ({ 
        id: p.id, 
        name: p.name, 
        status: p.status 
      })),
    });

    // Fetch product images separately
    const productIds = publicProducts.map((p) => p.id);
    let productImages: Record<string, string[]> = {};

    if (productIds.length > 0) {
      const { data: images, error: imagesError } = await supabase
        .from("product_images")
        .select("product_id, image_url")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });

      if (!imagesError && images) {
        images.forEach((img) => {
          if (!productImages[img.product_id]) {
            productImages[img.product_id] = [];
          }
          productImages[img.product_id].push(img.image_url);
        });
      }
    }

    // Enrich products with images and calculate stock
    const enrichedProducts = publicProducts.map((product: any) => {
      const calculatedStock = calculateProductStock(product);
      return {
      ...product,
      images: productImages[product.id] || [],
        stock_quantity: calculatedStock,
      };
    });

    console.log("Products API: Final fallback response:", {
      totalFetched: publicProducts.length,
      publicProducts: enrichedProducts.length,
      statusesFound: Array.from(new Set(publicProducts.map((p: any) => p.status))),
      publicStatuses: Array.from(new Set(enrichedProducts.map((p: any) => p.status))),
    });

    return NextResponse.json({
      products: enrichedProducts,
      count: enrichedProducts.length,
    });
  } catch (error: any) {
    console.error("Error in products API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

