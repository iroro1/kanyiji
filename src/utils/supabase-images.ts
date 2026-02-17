import { supabase } from "@/lib/supabase";

export async function uploadProductImage(
  vendorId: string,
  productId: string,
  file: File,
  index?: number
) {
  // Use productId and unique suffix - mobile photo libraries often reuse filenames (image.jpg, IMG_1234.jpg)
  const ext = file.name.split(".").pop() || "jpg";
  const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext.toLowerCase() : "jpg";
  const uniqueName = `img_${Date.now()}_${index ?? 0}_${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
  const filePath = `vendors/${vendorId}/products/${productId}/${uniqueName}`;

  const { error } = await supabase.storage
    .from("vendor-product-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("vendor-product-images")
    .getPublicUrl(filePath);

  return publicUrl.publicUrl;
}
