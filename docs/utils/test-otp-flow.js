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

async function testOTPFlow() {
  console.log("Testing OTP verification flow...");

  try {
    // Test 1: Sign up a new user
    console.log("\n1. Testing signup...");
    const testEmail = `otptest${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";

    console.log(`Signing up with email: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "OTP Test User",
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

    console.log("Signup successful!");
    console.log("Auth data:", {
      user_id: authData.user?.id,
      email: authData.user?.email,
      email_confirmed_at: authData.user?.email_confirmed_at,
      requires_verification:
        authData.user?.email_confirmed_at === null ||
        authData.user?.email_confirmed_at === undefined,
    });

    // Test 2: Try to resend OTP
    console.log("\n2. Testing resend OTP...");

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: testEmail,
    });

    if (resendError) {
      console.error("Resend OTP error:", resendError);
    } else {
      console.log("Resend OTP successful!");
    }

    // Test 3: Check if we can get the user session
    console.log("\n3. Checking user session...");

    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
    } else {
      console.log("Session data:", {
        hasSession: !!session.session,
        user: session.session?.user?.email,
        email_confirmed_at: session.session?.user?.email_confirmed_at,
      });
    }

    // Test 4: Try to login (should fail with unconfirmed email)
    console.log("\n4. Testing login with unconfirmed email...");

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (loginError) {
      console.log("Login failed as expected:", loginError.message);
    } else {
      console.log("Login successful (unexpected):", loginData);
    }

    console.log("\n✅ OTP flow test completed!");
    console.log("\nNext steps:");
    console.log("1. Check your email for the verification code");
    console.log(
      "2. Go to http://localhost:3000/verify-email?email=" +
        encodeURIComponent(testEmail)
    );
    console.log("3. Enter the 6-digit code from your email");
    console.log("4. The code should work and create a profile");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testOTPFlow();
