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

async function testEmailConfirmation() {
  console.log("Testing email confirmation flow...");

  try {
    // Test 1: Check current users and their confirmation status
    console.log("\n1. Checking current users...");

    // We can't directly query auth.users, but we can check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    } else {
      console.log(`Found ${profiles.length} profiles:`);
      profiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          email_verified: profile.email_verified,
          created_at: profile.created_at,
        });
      });
    }

    // Test 2: Try to sign up a test user
    console.log("\n2. Testing signup process...");
    const testEmail = `test-confirmation-${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";

    console.log(`Attempting signup with email: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Test User",
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

    console.log("Signup successful!");
    console.log("Auth data:", {
      user_id: authData.user?.id,
      email: authData.user?.email,
      email_confirmed_at: authData.user?.email_confirmed_at,
      requires_verification: authData.user?.email_confirmed_at === null,
    });

    // Test 3: Check if profile was created
    console.log("\n3. Checking if profile was created...");

    // Wait a moment for the profile to be created
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const { data: newProfile, error: newProfileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (newProfileError) {
      console.error("Error fetching new profile:", newProfileError);
    } else {
      console.log(`Found ${newProfile.length} profiles for test email`);
      if (newProfile.length > 0) {
        console.log("New profile data:", newProfile[0]);
      }
    }

    // Test 4: Check Supabase project settings
    console.log("\n4. Checking project configuration...");
    console.log("Supabase URL:", supabaseUrl);
    console.log(
      "App URL:",
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    );

    // Test 5: Try to get current session
    console.log("\n5. Checking current session...");
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
    } else {
      console.log("Current session:", {
        hasSession: !!session.session,
        user: session.session?.user?.email,
        email_confirmed_at: session.session?.user?.email_confirmed_at,
      });
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testEmailConfirmation();
