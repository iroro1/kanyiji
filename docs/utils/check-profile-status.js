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

async function checkProfileStatus() {
  console.log("Checking profile status...");

  try {
    // Check 1: All profiles in database
    console.log("\n1. Checking all profiles in database...");
    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

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
          email_verified: profile.email_verified,
          created_at: profile.created_at,
        });
      });
    }

    // Check 2: Check for specific user
    console.log("\n2. Checking for ojigboleo+1@gmail.com...");
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (userError) {
      console.error("Error fetching user profile:", userError);
    } else {
      console.log(
        `Found ${userProfile.length} profiles for ojigboleo+1@gmail.com`
      );
      if (userProfile.length > 0) {
        console.log("User profile:", userProfile[0]);
      } else {
        console.log("❌ No profile found for ojigboleo+1@gmail.com");
        console.log("💡 This means the user hasn't verified their email yet");
      }
    }

    // Check 3: Check if we can create a profile manually
    console.log("\n3. Testing profile creation...");

    // First, let's try to sign up a new user to test the flow
    const testEmail = `profile-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    console.log(`Creating test user: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Profile Test User",
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

    console.log("✅ Test user created!");
    console.log("User metadata:", authData.user?.user_metadata);
    console.log(
      `🔗 Verify at: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );

    // Check 4: Instructions
    console.log("\n4. Instructions to fix the profile issue:");
    console.log("📧 For ojigboleo+1@gmail.com:");
    console.log("   1. Check your email for verification code");
    console.log(
      "   2. Go to: http://localhost:3000/verify-email?email=ojigboleo%2B1%40gmail.com"
    );
    console.log("   3. Enter the 6-digit code");
    console.log("   4. Profile will be created with phone field");
    console.log(
      "   5. Then go to http://localhost:3000/profile to see the fields"
    );
  } catch (error) {
    console.error("Check failed:", error);
  }
}

checkProfileStatus();
