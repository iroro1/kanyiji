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

async function testDatabaseTrigger() {
  console.log("Testing database trigger for profile creation...");

  try {
    // Test 1: Check if profiles table exists
    console.log("\n1. Checking profiles table...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (profilesError) {
      console.error("Error accessing profiles table:", profilesError);
      return;
    }

    console.log(
      "Profiles table accessible. Current profiles:",
      profiles.length
    );

    // Test 2: Check if trigger exists
    console.log("\n2. Checking if trigger exists...");
    const { data: triggers, error: triggersError } = await supabase.rpc(
      "get_triggers",
      { table_name: "auth.users" }
    );

    if (triggersError) {
      console.log(
        "Could not check triggers (this is normal):",
        triggersError.message
      );
    } else {
      console.log("Triggers found:", triggers);
    }

    // Test 3: Check current profiles
    console.log("\n3. Current profiles in database:");
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from("profiles")
      .select("*");

    if (allProfilesError) {
      console.error("Error fetching profiles:", allProfilesError);
    } else {
      console.log(`Found ${allProfiles.length} profiles:`);
      allProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role,
          email_verified: profile.email_verified,
          created_at: profile.created_at,
        });
      });
    }

    // Test 4: Check auth.users table (if accessible)
    console.log("\n4. Checking auth.users (if accessible)...");
    try {
      const { data: authUsers, error: authUsersError } = await supabase
        .from("auth.users")
        .select("id, email, email_confirmed_at, raw_user_meta_data")
        .limit(5);

      if (authUsersError) {
        console.log(
          "Cannot access auth.users directly (this is normal):",
          authUsersError.message
        );
      } else {
        console.log(`Found ${authUsers.length} users in auth.users:`);
        authUsers.forEach((user, index) => {
          console.log(`User ${index + 1}:`, {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            raw_user_meta_data: user.raw_user_meta_data,
          });
        });
      }
    } catch (error) {
      console.log("Cannot access auth.users (this is normal):", error.message);
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testDatabaseTrigger();
