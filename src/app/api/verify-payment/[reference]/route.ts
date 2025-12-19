import { NextResponse } from "next/server";
// import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { reference } = await params;
  // const supabase = await createSupabaseServerClient();

  const cookieStore = await cookies();

  // ✅ Verify Supabase Auth Session

  try {
    const authHeader = _request.headers.get("authorization");
    const token = authHeader?.split(" ")[1]; // remove "Bearer "

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ✅ Create a Supabase server client *with the user token*
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` },
        },

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
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized user" }, { status: 401 });
    }

    // 1️⃣ Send request to Paystack's verification endpoint
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`, // from your .env.local
          "Content-Type": "application/json",
        },
      }
    );

    // 2️⃣ Parse JSON response from Paystack
    const paystackResponse = await response.json();
    
    if (!paystackResponse.status || paystackResponse.status !== true) {
      console.error("Paystack verification failed:", paystackResponse);
      return NextResponse.json(
        { error: "Payment verification failed", details: paystackResponse.message },
        { status: 400 }
      );
    }
    
    const { data } = paystackResponse;
    
    if (!data) {
      console.error("No data in Paystack response:", paystackResponse);
      return NextResponse.json(
        { error: "Invalid payment response" },
        { status: 400 }
      );
    }

    // Parse products from metadata safely
    let products = [];
    try {
      if (data.metadata?.product) {
        products = typeof data.metadata.product === 'string' 
          ? JSON.parse(data.metadata.product) 
          : data.metadata.product;
      }
    } catch (parseError) {
      console.error("Error parsing products from metadata:", parseError);
      products = [];
    }
    
    if (!Array.isArray(products) || products.length === 0) {
      console.error("No products found in metadata:", data.metadata);
      return NextResponse.json(
        { error: "No products found in order" },
        { status: 400 }
      );
    }
    
    const totalAmount = data.metadata?.totalAmount ? parseFloat(data.metadata.totalAmount) : data.amount / 100;
    const shippingAddress = products[0]?.address || {};
    
    // Get shipping amount and method from metadata
    const shippingAmount = data.metadata?.shippingFee ? parseFloat(data.metadata.shippingFee) : 0;
    const shippingMethod = data.metadata?.shippingMethod || "Standard Delivery";
    const subtotalFromMetadata = data.metadata?.subtotal ? parseFloat(data.metadata.subtotal) : null;
    
    // Calculate subtotal from products or use from metadata
    let subtotal = subtotalFromMetadata || 0;
    
    if (!subtotalFromMetadata) {
      products.forEach((product: any) => {
        subtotal += parseFloat(product.price || 0) * (product.quantity || 1);
      });
    }
    
    // Ensure shipping and subtotal add up to total
    const finalShippingAmount = shippingAmount || Math.max(0, totalAmount - subtotal);
    const finalSubtotal = subtotal || Math.max(0, totalAmount - finalShippingAmount);

    // Generate unique order number (only if column exists in database)
    const orderNumber = `KNJ-${new Date().getFullYear()}-${String(Date.now()).slice(-10)}`;

    // Calculate estimated delivery date (3-7 business days from now)
    const estimatedDeliveryDate = new Date();
    estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 5); // Default 5 days

    // Get vendor_id from first product (assuming single vendor per order for now)
    // If multiple vendors, we might need to create separate orders per vendor
    const firstProduct = products[0];
    let vendorId = null;
    
    if (firstProduct?.vendor_id) {
      vendorId = firstProduct.vendor_id;
    } else if (firstProduct?.id) {
      // Fetch product to get vendor_id
      const { data: productData } = await supabase
        .from("products")
        .select("vendor_id")
        .eq("id", firstProduct.id)
        .single();
      vendorId = productData?.vendor_id || null;
    }

    // Prepare billing address (use shipping address if billing not provided)
    const billingAddress = {
      firstName: shippingAddress.firstName || shippingAddress.first_name || "",
      lastName: shippingAddress.lastName || shippingAddress.last_name || "",
      email: shippingAddress.email || user.email || "",
      phone: shippingAddress.phone || "",
      address: shippingAddress.address || shippingAddress.address_line_1 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      country: shippingAddress.country || "Nigeria",
      zipCode: shippingAddress.zipCode || shippingAddress.postal_code || "",
    };

    // Prepare shipping address
    const shippingAddressData = {
      firstName: shippingAddress.firstName || shippingAddress.first_name || "",
      lastName: shippingAddress.lastName || shippingAddress.last_name || "",
      email: shippingAddress.email || user.email || "",
      phone: shippingAddress.phone || "",
      address: shippingAddress.address || shippingAddress.address_line_1 || "",
      city: shippingAddress.city || "",
      state: shippingAddress.state || "",
      country: shippingAddress.country || "Nigeria",
      zipCode: shippingAddress.zipCode || shippingAddress.postal_code || "",
    };

    // Determine payment status based on Paystack response
    const paymentStatus = data.status === "success" ? "paid" : "pending";
    
    // Get customer notes from metadata if provided
    const customerNotes = data.metadata?.customerNotes || "";
    
    // Collect size and color information from all products for internal notes
    const variantInfo: string[] = [];
    products.forEach((product: any, index: number) => {
      // Check if product has size or color (handle null, undefined, empty string)
      // Also check for selectedVariant object which might contain size/color
      const size = product.size || product.selectedVariant?.size || null;
      const color = product.color || product.selectedVariant?.color || null;
      
      // More robust check: ensure value exists and is not null/undefined/empty string
      const hasSize = size != null && size !== '' && String(size).trim() !== '' && String(size).toLowerCase() !== 'null';
      const hasColor = color != null && color !== '' && String(color).trim() !== '' && String(color).toLowerCase() !== 'null';
      
      if (hasSize || hasColor) {
        const variantDetails: string[] = [];
        if (hasSize) variantDetails.push(`Size: ${size}`);
        if (hasColor) variantDetails.push(`Color: ${color}`);
        variantInfo.push(`Item ${index + 1} (${product.name || 'Product'}): ${variantDetails.join(', ')}`);
      }
    });
    const internalNotes = variantInfo.length > 0 
      ? `Product Variants:\n${variantInfo.join('\n')}`
      : "";
    
    // Debug logging to help diagnose issues
    console.log("=== Internal Notes Debug ===");
    console.log("Products count:", products.length);
    console.log("Products metadata:", JSON.stringify(products.map((p: any) => ({ 
      name: p.name, 
      size: p.size, 
      color: p.color,
      selectedVariant: p.selectedVariant,
      hasSize: p.size != null && p.size !== '',
      hasColor: p.color != null && p.color !== ''
    })), null, 2));
    console.log("Variant info array:", variantInfo);
    console.log("Internal notes to be saved:", internalNotes || "(empty)");
    console.log("===========================");
    
    // Ensure all required fields are initialized
    // Note: order_number is excluded if column doesn't exist in database
    const orderPayload: any = {
      customer_id: user?.id,
      vendor_id: vendorId,
      status: "pending",
      payment_status: paymentStatus,
      fulfillment_status: "unfulfilled",
      subtotal: finalSubtotal,
      tax_amount: 0,
      shipping_amount: finalShippingAmount,
      discount_amount: 0,
      total_amount: totalAmount,
      currency: "NGN",
      notes: "", // Internal notes (empty initially)
      customer_notes: customerNotes, // Customer notes (can be empty)
      internal_notes: internalNotes, // Store size and color info here
      billing_address: billingAddress,
      shipping_address: shippingAddressData,
      shipping_method: shippingMethod,
      tracking_number: null, // Will be set when order is shipped
      estimated_delivery_date: estimatedDeliveryDate.toISOString(),
      delivered_at: null, // Will be set when order is delivered
    };
    
    console.log("Creating order with payload:", JSON.stringify(orderPayload, null, 2));

    // SAVE ORDER TO DATABASE HERE
    const { data: orderData, error } = await supabase
      .from("orders")
      .insert([orderPayload])
      .select()
      .single();
      
    if (error) {
      console.error("Error creating order:", error);
      console.error("Order payload:", orderPayload);
      throw error;
    }
    
    console.log("Order created successfully:", orderData.id);
    // console.log("this is from the orderData api", orderData);

    // Create order items
    for (const product of products) {
      // Skip if product doesn't have required fields
      if (!product.id && !product.name) {
        console.warn("Skipping invalid product:", product);
        continue;
      }
      
      // Get vendor_id for this product if not provided
      let productVendorId = product.vendor_id || product.seller;
      
      if (!productVendorId && product.id) {
        try {
          const { data: productData } = await supabase
            .from("products")
            .select("vendor_id")
            .eq("id", product.id)
            .single();
          productVendorId = productData?.vendor_id || null;
        } catch (fetchError) {
          console.error("Error fetching product vendor_id:", fetchError);
          // Continue without vendor_id if fetch fails
        }
      }

      try {
        const orderQuantity = product.quantity || 1;
        
        // Create order item (size and color are stored in order's internal_notes, not here)
      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert([
          {
            order_id: orderData.id,
              product_id: product.id || null,
              product_name: product.name || "Product",
              product_sku: product.sku || null,
              quantity: orderQuantity,
              unit_price: parseFloat(product.price || 0),
              total_price: parseFloat(product.price || 0) * orderQuantity,
              vendor_id: productVendorId,
          },
        ]);

        if (orderItemsError) {
          console.error("Error creating order item:", orderItemsError);
          console.error("Product data:", product);
          throw orderItemsError;
    }

        // Reduce stock quantity when order is placed
        if (product.id) {
          try {
            // First, check if product has product_attributes (variants)
            const { data: productAttributes, error: attrError } = await supabase
              .from("product_attributes")
              .select("id, quantity")
              .eq("product_id", product.id)
              .order("quantity", { ascending: false }); // Order by quantity descending

            if (attrError) {
              console.error("Error fetching product attributes:", attrError);
            } else if (productAttributes && productAttributes.length > 0) {
              // Product has variants - reduce from variants first (FIFO: reduce from highest stock first)
              let remainingToReduce = orderQuantity;
              
              for (const attr of productAttributes) {
                if (remainingToReduce <= 0) break;
                
                const currentQty = attr.quantity || 0;
                const reduceAmount = Math.min(remainingToReduce, currentQty);
                
                if (reduceAmount > 0) {
                  const newQty = Math.max(0, currentQty - reduceAmount);
                  const { error: updateError } = await supabase
                    .from("product_attributes")
                    .update({ quantity: newQty })
                    .eq("id", attr.id);
                  
                  if (updateError) {
                    console.error(`Error updating variant ${attr.id} stock:`, updateError);
                  } else {
                    remainingToReduce -= reduceAmount;
                  }
                }
              }
              
              // If still need to reduce more, reduce from main product stock_quantity
              if (remainingToReduce > 0) {
                const { data: productData } = await supabase
                  .from("products")
                  .select("stock_quantity")
                  .eq("id", product.id)
                  .single();
                
                if (productData) {
                  const currentStock = productData.stock_quantity || 0;
                  const newStock = Math.max(0, currentStock - remainingToReduce);
                  
                  await supabase
                    .from("products")
                    .update({ stock_quantity: newStock })
                    .eq("id", product.id);
                }
              }
            } else {
              // No variants - reduce from main product stock_quantity
              const { data: productData } = await supabase
                .from("products")
                .select("stock_quantity")
                .eq("id", product.id)
                .single();
              
              if (productData) {
                const currentStock = productData.stock_quantity || 0;
                const newStock = Math.max(0, currentStock - orderQuantity);
                
                const { error: updateError } = await supabase
                  .from("products")
                  .update({ stock_quantity: newStock })
                  .eq("id", product.id);

                if (updateError) {
                  console.error("Error updating product stock:", updateError);
                }
              }
            }
          } catch (stockError) {
            console.error("Error reducing stock:", stockError);
            // Don't fail the order if stock update fails - log it for manual review
          }
        }
      } catch (insertError) {
        console.error("Error inserting order item:", insertError);
        // Continue with next product instead of failing entire order
        continue;
      }
    }

    // 3️⃣ Return response back to frontend
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Paystack verify error:", error);
    console.error("Error stack:", error?.stack);
    return NextResponse.json(
      { 
        error: "Failed to verify transaction",
        details: error?.message || "Unknown error",
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
      },
      { status: 500 }
    );
  }
}
