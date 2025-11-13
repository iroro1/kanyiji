import { supabase } from "@/lib/supabase";
import axios from "axios";

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

export async function getSingleProduct(productSlug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images( id, image_url )`)
    .eq("slug", productSlug);

  if (error) throw error;
  return data;
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
