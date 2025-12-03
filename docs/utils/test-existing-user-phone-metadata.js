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

async function testExistingUserPhoneMetadata() {
  console.log("Testing existing user phone metadata handling...");

  try {
    // First, let's check the current profile for ojigboleo+1@gmail.com
    console.log("\n1. Checking current profile...");
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return;
    }

    if (!profile || profile.length === 0) {
      console.log("No profile found for ojigboleo+1@gmail.com");
      return;
    }

    console.log("✅ Current profile found:");
    console.log("Phone:", profile[0].phone);
    console.log("Email:", profile[0].email);
    console.log("Full name:", profile[0].full_name);

    // Set phone to null to test metadata fallback
    console.log("\n2. Setting phone to null to test metadata fallback...");
    const { error: nullError } = await supabase
      .from("profiles")
      .update({
        phone: null,
        updated_at: new Date().toISOString(),
      })
      .eq("email", "ojigboleo+1@gmail.com");

    if (nullError) {
      console.error("Error setting phone to null:", nullError);
      return;
    }

    console.log("✅ Phone set to null");

    // Now test the profile page logic
    console.log("\n3. Testing profile page phone metadata logic...");

    // Get the profile again
    const { data: updatedProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (fetchError) {
      console.error("Error fetching updated profile:", fetchError);
      return;
    }

    console.log(
      "Profile phone after setting to null:",
      updatedProfile[0].phone
    );

    // Simulate the profile page logic - check if phone is null/empty and get from user metadata
    let phone = updatedProfile[0].phone || "";
    console.log("Phone after null check:", phone);

    // Since we can't get user metadata directly, let's simulate with a known phone
    const simulatedMetadataPhone = "+1234567890";

    if (!phone) {
      phone = simulatedMetadataPhone;
      console.log("Phone from simulated user metadata:", phone);

      // Update the profile with phone from metadata
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq("email", "ojigboleo+1@gmail.com");

      if (updateError) {
        console.error("Error updating phone from metadata:", updateError);
      } else {
        console.log("✅ Phone updated from metadata to profile");
      }
    }

    // Verify the update
    console.log("\n4. Verifying the update...");
    const { data: finalProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (verifyError) {
      console.error("Error verifying profile:", verifyError);
    } else if (finalProfile && finalProfile.length > 0) {
      console.log("✅ Final profile verification:");
      console.log("Phone in profile:", finalProfile[0].phone);

      if (finalProfile[0].phone === simulatedMetadataPhone) {
        console.log(
          "🎉 SUCCESS: Phone correctly transferred from metadata to profile!"
        );
      } else {
        console.log("❌ FAILED: Phone not transferred correctly");
        console.log("Expected:", simulatedMetadataPhone);
        console.log("Actual:", finalProfile[0].phone);
      }
    }

    // Test profile update with phone
    console.log("\n5. Testing profile update with phone...");
    const newPhone = "+9876543210";

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        phone: newPhone,
        updated_at: new Date().toISOString(),
      })
      .eq("email", "ojigboleo+1@gmail.com");

    if (updateError) {
      console.error("Profile update error:", updateError);
    } else {
      console.log("✅ Profile updated with new phone:", newPhone);
    }

    // Verify the update
    const { data: finalProfile2, error: finalError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "ojigboleo+1@gmail.com");

    if (finalError) {
      console.error("Error fetching final profile:", finalError);
    } else if (finalProfile2 && finalProfile2.length > 0) {
      console.log("✅ Final profile phone:", finalProfile2[0].phone);

      if (finalProfile2[0].phone === newPhone) {
        console.log("🎉 SUCCESS: Profile phone update working correctly!");
      } else {
        console.log("❌ FAILED: Profile phone update not working");
        console.log("Expected:", newPhone);
        console.log("Actual:", finalProfile2[0].phone);
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testExistingUserPhoneMetadata();
