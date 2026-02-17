import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * GET /api/products/size-guide?url=<encoded_size_guide_url>
 * Returns a signed URL for the size guide file or redirects to it.
 * Size guides are in vendor-product-images bucket; if bucket is private,
 * we need signed URLs for access.
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sizeGuideUrl = searchParams.get("url");

    if (!sizeGuideUrl) {
      return NextResponse.json(
        { error: "Size guide URL is required" },
        { status: 400 }
      );
    }

    const decodedUrl = decodeURIComponent(sizeGuideUrl);

    // Validate URL points to our vendor-product-images bucket
    if (!decodedUrl.includes("vendor-product-images")) {
      return NextResponse.json(
        { error: "Invalid size guide URL" },
        { status: 400 }
      );
    }

    // Extract file path: everything after "vendor-product-images/"
    const bucketMatch = decodedUrl.match(/vendor-product-images\/(.+?)(?:\?|$)/);
    const filePath = bucketMatch ? bucketMatch[1].split("?")[0] : null;

    if (!filePath) {
      return NextResponse.json(
        { error: "Could not extract file path from URL" },
        { status: 400 }
      );
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: signedUrlData, error: signedUrlError } = await adminSupabase.storage
      .from("vendor-product-images")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (signedUrlError) {
      console.error("Size guide signed URL error:", signedUrlError);
      // Fallback: redirect to original URL (works if bucket is public)
      return NextResponse.redirect(decodedUrl);
    }

    if (signedUrlData?.signedUrl) {
      return NextResponse.redirect(signedUrlData.signedUrl);
    }

    // Fallback to original URL
    return NextResponse.redirect(decodedUrl);
  } catch (e: any) {
    console.error("Size guide API error:", e);
    return NextResponse.json(
      { error: "Failed to access size guide" },
      { status: 500 }
    );
  }
}
