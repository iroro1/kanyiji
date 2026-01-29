import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendReturnRequestToAdmin } from "@/services/emailService";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "support@kanyiji.ng";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const orderId = formData.get("orderId") as string;
    const orderNumber = formData.get("orderNumber") as string;
    const itemName = formData.get("itemName") as string;
    const reason = formData.get("reason") as string;
    const customerEmail = formData.get("customerEmail") as string;
    const customerName = formData.get("customerName") as string;
    const imageFile = formData.get("image") as File | null;

    if (!orderId || !itemName || !reason || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, itemName, reason, customerEmail" },
        { status: 400 }
      );
    }

    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const ext = imageFile.name.split(".").pop() || "jpg";
      const path = `returns/${orderId}/${Date.now()}_attachment.${ext}`;
      const buffer = await imageFile.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("vendor-product-images")
        .upload(path, buffer, {
          contentType: imageFile.type,
          cacheControl: "3600",
          upsert: true,
        });
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("vendor-product-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    await sendReturnRequestToAdmin({
      adminEmail: ADMIN_EMAIL,
      customerName: customerName || "N/A",
      customerEmail,
      orderId,
      orderNumber: orderNumber || orderId,
      itemName,
      reason,
      imageUrl,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Request return API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to submit return request" },
      { status: 500 }
    );
  }
}
