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

async function debugPhoneTransferIssue() {
  console.log("Debugging phone transfer issue...");

  try {
    // Test 1: Check the specific user's profile
    console.log("\n1. Checking ojigboleo+1@gmail.com profile...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    } else if (profile && profile.length > 0) {
      console.log("Profile found:", profile[0]);
      console.log("Phone field:", profile[0].phone);
      console.log("Phone is null:", profile[0].phone === null);
    } else {
      console.log("No profile found");
    }

    // Test 2: Create a new user with phone to test the current flow
    console.log("\n2. Testing current flow with new user...");
    const testEmail = `phone-transfer-debug-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    console.log(`Creating user: ${testEmail} with phone: ${testPhone}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Transfer Debug User",
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
    console.log("User metadata:", authData.user?.user_metadata);
    console.log("Phone in metadata:", authData.user?.user_metadata?.phone);

    // Test 3: Check if profile exists before verification
    console.log("\n3. Checking profile before verification...");
    const { data: profileBefore, error: profileBeforeError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (profileBeforeError) {
      console.error("Error fetching profile:", profileBeforeError);
    } else {
      console.log(`Found ${profileBefore.length} profiles before verification`);
    }

    // Test 4: Instructions for testing
    console.log("\n4. Testing instructions:");
    console.log(
      `🔗 Go to: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
    console.log("📧 Enter the 6-digit code from your email");
    console.log(
      "✅ After verification, check if profile is created with phone from metadata"
    );

    // Test 5: Check all profiles
    console.log("\n5. All profiles in database:");
    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select("*");

    if (allError) {
      console.error("Error fetching profiles:", allError);
    } else {
      console.log(`Found ${allProfiles.length} profiles in database`);
      allProfiles.forEach((profile, index) => {
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

    // Test 6: Solution for existing user
    console.log("\n6. Solution for existing user (ojigboleo+1@gmail.com):");
    console.log(
      "The phone is null because this user was created before our phone metadata fix."
    );
    console.log("Options:");
    console.log("1. Update the profile manually in Supabase dashboard");
    console.log("2. Create a new user with phone number");
    console.log("3. Update the profile via API (if you have the phone number)");
  } catch (error) {
    console.error("Debug failed:", error);
  }
}

debugPhoneTransferIssue();
