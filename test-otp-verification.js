// Test OTP verification flow
// Run this with: node test-otp-verification.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOTPVerification() {
  try {
    console.log("=== Testing OTP Verification Flow ===");

    // Test email signup (this will send OTP)
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "testpassword123";

    console.log("1. Testing email signup...");
    const { data: signupData, error: signupError } = await supabase.auth.signUp(
      {
        email: testEmail,
        password: testPassword,
        options: {
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/verify-email?email=${encodeURIComponent(testEmail)}`,
        },
      }
    );

    if (signupError) {
      console.error("❌ Signup failed:", signupError.message);
      return;
    }

    console.log("✅ Signup successful:", {
      userId: signupData.user?.id,
      email: signupData.user?.email,
      emailConfirmed: signupData.user?.email_confirmed_at,
      requiresVerification: !signupData.user?.email_confirmed_at,
    });

    if (!signupData.user?.email_confirmed_at) {
      console.log("📧 Email verification required - check your email for OTP");
      console.log(
        "🔗 Verification URL:",
        `${
          process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
        }/verify-email?email=${encodeURIComponent(testEmail)}`
      );
    }

    // Test resend OTP
    console.log("\n2. Testing resend OTP...");
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: testEmail,
    });

    if (resendError) {
      console.error("❌ Resend OTP failed:", resendError.message);
    } else {
      console.log("✅ OTP resent successfully");
    }

    console.log("\n=== Test Complete ===");
    console.log("Next steps:");
    console.log("1. Check your email for the OTP");
    console.log("2. Visit the verification page");
    console.log("3. Enter the 6-digit OTP");
    console.log("4. Verify your account");
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

testOTPVerification();
