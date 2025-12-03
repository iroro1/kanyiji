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

async function testProfilePhone() {
  console.log("Testing profile phone field...");

  try {
    // Test 1: Check if we can query phone field specifically
    console.log("\n1. Testing phone field query...");
    const { data: phoneData, error: phoneError } = await supabase
      .from("profiles")
      .select("id, email, phone, full_name")
      .limit(5);

    if (phoneError) {
      console.error("❌ Phone field query error:", phoneError);
    } else {
      console.log("✅ Phone field query successful");
      console.log("Phone data:", phoneData);
    }

    // Test 2: Check table structure
    console.log("\n2. Checking table structure...");
    const { data: structureData, error: structureError } = await supabase
      .from("profiles")
      .select("*")
      .limit(0);

    if (structureError) {
      console.error("Structure error:", structureError);
    } else {
      console.log("✅ Table structure accessible");
    }

    // Test 3: Try to create a profile with phone (using service role if available)
    console.log("\n3. Testing profile creation with phone...");

    // First, let's try to sign up a user to create a profile
    const testEmail = `phone-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";

    console.log(`Creating user: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Test User",
          role: "customer",
        },
      },
    });

    if (authError) {
      console.error("Signup error:", authError);
      return;
    }

    console.log("✅ User created:", authData.user?.id);

    // Wait a moment for any triggers to run
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Check if profile was created
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (profileError) {
      console.error("Profile query error:", profileError);
    } else if (profileData && profileData.length > 0) {
      console.log("✅ Profile found:", profileData[0]);
      console.log("Phone field value:", profileData[0].phone);
    } else {
      console.log("❌ No profile found - trigger may not be working");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testProfilePhone();
