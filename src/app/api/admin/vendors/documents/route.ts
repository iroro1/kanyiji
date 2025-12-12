import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function checkAdminAccess() {
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
    return { authorized: false, adminSupabase: null };
  }

  // Check admin role using service role key to bypass RLS
  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    return { authorized: false, adminSupabase: null };
  }

  return { authorized: true, adminSupabase };
}

export async function GET(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
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

    // Extract the file path from the public URL
    // Public URLs from Supabase can be:
    // 1. https://[project].supabase.co/storage/v1/object/public/vendor-documents/private/[userId]/[filename]
    // 2. https://[project].supabase.co/storage/v1/object/sign/vendor-documents/private/[userId]/[filename]
    // We need to extract: private/[userId]/[filename]
    let filePath: string;
    
    // Try to extract from public URL pattern
    const publicUrlPattern = /\/vendor-documents\/(.+)$/;
    const publicMatch = documentUrl.match(publicUrlPattern);
    
    if (publicMatch && publicMatch[1]) {
      filePath = publicMatch[1];
    } else {
      // If it's already a relative path or different format, try to extract just the path part
      // Check if URL contains vendor-documents
      if (documentUrl.includes('vendor-documents')) {
        const parts = documentUrl.split('vendor-documents/');
        if (parts.length > 1) {
          filePath = parts[1].split('?')[0]; // Remove query params if any
        } else {
          return NextResponse.json(
            { error: "Invalid document URL format" },
            { status: 400 }
          );
        }
      } else {
        // Assume it's already a file path
        filePath = documentUrl;
      }
    }

    // Generate a signed URL that expires in 1 hour
    const { data: signedUrlData, error: signedUrlError } = await adminSupabase.storage
      .from("vendor-documents")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (signedUrlError || !signedUrlData) {
      console.error("Error creating signed URL:", signedUrlError);
      return NextResponse.json(
        { error: "Failed to generate document access URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: signedUrlData.signedUrl,
    });
  } catch (error: any) {
    console.error("Get document URL error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

