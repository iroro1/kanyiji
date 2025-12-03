const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables");
  console.log("Please create a .env.local file with your Supabase credentials");
  console.log("You can copy from env.example and fill in your actual values");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateExistingUserSimple() {
  console.log("Updating existing user profile with phone number...");

  try {
    // Update the existing profile for ojigboleo+1@gmail.com
    console.log("\n1. Updating profile for ojigboleo+1@gmail.com...");

    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update({
        phone: "+1234567890", // Add a phone number
        address: "123 Main Street", // Add address
        city: "Lagos", // Add city
        state: "Lagos State", // Add state
        zip_code: "100001", // Add zip code
        country: "Nigeria", // Keep existing country
        updated_at: new Date().toISOString(),
      })
      .eq("email", "ojigboleo+1@gmail.com")
      .select();

    if (updateError) {
      console.log("❌ Profile update failed:", updateError.message);
      console.log("Error code:", updateError.code);

      if (updateError.code === "42501") {
        console.log("This is an RLS (Row Level Security) error.");
        console.log("The RLS policies might still be too restrictive.");
        console.log(
          "Please run the COMPLETE_RLS_FIX.sql script in your Supabase SQL Editor."
        );
      }
    } else {
      console.log("✅ Profile updated successfully!");
      console.log("Updated profile:", updateData[0]);
    }

    // Check the updated profile
    console.log("\n2. Checking updated profile...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else if (profile && profile.length > 0) {
      console.log("✅ Profile found with updated data:");
      console.log("Phone:", profile[0].phone);
      console.log("Address:", profile[0].address);
      console.log("City:", profile[0].city);
      console.log("State:", profile[0].state);
      console.log("ZIP Code:", profile[0].zip_code);
      console.log("Country:", profile[0].country);
    }

    // Test the complete flow with a new user
    console.log("\n3. Testing complete flow with new user...");
    const testEmail = `phone-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+9876543210";

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
    console.log(
      "📧 After verification, profile should be created with phone from metadata"
    );

    // Check all profiles
    console.log("\n4. All profiles in database:");
    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select("*");

    if (allError) {
      console.error("Error fetching profiles:", allError);
    } else {
      console.log(`Found ${allProfiles.length} profiles in database`);
      allProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
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
  } catch (error) {
    console.error("Update failed:", error);
  }
}

updateExistingUserSimple();
