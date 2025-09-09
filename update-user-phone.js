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

async function updateUserPhone() {
  console.log("Updating user phone metadata...");

  try {
    // Note: We can't directly update user metadata via the client
    // This would need to be done via Supabase Admin API or SQL
    console.log("❌ Cannot update user metadata via client API");
    console.log(
      "💡 This requires Supabase Admin API or direct database access"
    );

    console.log("\n📋 Alternative solutions:");
    console.log(
      "1. Verify the existing user's email and add phone manually in profile"
    );
    console.log("2. Create a new user with phone number");
    console.log("3. Use Supabase Admin API to update user metadata");

    // Test creating a new user with phone
    console.log("\n🧪 Testing new user creation with phone...");
    const testEmail = `phone-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Test User",
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

    console.log("✅ New user created with phone in metadata!");
    console.log("Phone in metadata:", authData.user?.user_metadata?.phone);
    console.log(
      `🔗 Verify at: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
  } catch (error) {
    console.error("Update failed:", error);
  }
}

updateUserPhone();
