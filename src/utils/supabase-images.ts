import { supabase } from "@/lib/supabase";

export async function uploadProductImage(
  vendorId: string,
  productId: string,
  file: File
) {
  const filePath = `vendors/${vendorId}/${file.name}`;

  console.log("from filePath", filePath);

  const { data, error } = await supabase.storage
    .from("vendor-product-images") // bucket name
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true, // overwrite if same name
    });

  if (error) throw error;

  // Get public URL
  const { data: publicUrl } = supabase.storage
    .from("vendor-product-images")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}
