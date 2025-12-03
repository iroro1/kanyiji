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

async function debugSignupFlow() {
  console.log("Debugging signup flow...");

  try {
    // Test 1: Check if we can access the profiles table
    console.log("\n1. Checking profiles table access...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*");

    if (profilesError) {
      console.error("Cannot access profiles table:", profilesError);
      return;
    }

    console.log(
      `Profiles table accessible. Found ${profiles.length} profiles.`
    );

    // Test 2: Check current session
    console.log("\n2. Checking current session...");
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

    // Test 3: Try to sign up with a real email format
    console.log("\n3. Testing signup with real email format...");
    const testEmail = `testuser${Date.now()}@gmail.com`; // Use gmail.com for better compatibility
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
      console.error("Error details:", {
        code: authError.code,
        message: authError.message,
        status: authError.status,
      });
      return;
    }

    console.log("Signup successful!");
    console.log("Auth data:", {
      user_id: authData.user?.id,
      email: authData.user?.email,
      email_confirmed_at: authData.user?.email_confirmed_at,
      requires_verification: authData.user?.email_confirmed_at === null,
    });

    // Test 4: Check if profile was created by trigger
    console.log("\n4. Checking if profile was created by trigger...");

    // Wait a moment for the trigger to execute
    await new Promise((resolve) => setTimeout(resolve, 3000));

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
      } else {
        console.log("No profile found - trigger may not be working");
      }
    }

    // Test 5: Try to login with the created user
    console.log("\n5. Testing login with created user...");

    // First sign out to clear any existing session
    await supabase.auth.signOut();

    const { data: loginData, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

    if (loginError) {
      console.error("Login error:", loginError);
      console.error("Login error details:", {
        code: loginError.code,
        message: loginError.message,
        status: loginError.status,
      });
    } else {
      console.log("Login successful!");
      console.log("Login data:", {
        user_id: loginData.user?.id,
        email: loginData.user?.email,
        email_confirmed_at: loginData.user?.email_confirmed_at,
      });
    }
  } catch (error) {
    console.error("Debug failed:", error);
  }
}

debugSignupFlow();
