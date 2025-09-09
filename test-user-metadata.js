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

async function testUserMetadata() {
  console.log("Testing user metadata for ojigboleo+1@gmail.com...");

  try {
    // Get the user from auth.users table
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Error getting user:", userError);
      return;
    }

    if (!user) {
      console.log(
        "No authenticated user found. Let's check the auth.users table directly..."
      );

      // Try to get user by email from the database
      const { data: authUsers, error: authError } = await supabase
        .from("auth.users")
        .select("*")
        .eq("email", "ojigboleo+1@gmail.com");

      if (authError) {
        console.error("Error querying auth.users:", authError);
        return;
      }

      if (authUsers && authUsers.length > 0) {
        const authUser = authUsers[0];
        console.log("Found user in auth.users table:");
        console.log("Email:", authUser.email);
        console.log("Raw user meta data:", authUser.raw_user_meta_data);
        console.log("Phone in metadata:", authUser.raw_user_meta_data?.phone);
        console.log(
          "Full name in metadata:",
          authUser.raw_user_meta_data?.full_name
        );
        console.log("Role in metadata:", authUser.raw_user_meta_data?.role);
      } else {
        console.log("No user found with email ojigboleo+1@gmail.com");
      }
    } else {
      console.log("Current authenticated user:");
      console.log("Email:", user.email);
      console.log("User metadata:", user.user_metadata);
      console.log("Phone in metadata:", user.user_metadata?.phone);
    }

    // Also check the profiles table
    console.log("\nChecking profiles table...");
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (profileError) {
      console.error("Error querying profiles:", profileError);
    } else if (profiles && profiles.length > 0) {
      console.log("Profile found:");
      console.log("Phone in profile:", profiles[0].phone);
      console.log("Email verified:", profiles[0].email_verified);
    } else {
      console.log("No profile found for ojigboleo+1@gmail.com");
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testUserMetadata();
