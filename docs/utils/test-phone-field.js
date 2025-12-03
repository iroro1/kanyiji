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

async function testPhoneField() {
  console.log("Testing phone field in profiles table...");

  try {
    // Check if we can query the profiles table
    console.log("\n1. Checking profiles table access...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Error accessing profiles table:", profilesError);
      return;
    }

    console.log(`Found ${profiles.length} profiles in database`);

    if (profiles.length > 0) {
      console.log("\n2. Checking profile data structure...");
      const profile = profiles[0];
      console.log("Sample profile fields:", Object.keys(profile));
      console.log("Sample profile data:", {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        state: profile.state,
        zip_code: profile.zip_code,
        country: profile.country,
        role: profile.role,
        email_verified: profile.email_verified,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      });
    } else {
      console.log("\n2. No profiles found - creating a test profile...");

      // Create a test profile with phone number
      const testProfile = {
        id: "test-profile-" + Date.now(),
        email: "test-phone@example.com",
        full_name: "Test Phone User",
        phone: "+1234567890",
        address: "123 Test Street",
        city: "Test City",
        state: "Test State",
        zip_code: "12345",
        country: "Nigeria",
        role: "customer",
        email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertData, error: insertError } = await supabase
        .from("profiles")
        .insert(testProfile)
        .select();

      if (insertError) {
        console.error("Error inserting test profile:", insertError);
        console.log(
          "This might be due to RLS policies or foreign key constraints"
        );
      } else {
        console.log("✅ Test profile created successfully:", insertData[0]);
      }
    }

    // Test 3: Check if phone field exists in schema
    console.log("\n3. Testing phone field specifically...");

    const { data: phoneTest, error: phoneError } = await supabase
      .from("profiles")
      .select("phone")
      .limit(1);

    if (phoneError) {
      console.error("❌ Phone field error:", phoneError);
    } else {
      console.log("✅ Phone field exists and is accessible");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPhoneField();
