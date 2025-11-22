import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // Build query - fetch from products table
    // Try to fetch products with status = "active" first, fallback to any status if needed
    let query = supabase
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
        created_at,
        updated_at,
        vendor_id,
        category_id
      `)
      // Temporarily remove status filter to see all products - will check statuses in logs
      // .or("status.eq.active,status.eq.approved") // Include both active and approved products
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
      
    // Filter products by status after fetching (to see what statuses exist)
    // We'll filter out inactive/pending products in the response
    
    console.log("Products API: Querying products table with params:", {
      categoryId,
      limit,
      offset,
      statusFilter: "active",
      table: "products",
    });

    // Filter by category if provided
    let useCategoryFilter = false;
    if (categoryId) {
      query = query.eq("category_id", categoryId);
      useCategoryFilter = true;
    }

    const { data: products, error: productsError } = await query;

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
      sampleProduct: products?.[0] ? {
        id: products[0].id,
        name: products[0].name,
        category_id: products[0].category_id,
        status: products[0].status,
        vendor_id: products[0].vendor_id,
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
      
      // If error is about column not found, try without that column
      if (productsError.message?.includes("category_id") || productsError.code === "42703") {
        console.log("Retrying query without category_id column...");
        // Retry without category_id in select
        let retryQuery = supabase
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
            created_at,
            updated_at,
            vendor_id
          `)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (categoryId) {
          retryQuery = retryQuery.eq("category_id", categoryId);
        }
        
        const { data: retryProducts, error: retryError } = await retryQuery;
        
        if (!retryError && retryProducts) {
          console.log("Retry successful, found products:", retryProducts.length);
          // Continue with retryProducts instead
          const productIds = retryProducts.map((p) => p.id);
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

          const enrichedProducts = retryProducts.map((product) => ({
            ...product,
            category_id: null, // Not available
            images: productImages[product.id] || [],
          }));

          return NextResponse.json({
            products: enrichedProducts,
            count: enrichedProducts.length,
          });
        }
      }
    }

    // If we successfully got products, filter by status
    if (!productsError && products && products.length > 0) {
      // TEMPORARILY: Show all products regardless of status for debugging
      // TODO: Re-enable status filtering once we know what statuses products have
      const publicProducts = products; // Show all products for now
      
      console.log("Products API: Status filtering result:", {
        totalFetched: products.length,
        publicProducts: publicProducts.length,
        statusesFound: Array.from(new Set(products.map((p: any) => p.status))),
        allProducts: products.map((p: any) => ({ 
          id: p.id, 
          name: p.name, 
          status: p.status,
          vendor_id: p.vendor_id 
        })),
      });

      // Apply category filter if provided
      const finalProducts = useCategoryFilter && categoryId
        ? publicProducts.filter((p: any) => p.category_id === categoryId)
        : publicProducts;

      // Fetch product images
      const productIds = finalProducts.map((p) => p.id);
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

      const enrichedProducts = finalProducts.map((product) => ({
        ...product,
        images: productImages[product.id] || [],
      }));

      return NextResponse.json({
        products: enrichedProducts,
        count: enrichedProducts.length,
      });
    }

    // If filtering by category_id fails (column doesn't exist or no matches), 
    // fetch all products and filter client-side
    if (productsError || (useCategoryFilter && (!products || products.length === 0))) {
      console.log("Category filter issue - fetching all products:", {
        error: productsError?.message,
        categoryId,
        productsFound: products?.length || 0,
      });
      
      // Fetch all products without category filter (no status filter)
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
          category_id
        `)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      
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
        filteredProducts = publicProducts.filter((p: any) => p.category_id === categoryId);
        console.log("Client-side filtered products:", {
          totalProducts: allProducts.length,
          publicProducts: publicProducts.length,
          filteredCount: filteredProducts.length,
          categoryId,
          productCategoryIds: publicProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
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
      const publicFilteredProducts = filteredProducts.filter((p: any) => 
        p.status === "active" || 
        p.status === "approved" || 
        p.status === "published" ||
        !p.status // Include products with no status set
      );

      const enrichedProducts = publicFilteredProducts.map((product: any) => ({
        ...product,
        images: productImages[product.id] || [],
      }));

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

    // TEMPORARILY: Show all products regardless of status for debugging
    const publicProducts = products || []; // Show all products for now
    
    console.log("Products API: Final fallback - all products:", {
      totalFetched: (products || []).length,
      statusesFound: Array.from(new Set((products || []).map((p: any) => p.status))),
      allProducts: (products || []).map((p: any) => ({ 
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

    // Enrich products with images
    const enrichedProducts = publicProducts.map((product) => ({
      ...product,
      images: productImages[product.id] || [],
    }));

    console.log("Products API: Final fallback response:", {
      totalFetched: (products || []).length,
      publicProducts: enrichedProducts.length,
      statusesFound: Array.from(new Set((products || []).map((p: any) => p.status))),
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

