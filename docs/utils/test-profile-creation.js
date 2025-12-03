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

async function testProfileCreation() {
  console.log("Testing profile creation...");

  try {
    // Test 1: Sign up a user
    console.log("\n1. Creating user...");
    const testEmail = `profile-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Profile Test User",
          role: "customer",
        },
      },
    });

    if (authError) {
      console.error("Signup error:", authError);
      return;
    }

    console.log("✅ User created:", authData.user?.id);

    // Test 2: Try to create profile directly
    console.log("\n2. Creating profile...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: testEmail,
        full_name: "Profile Test User",
        role: "customer",
        phone: "+1234567890", // Add phone number
        address: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zip_code: "12345",
        country: "Nigeria",
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select();

    if (profileError) {
      console.error("❌ Profile creation error:", profileError);

      // Check if it's an RLS error
      if (profileError.code === "42501") {
        console.log("🔒 RLS policy is blocking profile creation");
        console.log(
          "💡 This is expected - profiles should be created during email verification"
        );
      }
    } else {
      console.log("✅ Profile created successfully:", profileData[0]);
    }

    // Test 3: Check if profile exists
    console.log("\n3. Checking profile...");
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (fetchError) {
      console.error("Profile fetch error:", fetchError);
    } else if (existingProfile && existingProfile.length > 0) {
      console.log("✅ Profile found:", existingProfile[0]);
      console.log("Phone number:", existingProfile[0].phone);
    } else {
      console.log("❌ No profile found");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testProfileCreation();
