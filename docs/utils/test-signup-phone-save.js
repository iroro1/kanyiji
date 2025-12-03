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

async function testSignupPhoneSave() {
  console.log("Testing if signup saves phone in profiles table...");

  try {
    // Test 1: Check current profiles
    console.log("\n1. Checking current profiles...");
    const { data: currentProfiles, error: currentError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (currentError) {
      console.error("Error fetching profiles:", currentError);
      return;
    }

    console.log(`Found ${currentProfiles.length} profiles:`);
    currentProfiles.forEach((profile, index) => {
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

    // Test 2: Create a new user to test the signup flow
    console.log("\n2. Testing signup flow...");
    const testEmail = `phone-save-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";

    console.log(`Creating user: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Save Test User",
          role: "customer",
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

    console.log("✅ User created:", authData.user?.id);
    console.log("📧 Check your email and verify to test profile creation");

    // Test 3: Check if profile was created immediately (should be empty due to RLS)
    console.log("\n3. Checking if profile was created immediately...");
    const { data: immediateProfile, error: immediateError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (immediateError) {
      console.error("Immediate profile check error:", immediateError);
    } else {
      console.log(
        `Found ${immediateProfile.length} profiles immediately after signup`
      );
      if (immediateProfile.length > 0) {
        console.log("Profile data:", immediateProfile[0]);
      }
    }

    // Test 4: Instructions for manual verification
    console.log("\n4. Manual verification required:");
    console.log(
      `🔗 Go to: http://localhost:3000/verify-email?email=${encodeURIComponent(
        testEmail
      )}`
    );
    console.log("📧 Enter the 6-digit code from your email");
    console.log(
      "✅ After verification, the profile should be created with phone field"
    );
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testSignupPhoneSave();
