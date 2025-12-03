import { NextRequest, NextResponse } from "next/server";
import mailchimp from "@mailchimp/mailchimp_marketing";

// Extract server prefix from API key (format: key-us1, key-us2, etc.)
const getServerPrefix = (apiKey: string | undefined): string | null => {
  if (!apiKey) return null;
  
  // If MAILCHIMP_SERVER_PREFIX is explicitly set, use it
  if (process.env.MAILCHIMP_SERVER_PREFIX) {
    return process.env.MAILCHIMP_SERVER_PREFIX;
  }
  
  // Otherwise, extract from API key (format: xxxxxx-us1)
  const parts = apiKey.split("-");
  if (parts.length > 1) {
    return parts[parts.length - 1]; // Get the last part after the dash
  }
  
  return null;
};

// Initialize Mailchimp
const API_KEY = process.env.MAILCHIMP_API_KEY;
const SERVER_PREFIX = getServerPrefix(API_KEY);
const LIST_ID = process.env.MAILCHIMP_LIST_ID;

if (API_KEY && SERVER_PREFIX) {
  mailchimp.setConfig({
    apiKey: API_KEY,
    server: SERVER_PREFIX,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // Check if required environment variables are set
    if (!API_KEY || !SERVER_PREFIX || !LIST_ID) {
      console.error("Mailchimp configuration missing", {
        hasApiKey: !!API_KEY,
        hasServerPrefix: !!SERVER_PREFIX,
        hasListId: !!LIST_ID,
      });
      return NextResponse.json(
        { error: "Newsletter service is not configured. Please check your Mailchimp settings." },
        { status: 500 }
      );
    }

    // Add subscriber to Mailchimp list
    const response = await mailchimp.lists.addListMember(LIST_ID, {
      email_address: email,
      status: "subscribed", // or "pending" if you want double opt-in
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully subscribed to newsletter",
        subscriber: {
          id: response.id,
          email: response.email_address,
          status: response.status,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Mailchimp subscription error:", error);

    // Handle specific Mailchimp errors
    if (error.status === 400 && error.response?.body?.title === "Member Exists") {
      return NextResponse.json(
        { error: "This email is already subscribed to our newsletter" },
        { status: 400 }
      );
    }

    if (error.status === 400) {
      return NextResponse.json(
        { error: error.response?.body?.detail || "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Please try again later." },
      { status: 500 }
    );
  }
}

