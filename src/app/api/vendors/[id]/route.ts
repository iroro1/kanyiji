import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public API route to fetch a single vendor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendorId = params.id;

    if (!vendorId) {
      return NextResponse.json(
        { error: "Vendor ID is required" },
        { status: 400 }
      );
    }

    // Create a server-side Supabase client for API routes
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Vendors API: Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch vendor by ID - only approved vendors for public view
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("*")
      .eq("id", vendorId)
      .eq("status", "approved")
      .single();

    if (vendorError) {
      console.error("Vendors API: Error fetching vendor:", {
        message: vendorError.message,
        code: vendorError.code,
        details: vendorError.details,
      });

      if (vendorError.code === "PGRST116") {
        // Not found
        return NextResponse.json(
          { error: "Vendor not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch vendor", details: vendorError.message },
        { status: 500 }
      );
    }

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Fetch active products for this vendor
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("vendor_id", vendorId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (productsError) {
      console.error("Vendors API: Error fetching products:", productsError);
      // Continue without products if error
    }

    // Fetch product images
    const productIds = products?.map((p) => p.id) || [];
    const productImages: Record<string, string[]> = {};

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

    // Enrich products with images
    const enrichedProducts = (products || []).map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description || product.short_description || "",
      price: product.price,
      original_price: product.original_price || null,
      sku: product.sku || null,
      stock_quantity: product.stock_quantity || 0,
      status: product.status,
      is_featured: product.is_featured || false,
      is_on_sale: product.is_on_sale || false,
      category_id: product.category_id || null,
      images: productImages[product.id] || [],
    }));

    // Map vendor data - handle columns that may not exist
    const enrichedVendor = {
      id: vendor.id,
      business_name: vendor.business_name,
      business_description: vendor.business_description || "",
      business_type: vendor.business_type || "",
      // Try different possible column names for logo/image
      image_url: vendor.business_logo || vendor.business_banner || vendor.logo || vendor.image_url || vendor.avatar || null,
      product_count: enrichedProducts.length,
      status: vendor.status,
      created_at: vendor.created_at,
      // Include any other fields that might exist
      owner_name: vendor.owner_name || vendor.full_name || null,
      email: vendor.email || null,
      phone: vendor.phone || null,
      location: vendor.location || vendor.address || null,
    };

    return NextResponse.json({
      vendor: enrichedVendor,
      products: enrichedProducts,
    });
  } catch (error: any) {
    console.error("Error in vendors API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

