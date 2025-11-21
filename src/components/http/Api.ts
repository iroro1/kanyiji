import { supabase } from "@/lib/supabase";
import axios from "axios";
import { uploadProductImage } from "@/utils/supabase-images";
import { supabaseAuthService } from "@/services/supabaseAuthService";

export type Product = {
  id: string;
  name: string;
  price: number;
  original_price: number;
  rating: number;
  review_count: number;
  product_images: {
    id: string;
    image_url: string;
  }[];
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
      .ilike("name", `%${searchQuery}%`);

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url )`);

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
    .select(`*, product_images( id, image_url )`);
  
  if (isUUID) {
    query = query.eq("id", productId);
  } else {
    // Fallback to slug if not a UUID
    query = query.eq("slug", productId);
  }
  
  const { data, error } = await query.eq("status", "active").single();

  if (error) throw error;
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
      product_images (
        id,
        image_url
      )
    )
  `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).flatMap((row) => row.products);
}

// PAYMENT GATEWAY
export async function InitializePayment(body: {
  email: string;
  amount: number;
  metadata?: Record<string, string | number | boolean>;
}) {
  const request = await axios.post("api/paystack", body);

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
  const { data, error } = await supabase
    .from("orders")
    .select(`*, order_items(*), shipping_addresses(*)`)
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
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
    // 1. Upload all files in parallel for performance
    console.log("Uploading files in parallel...");
    const [businessLicenseUrl, taxCertificateUrl, bankStatementUrl] =
      await Promise.all([
        uploadFile(formData.businessLicense, user.id),
        uploadFile(formData.taxCertificate, user.id),
        uploadFile(formData.bankStatement, user.id),
      ]);

    // This check is robust in case Promise.all succeeds but URLs are falsy
    if (!businessLicenseUrl || !taxCertificateUrl || !bankStatementUrl) {
      throw new Error("One or more file uploads failed to return a URL.");
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
        website_url: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zipCode,
        country: formData.country,
        kyc_documents: [
          {
            business_license_url: businessLicenseUrl,
            tax_certificate_url: taxCertificateUrl,
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

    // 4. On success, return the new vendor data
    console.log("Successfully inserted data:", vendorData);
    return vendorData;
  } catch (error: any) {
    // This will be caught by the mutation's onError
    console.error("Error during vendor registration:", error);
    // Re-throw the error to ensure useMutation knows it failed
    throw new Error(error.message);
  }
}

// VENDOR DASHBOARD
export async function fetchVendorDetails(userId: string) {
  const { data, error } = await supabase
    .from("vendors")
    .select(`*, products(*, product_images(*))`)
    .eq("user_id", userId)
    .single();

  if (error) throw error;
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
}: any) {
  // 1. Insert the main product
  const { data: productData, error: productError } = await supabase
    .from("products")
    .insert({
      vendor_id: vendor?.id,
      name: newProduct.name,
      category: newProduct.category,
      slug: slug,
      price: newProduct.price,
      original_price: newProduct.original_price,
      stock_quantity: newProduct.quantity,
      description: newProduct.description,
      status: newProduct.status,
      weight: newProduct.weight,
      sub_category: newProduct.type,
      sku: newProduct.sku,
      is_featured: newProduct.isFeatured,
      material: newProduct.material,
      type: newProduct.type,
    })
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
      .select(`*, product_images( id, image_url )`)
      .ilike("name", `%${searchQuery}%`)
      .range(from, to); // Fetches rows from 'from' to 'to'
    // .range(pageParam * PAGE_SIZE, pageParam * PAGE_SIZE + PAGE_SIZE);

    if (error) {
      throw error;
    }

    return data;
  } else if (category) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .ilike("category", `%${category}%`)
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
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    return data;
  } else if (feature) {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url )`)
      .eq("is_featured", `${feature}`)
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    return data;
  } else {
    const { data, error } = await supabase
      .from("products")
      .select(`*, product_images( id, image_url )`)
      .range(from, to); // Fetches rows from 'from' to 'to'

    if (error) {
      throw error;
    }

    return data;
  }
}
// FIND PRODUCTS BASED ON CATEGORY
export async function fetchProductsByCategory(category: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images( id, image_url )`)
    .eq("category", category);
  if (error) throw error;
  return data;
}

// FETCH NEW & LATEST PRODUCTS
export async function fetchNewAndLatestProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images( id, image_url )`)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}
