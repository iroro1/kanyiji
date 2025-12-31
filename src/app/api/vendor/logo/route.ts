import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getAuthenticatedUser() {
  try {
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
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { user: null, supabase: null };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { user: null, supabase: null };
    }

    return { user, supabase };
  } catch (error) {
    console.error("Error in getAuthenticatedUser:", error);
    return { user: null, supabase: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Use service role key for ALL operations (bypasses RLS)
    if (!supabaseServiceKey) {
      console.error("Vendor logo API: Service role key not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create service role client (admin key - bypasses RLS completely)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get form data first
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const vendorIdFromForm = formData.get("vendorId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Try to get user from session (optional - for validation)
    let userId: string | null = null;
    try {
      const { user } = await getAuthenticatedUser();
      if (user) {
        userId = user.id;
        console.log("User ID from session:", userId);
      }
    } catch (authError) {
      console.log("Could not get user from session, proceeding with logo upload");
    }

    // Verify user is a vendor using service role key
    let vendorData = null;
    if (userId) {
      const { data: vendor, error: vendorError } = await serviceSupabase
        .from("vendors")
        .select("id, user_id")
        .eq("user_id", userId)
        .single();

      if (vendorError || !vendor) {
        return NextResponse.json(
          { error: "Vendor not found" },
          { status: 404 }
        );
      }
      vendorData = vendor;
    } else if (vendorIdFromForm) {
      // If no user ID, try to get vendor from vendorId in form data
      const { data: vendor, error: vendorError } = await serviceSupabase
        .from("vendors")
        .select("id, user_id")
        .eq("id", vendorIdFromForm)
        .single();

      if (vendorError || !vendor) {
        return NextResponse.json(
          { error: "Vendor not found" },
          { status: 404 }
        );
      }
      vendorData = vendor;
    } else {
      return NextResponse.json(
        { error: "Unauthorized. Please log in or provide vendor ID." },
        { status: 401 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPEG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `vendors/${vendorData.id}/${fileName}`;

    // Upload to Supabase Storage - try vendor-images bucket first, fallback to vendor-product-images
    let uploadData;
    let uploadError;
    let bucketName = "vendor-images";

    // Try vendor-images bucket first
    const uploadResult = await serviceSupabase.storage
      .from("vendor-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Overwrite if exists
      });

    uploadData = uploadResult.data;
    uploadError = uploadResult.error;

    // If vendor-images bucket doesn't exist, try vendor-product-images
    if (uploadError && uploadError.message?.includes("Bucket not found")) {
      bucketName = "vendor-product-images";
      const fallbackResult = await serviceSupabase.storage
        .from("vendor-product-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      uploadData = fallbackResult.data;
      uploadError = fallbackResult.error;
    }

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Failed to upload logo" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = serviceSupabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
      return NextResponse.json(
        { error: "Failed to get public URL" },
        { status: 500 }
      );
    }

    // Update vendor record with logo URL
    const { error: updateError } = await serviceSupabase
      .from("vendors")
      .update({
        logo_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendorData.id);

    if (updateError) {
      console.error("Error updating vendor logo:", updateError);
      // Still return success with URL, but log the error
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    });
  } catch (error: any) {
    console.error("Upload logo error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

