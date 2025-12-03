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

async function updateExistingProfile() {
  console.log("Updating existing profile...");

  try {
    // First, let's try to create the profile manually for ojigboleo+1@gmail.com
    console.log("\n1. Creating profile for ojigboleo+1@gmail.com...");

    const profileData = {
      id: "72c7f905-3f13-4796-ae66-c6eea108927d", // Use the ID from your data
      email: "ojigboleo+1@gmail.com",
      full_name: "Leo Oj",
      role: "customer",
      phone: "+1234567890", // Add a phone number
      address: "123 Main Street", // Add address
      city: "Lagos", // Add city
      state: "Lagos State", // Add state
      zip_code: "100001", // Add zip code
      country: "Nigeria",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from("profiles")
      .insert(profileData)
      .select();

    if (insertError) {
      console.log("❌ Profile creation failed:", insertError.message);
      console.log("Error code:", insertError.code);

      if (insertError.code === "42501") {
        console.log("💡 RLS policy is blocking profile creation");
        console.log(
          "🔧 You need to run the RLS fix SQL in Supabase SQL Editor"
        );
      }
    } else {
      console.log("✅ Profile created successfully!");
      console.log("Profile data:", insertData[0]);
    }

    // Check if profile exists now
    console.log("\n2. Checking if profile exists...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else if (profile && profile.length > 0) {
      console.log("✅ Profile found:", profile[0]);
      console.log("Phone field:", profile[0].phone);
      console.log("Address field:", profile[0].address);
      console.log("City field:", profile[0].city);
    } else {
      console.log("❌ Profile still not found");
    }

    // Test with a new user
    console.log("\n3. Testing with new user...");
    const testEmail = `new-user-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+9876543210";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "New User Test",
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

updateExistingProfile();
