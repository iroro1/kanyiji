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

async function testQuickOTP() {
  console.log("Testing quick OTP flow...");

  try {
    // Sign up a new user
    const testEmail = `quicktest${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";

    console.log(`Signing up with email: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Quick Test User",
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

    console.log("✅ Signup successful!");
    console.log("📧 Check your email for the verification code");
    console.log(
      `🔗 Go to: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
    console.log("\n⏰ OTP expires in 2 minutes - enter it quickly!");
    console.log("🔄 If it expires, click 'Get New Code' button");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testQuickOTP();
