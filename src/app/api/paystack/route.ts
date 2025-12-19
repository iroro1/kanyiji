// app/api/paystack/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1️⃣ Parse request body from client
    const body = await request.json();
    const { email, amount } = body;

    // 2️⃣ Send to Paystack Initialize Transaction endpoint
    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount, // amount must be in kobo
          metadata: body.metadata || {},
          channels: ['card'], // Restrict to card payments only
        }),
      }
    );

    // 3️⃣ Get Paystack response
    const data = await paystackRes.json();

    // 4️⃣ Return JSON response to frontend
    return NextResponse.json(data, { status: paystackRes.status });
  } catch (error) {
    console.error("Paystack error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
