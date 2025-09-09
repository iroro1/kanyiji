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

async function testPhoneTransfer() {
  console.log("Testing phone transfer from metadata to profiles table...");

  try {
    // Test 1: Create a user with phone in metadata
    console.log("\n1. Creating user with phone in metadata...");
    const testEmail = `phone-transfer-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    console.log(`Creating user: ${testEmail} with phone: ${testPhone}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Transfer Test User",
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
    console.log("Phone in metadata:", authData.user?.user_metadata?.phone);

    // Test 2: Check if profile exists before verification
    console.log("\n2. Checking profile before verification...");
    const { data: profileBefore, error: profileBeforeError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (profileBeforeError) {
      console.error("Error fetching profile:", profileBeforeError);
    } else {
      console.log(`Found ${profileBefore.length} profiles before verification`);
    }

    // Test 3: Simulate the email verification process
    console.log("\n3. Simulating email verification...");
    console.log(
      "⚠️  You need to manually verify the email to test profile creation"
    );
    console.log(
      `🔗 Go to: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
    console.log("📧 Enter the 6-digit code from your email");
    console.log(
      "✅ After verification, check if profile is created with phone from metadata"
    );

    // Test 4: Instructions for testing
    console.log("\n4. Testing instructions:");
    console.log("1. Go to the verification link above");
    console.log("2. Enter the 6-digit code from your email");
    console.log(
      "3. After verification, run this script again to check if profile was created"
    );
    console.log("4. The profile should contain the phone number from metadata");

    // Test 5: Check current profiles
    console.log("\n5. Current profiles in database:");
    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select("*");

    if (allError) {
      console.error("Error fetching profiles:", allError);
    } else {
      console.log(`Found ${allProfiles.length} profiles in database`);
      allProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          zip_code: profile.zip_code,
          country: profile.country,
        });
      });
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPhoneTransfer();
