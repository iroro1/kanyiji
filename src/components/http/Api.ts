import { supabase } from "@/lib/supabase";
import axios from "axios";
import { uploadProductImage } from "@/utils/supabase-images";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { calculateProductStock } from "@/utils/stockCalculator";

export type Product = {
  id: string;
  name: string;
  price: number;
  original_price: number;
  rating: number;
  review_count: number;
  stock_quantity?: number;
  vendor_id?: string;
  weight?: number;
  product_images: {
    id: string;
    image_url: string;
  }[];
  product_attributes?: {
    id: string;
    size?: string;
    color?: string;
    quantity: number;
  }[];
  vendors?: {
    id?: string;
    business_name?: string;
  };
};

// AUTHENTICATION
export async function LoginUser(body: { email: string; password: string }) {
  if (!body.email || body.password)
    throw new Error("Email and password are required");
  const user = await axios.post("/api/login", body);

  console.log(user);
}

// GET CURRENT USER
export async function getCurrentUserWithAxios() {
  const currentUser = await supabaseAuthService.getCurrentUser();

  return currentUser;
}

// PRODUCTS SECTION
export async function getAllProducts(searchQuery: string) {
  console.log(searchQuery);
  if (searchQuery) {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url )`)
      .ilike("name", `%${searchQuery}%`)
      .or("status.eq.active,status.eq.approved,status.eq.published");

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url )`)
      .or("status.eq.active,status.eq.approved,status.eq.published");

    if (error) throw error;
    return data;
  }
}

export async function getSingleProduct(productId: string) {
  // Try to fetch by ID first (UUID format)
  // If it's a valid UUID format, query by id
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
  
  let query = supabase
    .from("products")
    .select(`*, product_images( id, image_url ), product_attributes( id, size, color, quantity )`);
  
  if (isUUID) {
    query = query.eq("id", productId);
  } else {
    // Fallback to slug if not a UUID
    query = query.eq("slug", productId);
  }

  query = query.or("status.eq.active,status.eq.approved,status.eq.published");
  const { data, error } = await query.single();

  if (error) throw error;
  
  // Calculate stock_quantity from product_attributes if they exist
  if (data) {
    data.stock_quantity = calculateProductStock(data);
  }
  
  return data ? [data] : []; // Return as array to match expected format
}

export async function getWishlist(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(
      `
    id,
    created_at,
      products (
      id,
      name,
      price,
      original_price,
      rating,
      review_count,
      vendor_id,
      weight,
      product_images (
        id,
        image_url
      ),
      product_attributes (
        id,
        size,
        color,
        quantity
      ),
      vendors:vendor_id (
        id,
        business_name
      )
    )
  `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Map products and calculate stock
  const products: Product[] = (data ?? []).flatMap((row: any) => {
    if (!row.products) return [];
    
    const product: any = row.products;
    // Calculate stock from product_attributes
    const stockQuantity = product.product_attributes && Array.isArray(product.product_attributes) && product.product_attributes.length > 0
      ? product.product_attributes.reduce((sum: number, attr: any) => sum + (parseInt(String(attr.quantity || 0)) || 0), 0)
      : 0;
    
    return [{
      id: product.id,
      name: product.name,
      price: product.price,
      original_price: product.original_price,
      rating: product.rating,
      review_count: product.review_count,
      stock_quantity: stockQuantity,
      vendor_id: product.vendor_id,
      weight: product.weight,
      product_images: product.product_images || [],
      vendors: product.vendors, // Include vendor relationship
    } as Product];
  });

  return products;
}

// PAYMENT GATEWAY
export async function InitializePayment(body: {
  email: string;
  amount: number;
  metadata?: Record<string, string | number | boolean>;
  channels?: string[];
}) {
  const request = await axios.post("api/paystack", {
    ...body,
    channels: body.channels || ['card', 'bank'],
  });

  return request.data;
}

export async function VerifyPayment(reference: string) {
  const { data } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;

  try {
    const request = await axios(`api/verify-payment/${reference}`, {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return request.data;
  } catch (error) {
    console.error("Error verifying payment:", error);
  }
}

// FETCH ALL ORDERS
export async function fetchAllOrders(userId: string) {
  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      *,
      vendors:vendor_id(
        id,
        business_name
      ),
      order_items(
        *,
        products(
          id,
          name,
          product_images(image_url)
        ),
        vendors:vendor_id(
          id,
          business_name
        )
      )
    `)
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }

  // If vendors aren't populated in order_items, fetch them separately
  if (orders && orders.length > 0) {
    const enrichedOrders = await Promise.all(
      orders.map(async (order: any) => {
        if (order.order_items && order.order_items.length > 0) {
          const enrichedItems = await Promise.all(
            order.order_items.map(async (item: any) => {
              // If vendor info is missing, fetch it
              if (!item.vendors && item.vendor_id) {
                const { data: vendorData } = await supabase
                  .from("vendors")
                  .select("id, business_name")
                  .eq("id", item.vendor_id)
                  .single();
                
                if (vendorData) {
                  item.vendors = vendorData;
                }
              }
              return item;
            })
          );
          order.order_items = enrichedItems;
        }
        
        // Also ensure order-level vendor is populated
        if (!order.vendors && order.vendor_id) {
          const { data: vendorData } = await supabase
            .from("vendors")
            .select("id, business_name")
            .eq("id", order.vendor_id)
            .single();
          
          if (vendorData) {
            order.vendors = vendorData;
          }
        }
        
        return order;
      })
    );
    
    return enrichedOrders;
  }

  return orders || [];
}

// REGISTER TO BE A VENDOR
function sanitizeFileName(name: string | null | undefined): string {
  if (!name) return "file";
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Internal helper to upload a single file and throw on error.
 */
async function uploadFile(file: File, userId: string) {
  if (!file) throw new Error("File not provided for upload.");

  const safeFileName = sanitizeFileName(file.name);
  const filePath = `private/${userId}/${Date.now()}_${safeFileName}`;

  // 1. Upload the file
  const { error: uploadError } = await supabase.storage
    .from("vendor-documents")
    .upload(filePath, file);

  if (uploadError) {
    console.error("Upload error:", uploadError.message);
    throw new Error(`Failed to upload ${safeFileName}: ${uploadError.message}`);
  }

  // 2. Get the public URL
  const { data: urlData } = supabase.storage
    .from("vendor-documents")
    .getPublicUrl(filePath);

  if (!urlData.publicUrl) {
    throw new Error(`Could not get public URL for ${safeFileName}.`);
  }

  return urlData.publicUrl;
}

/**
 * The main API function for registering a new vendor.
 * This is what the mutation will call.
 */
export async function registerNewVendor({ formData, user }: any) {
  if (!user || !user.id) {
    throw new Error("User is not authenticated.");
  }

  try {
    // 1. Upload files in parallel (tax certificate is optional)
    console.log("Uploading files in parallel...");
    const uploads = await Promise.all([
      uploadFile(formData.businessLicense, user.id),
      formData.taxCertificate ? uploadFile(formData.taxCertificate, user.id) : Promise.resolve(null),
      uploadFile(formData.bankStatement, user.id),
    ]);
    const [businessLicenseUrl, taxCertificateUrl, bankStatementUrl] = uploads;

    if (!businessLicenseUrl || !bankStatementUrl) {
      throw new Error("Business license and bank statement uploads are required.");
    }

    console.log("Files uploaded. Inserting vendor data...");

    // 2. Insert the data into the 'vendors' table
    const { data: vendorData, error: vendorError } = await supabase
      .from("vendors")
      .insert({
        user_id: user.id,
        business_name: formData.businessName,
        business_type: formData.businessType,
        business_description: formData.businessDescription,
        business_registration_number: formData.businessRegistrationNumber?.trim() || null,
        tax_id: formData.taxId?.trim() || null,
        website_url: formData.website,
        twitter_handle: formData.twitterHandle || null,
        account_information: formData.account_information || null,
        business_email: (formData as any).email || user.email || null,
        phone: (formData as any).phone || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zipCode,
        country: formData.country,
        kyc_documents: [
          {
            business_license_url: businessLicenseUrl,
            tax_certificate_url: taxCertificateUrl || null,
            bank_statement_url: bankStatementUrl,
          },
        ],
      })
      .select()
      .single(); // Use .single() if you expect one row back

    if (vendorError) {
      throw vendorError; // Let the catch block handle this
    }

    // 3. Update the user's role in the 'profiles' table
    console.log("Updating user role...");
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "vendor" })
      .eq("id", user.id);

    if (updateError) {
      throw updateError; // Let the catch block handle this
    }

    // 4. Get user email from auth for confirmation email
    const { data: { user: authUser } } = await supabase.auth.getUser();
    const userEmail = authUser?.email;

    // 5. On success, return the new vendor data with email
    console.log("Successfully inserted data:", vendorData);
    return {
      ...vendorData,
      userEmail, // Include email for confirmation email
    };
  } catch (error: any) {
    // This will be caught by the mutation's onError
    console.error("Error during vendor registration:", error);
    // Re-throw the error to ensure useMutation knows it failed
    throw new Error(error.message);
  }
}

// VENDOR DASHBOARD
export async function fetchVendorOrders(vendorId?: string, status?: string) {
  const params = new URLSearchParams();
  if (status) {
    params.append("status", status);
  }

  const response = await fetch(`/api/vendor/orders?${params}`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch vendor orders");
  }

  return response.json();
}

export async function updateVendorOrderStatus(orderId: string, status: string) {
  const response = await fetch("/api/vendor/orders", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ orderId, status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update order status");
  }

  return response.json();
}

export async function fetchVendorDetails(userId: string) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("vendors")
    .select(`*, products(*, product_images(*), product_attributes(id, size, color, quantity)), vendor_bank_accounts(*)`)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  // Calculate stock_quantity for each product from product_attributes if they exist
  if (data?.products && Array.isArray(data.products)) {
    data.products = data.products.map((product: any) => {
      product.stock_quantity = calculateProductStock(product);
      return product;
    });
  }

  return data;
}

// DELETE VENDOR PRODUCT  AND IMAGES
export async function deleteVendorProductImages(imagePath: any[]) {
  console.log(imagePath);
  const { data, error } = await supabase.storage
    .from("vendor-product-images")
    .remove(imagePath);

  if (error) throw error;

  return data;
}
export async function deleteVendorProduct(productId: string, userId: string) {
  console.log(productId, userId);
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) throw error;
}

// ADD NEW PRODUCT
export async function addNewProduct({
  newProduct,
  vendor,
  variants,
  imagePreviews,
  user,
  slug,
  sizeGuideFile,
}: any) {
  // Look up category_id from category name if category is provided
  let categoryId = null;
  if (newProduct.category) {
    try {
      // Normalize category name for better matching
      const normalizeCategoryName = (name: string) => {
        return name
          .toLowerCase()
          .trim()
          .replace(/[&]/g, "and") // Replace & with "and"
          .replace(/[^a-z0-9\s]/g, "") // Remove special characters
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim();
      };
      
      const normalizedProductCategory = normalizeCategoryName(newProduct.category);
      
      // First try to find category by name in database with flexible matching
      const { data: allCategories, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true);
      
      if (!categoriesError && allCategories) {
        // Find category with normalized name matching
        const matchedCategory = allCategories.find((cat) => {
          const normalizedCatName = normalizeCategoryName(cat.name);
          return (
            normalizedCatName === normalizedProductCategory ||
            normalizedCatName.includes(normalizedProductCategory) ||
            normalizedProductCategory.includes(normalizedCatName)
          );
        });
        
        if (matchedCategory) {
          categoryId = matchedCategory.id;
        }
      }
      
      // Fallback: try to match with hardcoded categories
      if (!categoryId) {
        const { CATEGORIES } = await import("@/data/categories");
        const matchedCategory = CATEGORIES.find((cat) => {
          const normalizedCatName = normalizeCategoryName(cat.name);
          return (
            normalizedCatName === normalizedProductCategory ||
            normalizedCatName.includes(normalizedProductCategory) ||
            normalizedProductCategory.includes(normalizedCatName)
          );
        });
        if (matchedCategory) {
          categoryId = matchedCategory.id;
        }
      }
      
      console.log("Category lookup result:", {
        productCategory: newProduct.category,
        normalizedProductCategory,
        categoryId,
      });
    } catch (err) {
      console.error("Error looking up category_id:", err);
      // Continue without category_id if lookup fails
    }
  }

  // 1. Insert the main product — weight must be numbers only (e.g. 5), not "5kg"
  const weightStr = String(newProduct.weight ?? "").trim();
  let weightNum: number | null = null;
  if (weightStr) {
    if (!/^\d*\.?\d*$/.test(weightStr)) {
      throw new Error("Weight must be a number only (e.g. 5), not text like 5kg.");
    }
    const n = parseFloat(weightStr);
    if (Number.isNaN(n) || n < 0) {
      throw new Error("Weight must be a number only (e.g. 5).");
    }
    weightNum = n;
  }
  const productPayload: any = {
    vendor_id: vendor?.id,
    name: newProduct.name,
    category: newProduct.category, // Keep category name for backward compatibility
    slug: slug,
    price: newProduct.price,
    original_price: newProduct.original_price,
    stock_quantity: newProduct.quantity,
    description: newProduct.description,
    status: newProduct.status,
    weight: weightNum,
    sub_category: newProduct.type,
    sku: newProduct.sku,
    is_featured: newProduct.isFeatured,
    material: newProduct.material,
    type: newProduct.type,
  };
  if (newProduct.third_party_return_policy != null && newProduct.third_party_return_policy !== "") {
    productPayload.third_party_return_policy = newProduct.third_party_return_policy;
  }

  // Add category_id if we found it
  if (categoryId) {
    productPayload.category_id = categoryId;
  }

  const { data: productData, error: productError } = await supabase
    .from("products")
    .insert(productPayload)
    .select()
    .single();

  if (productError) {
    console.error("Error creating product:", productError);
    throw new Error(productError.message); // <-- MUST THROW
  }

  const productId = productData.id;

  // 2. Insert variants in parallel
  if (variants.length > 0) {
    const variantInsertions = variants.map((variant: any) =>
      supabase.from("product_attributes").insert({
        product_id: productId,
        size: variant.size,
        color: variant.color,
        quantity: variant.quantity,
      })
    );

    const results = await Promise.all(variantInsertions);
    const firstError = results.find((res) => res.error);
    if (firstError) {
      console.error("Error inserting variants:", firstError.error);
      throw new Error(firstError.error.message); // <-- MUST THROW
    }
    
    // Calculate total stock from variants and update product stock_quantity
    const totalStock = variants.reduce((sum: number, variant: any) => {
      return sum + (parseInt(variant.quantity) || 0);
    }, 0);
    
    // Update product stock_quantity with calculated total
    const { error: updateStockError } = await supabase
      .from("products")
      .update({ stock_quantity: totalStock })
      .eq("id", productId);
    
    if (updateStockError) {
      console.error("Error updating product stock_quantity:", updateStockError);
      // Don't throw - product was created successfully, stock update is secondary
    }
  }

  // 3. Upload images and save URLs in parallel
  if (imagePreviews.length > 0) {
    const imageUploadPromises = imagePreviews.map(async (preview: any) => {
      const file = preview.file;
      const vendorId = user ? user.id : "";

      console.log("from vendorID for buckets", vendorId);

      // A. Upload image
      const publicUrl = await uploadProductImage(vendorId, productId, file);

      // B. Save image record to DB
      const { error: imageError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: publicUrl,
        });

      if (imageError) {
        console.error("Error saving image URL:", imageError);
        throw new Error(imageError.message); // <-- MUST THROW
      }
      return publicUrl;
    });

    // Wait for all image uploads and DB saves to complete
    await Promise.all(imageUploadPromises);
  }

  // 3b. Upload size guide (optional) - JPG, PNG or PDF
  if (sizeGuideFile && productId && user?.id) {
    try {
      const ext = sizeGuideFile.name.split(".").pop()?.toLowerCase() || "pdf";
      const safeExt = ["jpg", "jpeg", "png", "pdf"].includes(ext) ? ext : "pdf";
      const filePath = `vendors/${user.id}/products/${productId}/size_guide.${safeExt}`;
      const { error: uploadError } = await supabase.storage
        .from("vendor-product-images")
        .upload(filePath, sizeGuideFile, { cacheControl: "3600", upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("vendor-product-images")
          .getPublicUrl(filePath);
        await supabase
          .from("products")
          .update({ size_guide_url: urlData.publicUrl })
          .eq("id", productId);
      }
    } catch (err) {
      console.error("Size guide upload failed:", err);
    }
  }

  // 4. Return the newly created product
  return productData;
}

// EDIT VENDOR PRODUCT
export async function editProduct(productId: string, updates: any) {
  const { data, error } = await supabase
    .from("products")
    .update(updates) // fields to update (object)
    .eq("id", productId) // match record by id
    .select(); // optional: return updated data

  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }

  return data;
}

// FIND PRODUCTS BASED ON FEATURED
// ALL PRODUCTS AND SERVICES APIs here
const PAGE_SIZE = 8;

export async function fetchAllProducts(
  { pageParam = 0 },
  searchQuery: string | null,
  category: string | null,
  sale: string | null,
  feature: string | null,
  sort: string | null,
  priceRange: number[] | null
) {
  const from = pageParam * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const [minPrice, maxPrice] = priceRange ? priceRange : [];

  if (searchQuery) {
    console.log("from search query");
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url ), product_attributes( id, size, color, quantity )`)
      .ilike("name", `%${searchQuery}%`)
      .or("status.eq.active,status.eq.approved,status.eq.published")
      .range(from, to); // Fetches rows from 'from' to 'to'
    // .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE);

    if (error) {
      throw error;
    }

    // Calculate stock_quantity from product_attributes if they exist
    const enrichedData = data?.map((product: any) => {
      product.stock_quantity = calculateProductStock(product);
      return product;
    }) || [];

    return enrichedData;
  } else if (category) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("category", `%${category}%`)
      .or("status.eq.active,status.eq.approved,status.eq.published")
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    return data;
  } else if (priceRange) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .gte("price", minPrice)
      .lte("price", maxPrice)
      .or("status.eq.active,status.eq.approved,status.eq.published")
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    return data;
  } else if (sort) {
    const [key, direction] = sort.split("-");

    const ascending = direction === "true" ? true : false;

    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url )`)
      .or("status.eq.active,status.eq.approved,status.eq.published")
      .order(key, { ascending })
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }
    return data;
  } else if (sale) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_on_sale", `${sale}`)
      .or("status.eq.active,status.eq.approved,status.eq.published")
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    return data;
  } else if (feature) {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url ), product_attributes( id, size, color, quantity )`)
      .eq("is_featured", `${feature}`)
      .or("status.eq.active,status.eq.approved,status.eq.published")
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    // Calculate stock_quantity from product_attributes if they exist
    const enrichedData = data?.map((product: any) => {
      product.stock_quantity = calculateProductStock(product);
      return product;
    }) || [];

    return enrichedData;
  } else {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url ), product_attributes( id, size, color, quantity )`)
      .or("status.eq.active,status.eq.approved,status.eq.published")
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    // Calculate stock_quantity from product_attributes if they exist
    const enrichedData = data?.map((product: any) => {
      product.stock_quantity = calculateProductStock(product);
      return product;
    }) || [];

    return enrichedData;
  }
}
// FIND PRODUCTS BASED ON CATEGORY
export async function fetchProductsByCategory(category: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images( id, image_url )`)
    .eq("category", category)
    .or("status.eq.active,status.eq.approved,status.eq.published");
  if (error) throw error;
  return data;
}

// FETCH NEW & LATEST PRODUCTS
export async function fetchNewAndLatestProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images( id, image_url )`)
    .or("status.eq.active,status.eq.approved,status.eq.published")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}
