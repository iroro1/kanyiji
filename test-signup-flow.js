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

async function testSignupFlow() {
  console.log("Testing signup flow...");

  try {
    // Test signup with a test email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";
    const testFullName = "Test User";

    console.log(`\n1. Attempting signup with email: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: testFullName,
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
      requires_verification: authData.user?.email_confirmed_at === null,
    });

    // Check if profile was created
    console.log("\n2. Checking if profile was created...");

    // Wait a moment for the profile to be created
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    } else {
      console.log(`Found ${profiles.length} profiles for this email`);
      if (profiles.length > 0) {
        console.log("Profile data:", profiles[0]);
      }
    }

    // Test the verification flow
    console.log("\n3. Testing verification flow...");
    console.log(
      "Expected redirect URL:",
      `/verify-email?email=${encodeURIComponent(testEmail)}`
    );

    if (authData.user?.email_confirmed_at === null) {
      console.log(
        "✅ Email verification required - should redirect to verify-email page"
      );
    } else {
      console.log("❌ Email should require verification but doesn't");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testSignupFlow();
