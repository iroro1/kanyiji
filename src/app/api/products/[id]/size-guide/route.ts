import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SIZE_GUIDE_EXTENSIONS = ["jpeg", "jpg", "png", "pdf"];
// Also try "style_guide" - some vendors may upload as style guide
const SIZE_GUIDE_FILENAMES = ["size_guide", "style_guide"];

/**
 * GET /api/products/[id]/size-guide
 * Serves size guide for a product. Uses size_guide_url from DB if set;
 * otherwise tries to find file at vendors/{user_id}/products/{product_id}/{size_guide|style_guide}.{ext}
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params?.id?.trim();
    if (!productId || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Fetch product to get size_guide_url and vendor_id
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, size_guide_url, vendor_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // 2. If product has size_guide_url, redirect to the main size-guide handler
    if (product.size_guide_url) {
      const origin = new URL(request.url).origin;
      return NextResponse.redirect(
        `${origin}/api/products/size-guide?url=${encodeURIComponent(product.size_guide_url)}`
      );
    }

    // 3. Try to find size guide in storage: vendors/{user_id}/products/{product_id}/size_guide.{ext}
    // Need vendor's user_id - fetch from vendors table
    const { data: vendor } = await supabase
      .from("vendors")
      .select("user_id")
      .eq("id", product.vendor_id)
      .single();

    if (!vendor?.user_id) {
      return NextResponse.json(
        { error: "Size guide not found for this product" },
        { status: 404 }
      );
    }

    // 3. Try product-level paths: vendors/{user_id}/products/{product_id}/{size_guide|style_guide}.{ext}
    for (const baseName of SIZE_GUIDE_FILENAMES) {
      for (const ext of SIZE_GUIDE_EXTENSIONS) {
        const filePath = `vendors/${vendor.user_id}/products/${productId}/${baseName}.${ext}`;
        const { data: signedUrlData } = await supabase.storage
          .from("vendor-product-images")
          .createSignedUrl(filePath, 3600);

        if (signedUrlData?.signedUrl) {
          return NextResponse.redirect(signedUrlData.signedUrl);
        }
      }
    }

    // 4. Try vendor-level paths: {user_id}/{size_guide|style_guide}.{ext} (flat vendor folder)
    for (const baseName of SIZE_GUIDE_FILENAMES) {
      for (const ext of SIZE_GUIDE_EXTENSIONS) {
        const filePath = `${vendor.user_id}/${baseName}.${ext}`;
        const { data: signedUrlData } = await supabase.storage
          .from("vendor-product-images")
          .createSignedUrl(filePath, 3600);

        if (signedUrlData?.signedUrl) {
          return NextResponse.redirect(signedUrlData.signedUrl);
        }
      }
    }

    // 5. List files in product folder to find any size/style guide (fallback)
    const productFolder = `vendors/${vendor.user_id}/products/${productId}`;
    const { data: productFiles } = await supabase.storage
      .from("vendor-product-images")
      .list(productFolder);

    if (productFiles?.length) {
      const guideFile = productFiles.find(
        (f) =>
          f.name &&
          (f.name.toLowerCase().includes("size_guide") ||
            f.name.toLowerCase().includes("style_guide") ||
            f.name.toLowerCase().includes("size-guide") ||
            f.name.toLowerCase().includes("style-guide"))
      );
      if (guideFile) {
        const filePath = `${productFolder}/${guideFile.name}`;
        const { data: signedUrlData } = await supabase.storage
          .from("vendor-product-images")
          .createSignedUrl(filePath, 3600);
        if (signedUrlData?.signedUrl) {
          return NextResponse.redirect(signedUrlData.signedUrl);
        }
      }
    }

    // 6. Try vendor_id-based path (in case storage uses vendor_id): vendors/{vendor_id}/style_guide.{ext}
    for (const baseName of SIZE_GUIDE_FILENAMES) {
      for (const ext of SIZE_GUIDE_EXTENSIONS) {
        const filePath = `vendors/${product.vendor_id}/${baseName}.${ext}`;
        const { data: signedUrlData } = await supabase.storage
          .from("vendor-product-images")
          .createSignedUrl(filePath, 3600);
        if (signedUrlData?.signedUrl) {
          return NextResponse.redirect(signedUrlData.signedUrl);
        }
      }
    }

    // 7. List vendor folder for any size/style guide (vendor-level file)
    const vendorFolder = `vendors/${vendor.user_id}`;
    const { data: vendorFiles } = await supabase.storage
      .from("vendor-product-images")
      .list(vendorFolder);
    if (vendorFiles?.length) {
      const guideFile = vendorFiles.find(
        (f) =>
          f.name &&
          (f.name.toLowerCase().includes("size_guide") ||
            f.name.toLowerCase().includes("style_guide") ||
            f.name.toLowerCase().includes("size-guide") ||
            f.name.toLowerCase().includes("style-guide"))
      );
      if (guideFile) {
        const filePath = `${vendorFolder}/${guideFile.name}`;
        const { data: signedUrlData } = await supabase.storage
          .from("vendor-product-images")
          .createSignedUrl(filePath, 3600);
        if (signedUrlData?.signedUrl) {
          return NextResponse.redirect(signedUrlData.signedUrl);
        }
      }
    }

    return NextResponse.json(
      { error: "Size guide not found for this product" },
      { status: 404 }
    );
  } catch (e: any) {
    console.error("Product size guide API error:", e);
    return NextResponse.json(
      { error: "Failed to access size guide" },
      { status: 500 }
    );
  }
}
