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

async function testPhoneMetadata() {
  console.log("Testing phone metadata in signup...");

  try {
    // Test 1: Sign up a user with phone
    console.log("\n1. Testing signup with phone...");
    const testEmail = `phone-metadata-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    console.log(`Creating user: ${testEmail} with phone: ${testPhone}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Metadata Test User",
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
    console.log("User data:", {
      id: authData.user?.id,
      email: authData.user?.email,
      email_confirmed_at: authData.user?.email_confirmed_at,
    });

    // Test 2: Check user metadata
    console.log("\n2. Checking user metadata...");
    console.log("Raw user metadata:", authData.user?.user_metadata);
    console.log("Phone in metadata:", authData.user?.user_metadata?.phone);

    if (authData.user?.user_metadata?.phone === testPhone) {
      console.log("✅ Phone successfully saved in user metadata!");
    } else {
      console.log("❌ Phone not found in user metadata");
      console.log("Expected:", testPhone);
      console.log("Found:", authData.user?.user_metadata?.phone);
    }

    // Test 3: Instructions for email verification
    console.log("\n3. Next steps for testing profile creation:");
    console.log(
      `🔗 Go to: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
    console.log("📧 Check your email for the 6-digit verification code");
    console.log(
      "✅ After verification, profile should be created with phone from metadata"
    );

    // Test 4: Check current profiles
    console.log("\n4. Checking current profiles...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    } else {
      console.log(`Found ${profiles.length} profiles in database`);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPhoneMetadata();
