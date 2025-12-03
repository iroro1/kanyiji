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

async function testEmailVerificationFlow() {
  console.log("Testing email verification flow...");

  try {
    // Test 1: Sign up a user
    console.log("\n1. Creating user...");
    const testEmail = `verification-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Verification Test User",
          role: "customer",
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

    console.log("✅ User created:", authData.user?.id);
    console.log("📧 Check your email for verification code");

    // Test 2: Check if profile exists before verification
    console.log("\n2. Checking profile before verification...");
    const { data: profileBefore, error: profileBeforeError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (profileBeforeError) {
      console.error("Profile query error:", profileBeforeError);
    } else {
      console.log(`Found ${profileBefore.length} profiles before verification`);
    }

    // Test 3: Simulate OTP verification (this would normally be done by user)
    console.log("\n3. Simulating OTP verification...");
    console.log(
      "⚠️  You need to manually verify the email to test profile creation"
    );
    console.log(
      `🔗 Go to: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
    console.log("📧 Enter the 6-digit code from your email");

    // Test 4: Check profile after verification (this would happen after user enters OTP)
    console.log("\n4. After verification, check if profile was created...");
    console.log(
      "💡 The profile should be created with phone field when you verify the email"
    );
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testEmailVerificationFlow();
