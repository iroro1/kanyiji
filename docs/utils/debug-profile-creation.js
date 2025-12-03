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

async function debugProfileCreation() {
  console.log("Debugging profile creation issue...");

  try {
    // Test 1: Check if we can create a profile directly (should fail due to RLS)
    console.log("\n1. Testing direct profile creation...");
    const testProfile = {
      id: "5e7efea3-6360-4bff-b499-4d43962496d6",
      email: "phone-save-test-1757378371882@gmail.com",
      full_name: "Phone Save Test User",
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
      console.log(
        "❌ Direct profile creation failed (expected):",
        insertError.message
      );
      console.log("Error code:", insertError.code);
    } else {
      console.log("✅ Direct profile creation succeeded:", insertData);
    }

    // Test 2: Check RLS policies
    console.log("\n2. Checking RLS policies...");
    const { data: policies, error: policiesError } = await supabase.rpc(
      "get_table_policies",
      { table_name: "profiles" }
    );

    if (policiesError) {
      console.log("Could not fetch policies:", policiesError.message);
    } else {
      console.log("RLS policies:", policies);
    }

    // Test 3: Try to simulate the email verification process
    console.log("\n3. Simulating email verification process...");

    // First, let's try to sign in as the user (if possible)
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "phone-save-test-1757378371882@gmail.com",
        password: "TestPassword123!",
      });

    if (signInError) {
      console.log(
        "❌ Cannot sign in (email not confirmed):",
        signInError.message
      );
      console.log("This is expected - email needs to be verified first");
    } else {
      console.log("✅ Signed in successfully:", signInData.user?.id);

      // Now try to create profile while authenticated
      const { data: authProfileData, error: authProfileError } = await supabase
        .from("profiles")
        .insert({
          id: signInData.user.id,
          email: signInData.user.email,
          full_name: "Phone Save Test User",
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
        })
        .select();

      if (authProfileError) {
        console.log(
          "❌ Profile creation while authenticated failed:",
          authProfileError.message
        );
        console.log("Error code:", authProfileError.code);
      } else {
        console.log("✅ Profile created while authenticated:", authProfileData);
      }
    }

    // Test 4: Check current profiles
    console.log("\n4. Checking current profiles...");
    const { data: currentProfiles, error: currentError } = await supabase
      .from("profiles")
      .select("*");

    if (currentError) {
      console.error("Error fetching profiles:", currentError);
    } else {
      console.log(`Found ${currentProfiles.length} profiles in database`);
      currentProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          email: profile.email,
          phone: profile.phone,
          full_name: profile.full_name,
        });
      });
    }
  } catch (error) {
    console.error("Debug failed:", error);
  }
}

debugProfileCreation();
