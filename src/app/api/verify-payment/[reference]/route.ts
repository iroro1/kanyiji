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
    const { data } = await response.json();

    const products = JSON.parse(data.metadata?.product);

    console.log(data.metadata);

    // SAVE ORDER TO DATABASE HERE
    // ADD USER CART API

    const { data: orderData, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_id: user?.id,
          total_amount: data.amount / 100, // convert kobo to naira
          payment_reference: data.reference,
          payment_method: data.channel,
          payment_status: data.gateway_response.toLowerCase(),
          paid_at: data.paidAt,
          last4: data.authorization?.last4,
          card_type: data.authorization?.card_type,
        },
      ])
      .select()
      .single();
    if (error) throw error;
    // console.log("this is from the orderData api", orderData);

    for (const product of products) {
      // console.log("Order Item:", product);

      const { error: orderItemsError } = await supabase
        .from("order_items")
        .insert([
          {
            product_name: product.name,
            image: product.image,
            order_id: orderData.id,
            product_id: product.id,
            quantity: product.quantity,
            unit_price: product.price,
            total_price: product.price * product.quantity,
            vendor_id: product.seller,
          },
        ]);

      if (orderItemsError) throw orderItemsError;
    }

    // const { error: addressError } = await supabase
    //   .from("shipping_addresses")
    //   .insert([
    //     {
    //       user_id: user?.id,
    //       order_id: orderData.id,
    //       address_label: products[0].address.type,
    //       recipient_name: products[0].address.name,
    //       phone_number: products[0].address.phone,
    //       street_address: products[0].address.address,
    //       city: products[0].address.city,
    //       state: products[0].address.state,
    //       is_default: products[0].address.isDefault,
    //     },
    //   ]);

    // if (addressError) throw addressError;

    // 3️⃣ Return response back to frontend
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return NextResponse.json(
      { error: "Failed to verify transaction" },
      { status: 500 }
    );
  }
}
