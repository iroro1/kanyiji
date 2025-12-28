import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notificationHelpers";

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

// Helper function to update category product counts
async function updateCategoryProductCount(
  adminSupabase: any,
  categoryIds: string[]
) {
  if (!categoryIds || categoryIds.length === 0) return;

  try {
    // Count active products for each category
    for (const categoryId of categoryIds) {
      // Check if category_id column exists by trying to query it
      const { count, error, data } = await adminSupabase
        .from("products")
        .select("id, category_id, status", { count: "exact", head: false })
        .eq("status", "active")
        .limit(100); // Get sample to check category_id values

      if (error) {
        console.error(`Error counting products for category ${categoryId}:`, error);
        continue;
      }

      // Count products with matching category_id (client-side filtering if needed)
      let matchingCount = 0;
      const productsData: any[] = (data as any[]) || [];
      if (productsData.length > 0) {
        matchingCount = productsData.filter((p: any) => p.category_id === categoryId).length;
      } else {
        // If data is null, try the count query directly
        const { count: directCount, error: countError } = await adminSupabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("category_id", categoryId)
          .eq("status", "active");

        if (!countError && directCount !== null) {
          matchingCount = directCount;
        } else {
          console.error(`Error getting direct count for category ${categoryId}:`, countError);
          // Log sample products to debug
          if (productsData && productsData.length > 0) {
            console.log("Sample products category_ids:", productsData.slice(0, 5).map((p: any) => ({
              id: p.id,
              category_id: p.category_id,
              status: p.status,
            })));
          }
        }
      }

      // Update the category's product_count
      const updatePayload: any = { product_count: matchingCount, updated_at: new Date().toISOString() };
      const { error: updateError } = await adminSupabase
        .from("categories")
        .update(updatePayload)
        .eq("id", categoryId);

      if (updateError) {
        console.error(`Error updating product_count for category ${categoryId}:`, updateError);
      } else {
        console.log(`Updated product_count for category ${categoryId} to ${matchingCount}`);
      }
    }
  } catch (error) {
    console.error("Error updating category product counts:", error);
    // Don't throw - category count update shouldn't break product operations
  }
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
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build query - start with basic query without joins
    let baseQuery = adminSupabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      baseQuery = baseQuery.eq("status", status);
    }

    const { data: products, error, count } = await baseQuery;

    if (error) {
      console.error("Get products error:", error);
      throw error;
    }

    // If products found, enrich with vendor and category data
    let enrichedProducts = products || [];
    
    if (enrichedProducts.length > 0) {
      // Get vendor IDs
      // Note: category_id might not exist in products table, so we skip category enrichment
      const vendorIds = Array.from(new Set(enrichedProducts.map((p: any) => p.vendor_id).filter(Boolean)));

      // Fetch vendors
      const vendorsResult = vendorIds.length > 0
        ? await adminSupabase.from("vendors").select("id, business_name, status").in("id", vendorIds)
        : { data: [], error: null };

      const vendorsMap = new Map(
        (vendorsResult.data || []).map((v: any) => [v.id, v])
      );

      // Enrich products with vendor data
      // Note: category_id might not exist in products table, so we skip category enrichment
      enrichedProducts = enrichedProducts.map((product: any) => ({
        ...product,
        vendors: product.vendor_id ? vendorsMap.get(product.vendor_id) : null,
        // categories: product.category_id ? categoriesMap.get(product.category_id) : null,
      }));
    }

    return NextResponse.json({
      products: enrichedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { 
      vendor_id, 
      name, 
      price, 
      description, 
      short_description,
      category_id, 
      sku,
      stock_quantity,
      original_price,
      weight,
      images, // Extract images separately - they go to product_images table, not products table
      status,
      ...productData 
    } = data;

    if (!vendor_id || !name || !price) {
      return NextResponse.json(
        { error: "Vendor ID, name, and price are required" },
        { status: 400 }
      );
    }

    // Verify vendor exists
    const { data: vendor, error: vendorError } = await adminSupabase
      .from("vendors")
      .select("id")
      .eq("id", vendor_id)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // Create product
    // Note: images go to product_images table separately
    // category_id can be included if the column exists in your schema
    const productPayload: any = {
      vendor_id,
      name,
      slug: `${slug}-${Date.now()}`,
      description: description || "",
      short_description: short_description || null,
      price: parseFloat(price),
      original_price: original_price ? parseFloat(original_price) : null,
      sku: sku || null,
      stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
      weight: weight ? parseFloat(weight) : null,
      status: status || "draft",
      currency: "NGN",
      is_featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Try to add category_id if provided - will work if column exists
    // If you get an error about category_id column not found, run add-category-column.sql
    if (category_id) {
      productPayload.category_id = category_id;
    }

    // Remove images from productData (they go to product_images table)
    const { images: _, ...restProductData } = productData;
    Object.assign(productPayload, restProductData);

    const { data: product, error: insertError } = await adminSupabase
      .from("products")
      .insert(productPayload)
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // If images are provided, insert them into product_images table
    if (images && Array.isArray(images) && images.length > 0 && product) {
      const imageRecords = images.map((imageUrl: string, index: number) => ({
        product_id: product.id,
        image_url: imageUrl,
        alt_text: `${name} - Image ${index + 1}`,
        sort_order: index,
        is_primary: index === 0,
      }));

      await adminSupabase.from("product_images").insert(imageRecords);
    }

    // Update category product count if product is active and has a category
    if (product.status === "active" && product.category_id) {
      await updateCategoryProductCount(adminSupabase, [product.category_id]);
    }

    // Create notification for product creation
    if (product.vendor_id) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      });
      const { data: { user: adminUser } } = await supabase.auth.getUser();

      // Notify vendor
      const { data: vendorData } = await adminSupabase
        .from("vendors")
        .select("user_id")
        .eq("id", product.vendor_id)
        .single();

      if (vendorData?.user_id) {
        await createNotification({
          title: "Product Created",
          message: `Your product "${product.name}" has been created${product.status === "active" ? " and is now live" : " and is pending approval"}.`,
          type: "product",
          user_id: vendorData.user_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });
      }

      // Notify admins about new product
      await createNotification({
        title: "New Product Created",
        message: `Product "${product.name}" has been created by vendor.`,
        type: "product",
        recipient_type: "admin",
        created_by: adminUser?.id || null,
      });
    }

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { productId, action, ...updates } = await req.json();

    if (!productId || !action) {
      return NextResponse.json(
        { error: "Product ID and action are required" },
        { status: 400 }
      );
    }

    // Validate action
    const validActions = ["approve", "reject", "feature", "unfeature", "update"];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    let updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (action === "approve") {
      updateData.status = "active";
    } else if (action === "reject") {
      updateData.status = "inactive";
    } else if (action === "feature") {
      updateData.is_featured = true;
      updateData.status = "active";
    } else if (action === "unfeature") {
      updateData.is_featured = false;
    } else if (action === "update") {
      // Remove images - it doesn't belong in products table (goes to product_images table)
      const { images, ...otherUpdates } = updates;
      
      // Try to include category_id if provided - will work if column exists
      // If category_id column doesn't exist, run add-category-column.sql
      updateData = { ...updateData, ...otherUpdates };
      
      // If images are provided in update, handle them separately
      // (update product_images table, not products table)
      if (images && Array.isArray(images) && images.length > 0) {
        // TODO: Update product_images table if needed
        // For now, we skip updating images during product update
        // You can add logic here to update product_images table if needed
      }
    }

    // Get the current product data before update to track category/status changes
    const { data: currentProduct } = await adminSupabase
      .from("products")
      .select("category_id, status")
      .eq("id", productId)
      .single();

    // Get product details before update for notifications
    const { data: productBefore } = await adminSupabase
      .from("products")
      .select("vendor_id, name, status")
      .eq("id", productId)
      .single();

    const { data: product, error } = await adminSupabase
      .from("products")
      .update(updateData)
      .eq("id", productId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Create notifications for product actions
    if (productBefore && product && (action === "approve" || action === "reject")) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {},
        },
      });
      const { data: { user: adminUser } } = await supabase.auth.getUser();

      // Get vendor user_id
      const { data: vendorData } = await adminSupabase
        .from("vendors")
        .select("user_id")
        .eq("id", product.vendor_id || productBefore.vendor_id)
        .single();

      if (action === "approve" && vendorData?.user_id) {
        await createNotification({
          title: "Product Approved",
          message: `Your product "${productBefore.name}" has been approved and is now live on Kanyiji!`,
          type: "success",
          user_id: vendorData.user_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });
      } else if (action === "reject" && vendorData?.user_id) {
        await createNotification({
          title: "Product Rejected",
          message: `Your product "${productBefore.name}" has been rejected. Please contact support for more information.`,
          type: "warning",
          user_id: vendorData.user_id,
          recipient_type: "user",
          created_by: adminUser?.id || null,
        });
      }
    }

    // Update category product counts based on changes
    const categoryIdsToUpdate: string[] = [];
    const oldCategoryId = currentProduct?.category_id;
    const oldStatus = currentProduct?.status;
    const newCategoryId = product.category_id || updateData.category_id;
    const newStatus = product.status || updateData.status;

    // If category changed, update both old and new categories
    if (oldCategoryId !== newCategoryId) {
      if (oldCategoryId && oldStatus === "active") {
        categoryIdsToUpdate.push(oldCategoryId);
      }
      if (newCategoryId && newStatus === "active") {
        categoryIdsToUpdate.push(newCategoryId);
      }
    } else if (oldCategoryId) {
      // Category didn't change but status might have
      if (oldStatus !== newStatus && (oldStatus === "active" || newStatus === "active")) {
        categoryIdsToUpdate.push(oldCategoryId);
      }
    } else if (newCategoryId && newStatus === "active") {
      // New category assigned with active status
      categoryIdsToUpdate.push(newCategoryId);
    }

    // Update category counts
    if (categoryIdsToUpdate.length > 0) {
      await updateCategoryProductCount(adminSupabase, categoryIdsToUpdate);
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { authorized, adminSupabase } = await checkAdminAccess();

    if (!authorized || !adminSupabase) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get product data before deletion to update category count
    const { data: productToDelete } = await adminSupabase
      .from("products")
      .select("category_id, status")
      .eq("id", productId)
      .single();

    // Delete product (cascade will delete related order items, images, etc.)
    const { error } = await adminSupabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (error) {
      throw error;
    }

    // Update category product count if product was active and had a category
    if (productToDelete?.status === "active" && productToDelete?.category_id) {
      await updateCategoryProductCount(adminSupabase, [productToDelete.category_id]);
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

