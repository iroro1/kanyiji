import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getAuthenticatedUser() {
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
    return { user: null, supabase: null };
  }

  return { user, supabase };
}

export async function GET(req: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();

    if (!user || !supabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is a vendor
    const { data: vendor, error: vendorError } = await supabase
      .from("vendors")
      .select("id, user_id")
      .eq("user_id", user.id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const documentUrl = searchParams.get("url");

    if (!documentUrl) {
      return NextResponse.json(
        { error: "Document URL is required" },
        { status: 400 }
      );
    }

    // Check if URL is already a signed URL (has token parameter)
    // Signed URLs work for both public and private files
    if (documentUrl.includes('/object/sign/') && documentUrl.includes('token=')) {
      console.log('Document is already a signed URL, returning as-is');
      return NextResponse.json({
        url: documentUrl,
      });
    }

    // Check if file is in private folder - if so, we MUST generate a signed URL
    const isPrivateFile = documentUrl.includes('/private/');
    
    // If it's a public URL AND the file is NOT in private folder, return it directly
    const isPublicUrl = documentUrl.includes('/public/') || 
                       documentUrl.includes('/object/public/') ||
                       documentUrl.includes('storage/v1/object/public');
    
    if (isPublicUrl && !isPrivateFile) {
      console.log('Document is public and not in private folder, returning original URL');
      return NextResponse.json({
        url: documentUrl,
      });
    }
    
    // If file is in private folder (even if URL says /public/), we need to generate signed URL
    if (isPrivateFile) {
      console.log('File is in private folder - generating signed URL (cannot use public endpoint)');
      // Continue to signed URL generation below
    }

    // Extract the file path from the URL
    // URLs can be:
    // - https://[project].supabase.co/storage/v1/object/public/vendor-documents/private/[userId]/[filename]
    // - https://[project].supabase.co/storage/v1/object/sign/vendor-documents/private/[userId]/[filename]?token=...
    // We need: private/[userId]/[filename]
    let filePath: string;
    
    console.log('Extracting file path from URL:', documentUrl);
    
    // Try to extract from vendor-documents pattern
    const vendorDocsPattern = /\/vendor-documents\/(.+)$/;
    const match = documentUrl.match(vendorDocsPattern);
    
    if (match && match[1]) {
      // Remove query params if any (like ?token=...)
      filePath = match[1].split('?')[0];
      console.log('Extracted file path:', filePath);
    } else {
      // Check if URL contains vendor-documents
      if (documentUrl.includes('vendor-documents')) {
        const parts = documentUrl.split('vendor-documents/');
        if (parts.length > 1) {
          filePath = parts[1].split('?')[0]; // Remove query params if any
          console.log('Extracted file path (split method):', filePath);
        } else {
          console.error('Could not extract file path from URL:', documentUrl);
          return NextResponse.json(
            { error: "Invalid document URL format" },
            { status: 400 }
          );
        }
      } else {
        // Assume it's already a file path
        filePath = documentUrl.split('?')[0];
        console.log('Using URL as file path:', filePath);
      }
    }
    
    console.log('Final file path for signed URL:', filePath);

    // Verify the document belongs to this vendor by checking the path contains their user_id
    if (!filePath.includes(user.id)) {
      return NextResponse.json(
        { error: "Unauthorized: Document does not belong to this vendor" },
        { status: 403 }
      );
    }

    // Use service role key to generate signed URL (bypasses RLS)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate a signed URL that expires in 1 hour
    const { data: signedUrlData, error: signedUrlError } = await serviceSupabase.storage
      .from("vendor-documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error("Error creating signed URL:", signedUrlError);
      
      // If bucket doesn't exist, try to use the original URL as fallback
      if (signedUrlError?.message?.includes("Bucket not found") || signedUrlError?.message?.includes("not found")) {
        // Try to construct a public URL if the original URL was public
        if (documentUrl.includes('/public/')) {
          return NextResponse.json({
            url: documentUrl,
            warning: "Using original URL - bucket may not be configured",
          });
        }
        
        // Try to get public URL from the file path
        const { data: publicUrlData } = serviceSupabase.storage
          .from("vendor-documents")
          .getPublicUrl(filePath);
        
        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            url: publicUrlData.publicUrl,
            warning: "Using public URL - bucket may not be configured",
          });
        }
      }
      
      return NextResponse.json(
        { 
          error: "Failed to generate document access URL", 
          details: signedUrlError?.message,
          suggestion: "Please ensure the 'vendor-documents' storage bucket exists in Supabase"
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
    });
  } catch (error: any) {
    console.error("Get vendor document URL error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

