const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugPhoneSignup() {
  console.log("Debugging phone signup issue...");

  try {
    // Test 1: Check the specific user you mentioned
    console.log("\n1. Checking user ojigboleo+1@gmail.com...");

    // We can't directly query auth.users, but let's check if there's a profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else {
      console.log(`Found ${profile.length} profiles for ojigboleo+1@gmail.com`);
      if (profile.length > 0) {
        console.log("Profile data:", profile[0]);
        console.log("Phone in profile:", profile[0].phone);
      }
    }

    // Test 2: Create a new user with phone to test the current flow
    console.log("\n2. Testing current signup flow with phone...");
    const testEmail = `phone-debug-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    console.log(`Creating user: ${testEmail} with phone: ${testPhone}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Debug Test User",
          role: "customer",
          phone: testPhone,
        },
        emailRedirectTo: `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/verify-email?email=${encodeURIComponent(testEmail)}`,
      },
    });

    if (authError) {
      console.error("Signup error:", authError);
      return;
    }

    console.log("✅ User created successfully!");
    console.log("User ID:", authData.user?.id);
    console.log("Email:", authData.user?.email);
    console.log("Raw user metadata:", authData.user?.user_metadata);
    console.log("Phone in metadata:", authData.user?.user_metadata?.phone);

    // Test 3: Check if phone is in the metadata
    if (authData.user?.user_metadata?.phone === testPhone) {
      console.log("✅ Phone successfully saved in user metadata!");
    } else {
      console.log("❌ Phone not found in user metadata");
      console.log("Expected:", testPhone);
      console.log("Found:", authData.user?.user_metadata?.phone);
      console.log(
        "All metadata keys:",
        Object.keys(authData.user?.user_metadata || {})
      );
    }

    // Test 4: Instructions for testing
    console.log("\n3. Testing instructions:");
    console.log(
      `🔗 Go to: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
    console.log("📧 Check your email for the 6-digit verification code");
    console.log(
      "✅ After verification, check if profile is created with phone"
    );
  } catch (error) {
    console.error("Debug failed:", error);
  }
}

debugPhoneSignup();
