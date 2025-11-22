import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Public API route to fetch vendors
// Supports filtering by status (approved vendors only)
export async function GET(request: NextRequest) {
  try {
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
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");
    const featured = searchParams.get("featured") === "true";

    // Build query - fetch from vendors table
    // Only approved vendors for public view
    // Note: business_logo and business_banner may not exist, using * to get all columns
    let query = supabase
      .from("vendors")
      .select("*")
      .eq("status", "approved") // Approved vendors only for public view
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    
    console.log("Vendors API: Querying vendors table with params:", {
      limit,
      offset,
      statusFilter: "approved",
      table: "vendors",
    });

    // For featured, you might want to add a featured flag later
    // For now, just get approved vendors

    const { data: vendors, error: vendorsError } = await query;

    // Log detailed error information
    if (vendorsError) {
      console.error("Vendors API: Error fetching vendors:", {
        message: vendorsError.message,
        code: vendorsError.code,
        details: vendorsError.details,
        hint: vendorsError.hint,
      });
      
      // Check if it's an RLS policy error
      if (vendorsError.code === "42501" || vendorsError.message?.includes("permission") || vendorsError.message?.includes("policy")) {
        console.error("Vendors API: This looks like an RLS policy error. Check your Supabase RLS policies for the vendors table.");
      }
      
      return NextResponse.json(
        { error: "Failed to fetch vendors", details: vendorsError.message, code: vendorsError.code },
        { status: 500 }
      );
    }
    
    // Debug: Log what we found
    console.log("Vendors API: Query result:", {
      vendorsFound: vendors?.length || 0,
      statusFilter: "approved",
      vendorStatuses: vendors?.map((v: any) => v.status) || [],
      vendorNames: vendors?.map((v: any) => v.business_name) || [],
      hasVendors: !!vendors && vendors.length > 0,
    });
    
    // Debug: If no vendors found, check what statuses exist (check all vendors without status filter)
    if (!vendors || vendors.length === 0) {
      console.log("Vendors API: No vendors found with status 'approved'. Checking all vendors...");
      
      // Try without status filter to see if we can access the table at all
      const { data: allVendors, error: allError } = await supabase
        .from("vendors")
        .select("id, business_name, status")
        .limit(10);
      
      if (!allError && allVendors) {
        console.log("Vendors API: Found vendors with these statuses:", {
          total: allVendors.length,
          statuses: Array.from(new Set(allVendors.map((v: any) => v.status))),
          vendors: allVendors.map((v: any) => ({ id: v.id, name: v.business_name, status: v.status })),
        });
      } else if (allError) {
        console.error("Vendors API: Error fetching all vendors:", {
          message: allError.message,
          code: allError.code,
          details: allError.details,
        });
      }
    }

    // Enrich vendors with additional data if needed
    // Count products per vendor
    const vendorIds = vendors?.map((v) => v.id) || [];
    const vendorProductCounts: Record<string, number> = {};

    if (vendorIds.length > 0) {
      // Count active products for each vendor
      for (const vendorId of vendorIds) {
        const { count } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("vendor_id", vendorId)
          .eq("status", "active");

        vendorProductCounts[vendorId] = count || 0;
      }
    }

    // Enrich vendors with product counts
    // Map vendor data - handle columns that may not exist
    const enrichedVendors = (vendors || []).map((vendor: any) => ({
      id: vendor.id,
      business_name: vendor.business_name,
      business_description: vendor.business_description || "",
      business_type: vendor.business_type || "",
      // Try different possible column names for logo/image
      image_url: vendor.business_logo || vendor.business_banner || vendor.logo || vendor.image_url || vendor.avatar || null,
      product_count: vendorProductCounts[vendor.id] || 0,
      status: vendor.status,
    }));

    return NextResponse.json({
      vendors: enrichedVendors,
      count: enrichedVendors.length,
    });
  } catch (error: any) {
    console.error("Error in vendors API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

