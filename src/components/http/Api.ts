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
