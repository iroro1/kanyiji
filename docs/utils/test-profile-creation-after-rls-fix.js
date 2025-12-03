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

async function testProfileCreationAfterRLSFix() {
  console.log("Testing profile creation after RLS fix...");

  try {
    // Test 1: Try to create a profile directly (should work after RLS fix)
    console.log("\n1. Testing direct profile creation...");
    const testProfile = {
      id: "test-profile-" + Date.now(),
      email: "test-profile-creation@example.com",
      full_name: "Test Profile User",
      role: "customer",
      phone: "+1234567890",
      address: "123 Test Street",
      city: "Test City",
      state: "Test State",
      zip_code: "12345",
      country: "Nigeria",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from("profiles")
      .insert(testProfile)
      .select();

    if (insertError) {
      console.log("❌ Direct profile creation failed:", insertError.message);
      console.log("Error code:", insertError.code);
      console.log("💡 You need to run the RLS fix SQL in Supabase SQL Editor");
    } else {
      console.log("✅ Direct profile creation succeeded!");
      console.log("Profile created:", insertData[0]);
    }

    // Test 2: Check current profiles
    console.log("\n2. Checking current profiles...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    } else {
      console.log(`Found ${profiles.length} profiles in database`);
      profiles.forEach((profile, index) => {
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

    // Test 3: Create a new user to test the complete flow
    console.log("\n3. Testing complete signup → verification flow...");
    const testEmail = `complete-flow-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+9876543210";

    console.log(`Creating user: ${testEmail} with phone: ${testPhone}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Complete Flow Test User",
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
    console.log("Phone in metadata:", authData.user?.user_metadata?.phone);
    console.log(
      `🔗 Verify at: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );

    console.log("\n📋 Next steps:");
    console.log("1. Run the RLS fix SQL in Supabase SQL Editor");
    console.log("2. Go to the verification link above");
    console.log("3. Enter the 6-digit code from your email");
    console.log("4. Profile should be created with phone from metadata");
    console.log("5. Check http://localhost:3000/profile to see all fields");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testProfileCreationAfterRLSFix();
