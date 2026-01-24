// app/api/paystack/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1️⃣ Parse request body from client
    const body = await request.json();
    const { email, amount, channels } = body;

    // Validate required fields
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        { error: "Valid amount in kobo is required" },
        { status: 400 }
      );
    }

    // 2️⃣ Send to Paystack Initialize Transaction endpoint
    // This returns a transaction reference for use with PaystackPop.setup() (popup mode)
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
          channels: channels || ['card', 'bank', 'bank_transfer'], // Include bank_transfer for Titan
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment-success`,
        }),
      }
    );

    // 3️⃣ Get Paystack response
    const data = await paystackRes.json();

    // 4️⃣ If bank transfer, fetch account details
    if (channels?.includes('bank') && data.status && data.data?.reference) {
      try {
        // Fetch transaction details to get bank account information
        const verifyRes = await fetch(
          `https://api.paystack.co/transaction/verify/${data.data.reference}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY!}`,
            },
          }
        );
        
        const verifyData = await verifyRes.json();
        
        // If transaction has bank account details, include them
        if (verifyData.status && verifyData.data?.authorization?.bank && verifyData.data?.authorization?.account_number) {
          data.data.bank_account = {
            account_number: verifyData.data.authorization.account_number,
            bank_name: verifyData.data.authorization.bank,
            account_name: verifyData.data.authorization.account_name || email,
          };
        }
      } catch (verifyError) {
        console.error("Error fetching bank account details:", verifyError);
        // Continue without bank details - they'll be shown in the Paystack modal
      }
    }

    // 5️⃣ Return JSON response to frontend
    return NextResponse.json(data, { status: paystackRes.status });
  } catch (error) {
    console.error("Paystack error:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
