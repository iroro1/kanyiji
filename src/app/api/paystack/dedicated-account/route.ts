import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, preferredBank } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 }
      );
    }

    // Create dedicated virtual account
    const paystackRes = await fetch(
      "https://api.paystack.co/dedicated_account",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          first_name: firstName || email.split("@")[0],
          last_name: lastName || "",
          phone: phone || "",
          preferred_bank: preferredBank || "", // Optional: bank code (e.g., "wema", "gtb")
          country: "NG", // Nigeria
        }),
      }
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok) {
      console.error("Paystack DVA creation error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to create dedicated account" },
        { status: paystackRes.status }
      );
    }

    return NextResponse.json(data, { status: paystackRes.status });
  } catch (error: any) {
    console.error("DVA creation error:", error);
    return NextResponse.json(
      { error: "Failed to create dedicated account" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch existing DVA for a customer
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500 }
      );
    }

    // List dedicated accounts for this email
    const paystackRes = await fetch(
      `https://api.paystack.co/dedicated_account?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok) {
      console.error("Paystack DVA fetch error:", data);
      return NextResponse.json(
        { error: data.message || "Failed to fetch dedicated account" },
        { status: paystackRes.status }
      );
    }

    return NextResponse.json(data, { status: paystackRes.status });
  } catch (error: any) {
    console.error("DVA fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dedicated account" },
      { status: 500 }
    );
  }
}

