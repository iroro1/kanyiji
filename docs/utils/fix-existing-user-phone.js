const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  console.log("Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local");
  process.exit(1);
}

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixExistingUserPhone() {
  console.log("Fixing existing user phone from metadata...");

  try {
    // Get the user from auth.users table using admin client
    console.log("\n1. Getting user from auth.users table...");
    const { data: authUsers, error: authError } = await supabaseAdmin
      .from("auth.users")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (authError) {
      console.error("Error querying auth.users:", authError);
      return;
    }

    if (!authUsers || authUsers.length === 0) {
      console.log("No user found with email ojigboleo+1@gmail.com");
      return;
    }

    const authUser = authUsers[0];
    console.log("✅ Found user in auth.users table:");
    console.log("Email:", authUser.email);
    console.log("User ID:", authUser.id);
    console.log("Raw user meta data:", authUser.raw_user_meta_data);
    console.log("Phone in metadata:", authUser.raw_user_meta_data?.phone);

    // Get the current profile
    console.log("\n2. Getting current profile...");
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", authUser.id);

    if (profileError) {
      console.error("Error querying profiles:", profileError);
      return;
    }

    if (!profiles || profiles.length === 0) {
      console.log("No profile found for this user");
      return;
    }

    const profile = profiles[0];
    console.log("✅ Current profile:");
    console.log("Phone:", profile.phone);
    console.log("Email verified:", profile.email_verified);

    // Update the profile with phone from metadata
    console.log("\n3. Updating profile with phone from metadata...");
    const phoneFromMetadata = authUser.raw_user_meta_data?.phone || "";

    const { data: updateData, error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({
        phone: phoneFromMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id)
      .select();

    if (updateError) {
      console.error("Profile update error:", updateError);
      return;
    }

    console.log("✅ Profile updated successfully!");
    console.log("Updated profile:", updateData[0]);

    // Verify the update
    console.log("\n4. Verifying the update...");
    const { data: updatedProfile, error: verifyError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", authUser.id);

    if (verifyError) {
      console.error("Error verifying profile:", verifyError);
    } else if (updatedProfile && updatedProfile.length > 0) {
      console.log("✅ Final profile verification:");
      console.log("Phone:", updatedProfile[0].phone);
      console.log("Email:", updatedProfile[0].email);
      console.log("Full name:", updatedProfile[0].full_name);
      console.log("Email verified:", updatedProfile[0].email_verified);

      if (updatedProfile[0].phone === phoneFromMetadata) {
        console.log("🎉 SUCCESS: Phone correctly updated from metadata!");
      } else {
        console.log("❌ FAILED: Phone not updated correctly");
        console.log("Expected:", phoneFromMetadata);
        console.log("Actual:", updatedProfile[0].phone);
      }
    }
  } catch (error) {
    console.error("Fix failed:", error);
  }
}

fixExistingUserPhone();
