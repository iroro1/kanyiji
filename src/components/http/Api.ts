import { supabase } from "@/lib/supabase";

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

// PRODUCTS SECTION
export async function getAllProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images( id, image_url )`);

  if (error) throw error;
  return data;
}

export async function getSingleProduct(productId: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images( id, image_url )`)
    .eq("id", productId);

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
