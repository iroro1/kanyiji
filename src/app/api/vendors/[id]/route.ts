import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateProductStock } from "@/utils/stockCalculator";

// Helper function to normalize business name to slug format
function normalizeToSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[&]/g, "and")
    .replace(/['']/g, "") // Remove apostrophes and smart quotes
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper function to check if a string is a UUID
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

// Public API route to fetch a single vendor by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;

    if (!identifier) {
      return NextResponse.json(
        { error: "Vendor identifier is required" },
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

    let vendor;
    let vendorError;

    // Check if identifier is a UUID or a slug/name
    if (isUUID(identifier)) {
      // Fetch vendor by ID - only approved vendors for public view
      // Explicitly select logo_url to ensure it's included
      const result = await supabase
        .from("vendors")
        .select("*, logo_url")
        .eq("id", identifier)
        .eq("status", "approved")
        .single();
      vendor = result.data;
      vendorError = result.error;
      
      // Debug: Log raw vendor data from database
      console.log("Vendor API: Raw vendor data from DB (UUID lookup):", {
        vendorId: identifier,
        hasVendor: !!vendor,
        logo_url: vendor?.logo_url,
        logo_url_type: typeof vendor?.logo_url,
        allKeys: vendor ? Object.keys(vendor) : [],
      });
    } else {
      // Fetch vendor by business name (normalized to slug format)
      // Decode URL-encoded characters first (e.g., %27 for apostrophe)
      const decodedIdentifier = decodeURIComponent(identifier);
      const normalizedSlug = normalizeToSlug(decodedIdentifier);
      
      console.log("Vendor API: Slug lookup:", {
        originalIdentifier: identifier,
        decodedIdentifier,
        normalizedSlug,
      });
      
      // Fetch all approved vendors and filter by normalized business name
      // Explicitly select logo_url to ensure it's included
      const { data: allVendors, error: fetchError } = await supabase
        .from("vendors")
        .select("*, logo_url")
        .eq("status", "approved");

      if (fetchError) {
        vendorError = fetchError;
      } else if (allVendors) {
        // Find vendor by matching normalized business name
        vendor = allVendors.find((v) => {
          const vendorSlug = normalizeToSlug(v.business_name || "");
          const matches = vendorSlug === normalizedSlug;
          if (matches) {
            console.log("Vendor API: Found vendor match:", {
              businessName: v.business_name,
              vendorSlug,
              normalizedSlug,
              logo_url: v.logo_url,
            });
          }
          return matches;
        });

        if (!vendor) {
          console.log("Vendor API: No vendor found. Available vendors:", 
            allVendors.map((v: any) => ({
              business_name: v.business_name,
              slug: normalizeToSlug(v.business_name || ""),
            }))
          );
          vendorError = { code: "PGRST116", message: "Vendor not found" };
        } else {
          // Debug: Log raw vendor data from database
          console.log("Vendor API: Raw vendor data from DB (slug lookup):", {
            identifier,
            normalizedSlug,
            hasVendor: !!vendor,
            logo_url: vendor?.logo_url,
            allKeys: vendor ? Object.keys(vendor) : [],
            vendorData: vendor,
          });
        }
      }
    }

    if (vendorError || !vendor) {
      console.error("Vendors API: Error fetching vendor:", {
        message: vendorError?.message,
        code: vendorError?.code,
        details: vendorError?.details,
        identifier,
      });

      if (vendorError?.code === "PGRST116" || !vendor) {
        // Not found
        return NextResponse.json(
          { error: "Vendor not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Failed to fetch vendor", details: vendorError?.message },
        { status: 500 }
      );
    }

    const vendorId = vendor.id;

    // Fetch active/approved/published products for this vendor with product_attributes
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*, product_attributes( id, size, color, quantity )")
      .eq("vendor_id", vendorId)
      .or("status.eq.active,status.eq.approved,status.eq.published")
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

    // Enrich products with images and calculate stock from attributes
    const enrichedProducts = (products || []).map((product: any) => {
      const calculatedStock = calculateProductStock(product);
      return {
      id: product.id,
      name: product.name,
      description: product.description || product.short_description || "",
      price: product.price,
      original_price: product.original_price || null,
      sku: product.sku || null,
        stock_quantity: calculatedStock,
      status: product.status,
      is_featured: product.is_featured || false,
      is_on_sale: product.is_on_sale || false,
      category_id: product.category_id || null,
      images: productImages[product.id] || [],
      };
    });

    // Map vendor data - handle columns that may not exist
    // logo_url is the database column where the logo is stored
    // Pass it through directly without filtering
    const enrichedVendor = {
      id: vendor.id,
      business_name: vendor.business_name,
      business_description: vendor.business_description || "",
      business_type: vendor.business_type || "",
      // logo_url is the database column - pass it through directly
      logo_url: vendor.logo_url || null,
      // image_url should use logo_url first, then fallback to other fields
      image_url: vendor.logo_url || vendor.business_logo || vendor.business_banner || vendor.logo || vendor.image_url || vendor.avatar || null,
      product_count: enrichedProducts.length,
      status: vendor.status,
      created_at: vendor.created_at,
      rating: vendor.rating ? parseFloat(vendor.rating) : 0,
      total_reviews: vendor.total_reviews || 0,
      // Include any other fields that might exist
      owner_name: vendor.owner_name || vendor.full_name || null,
      email: vendor.email || null,
      phone: vendor.phone || null,
      location: vendor.location || vendor.address || null,
    };

    // Debug logging for logo_url
    console.log("Vendor API: Logo URL debug:", {
      vendorId: vendor.id,
      businessName: vendor.business_name,
      rawLogoUrl: vendor.logo_url,
      logoUrlType: typeof vendor.logo_url,
      logoUrlValue: vendor.logo_url,
      enrichedLogoUrl: enrichedVendor.logo_url,
      enrichedImageUrl: enrichedVendor.image_url,
      allVendorKeys: Object.keys(vendor),
    });

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

