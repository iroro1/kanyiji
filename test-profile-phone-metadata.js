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

async function testProfilePhoneMetadata() {
  console.log("Testing profile phone metadata handling...");

  try {
    // Create a new user with phone in metadata
    const testEmail = `profile-phone-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    console.log("\n1. Creating new user with phone in metadata...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Profile Phone Test User",
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
    console.log("Phone in metadata:", authData.user?.user_metadata?.phone);

    // Create a profile with null phone (simulating the old scenario)
    console.log("\n2. Creating profile with null phone...");
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      email: authData.user.email || testEmail,
      full_name: authData.user.user_metadata?.full_name || "User",
      role: authData.user.user_metadata?.role || "customer",
      phone: null, // Set phone as null to test metadata fallback
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "Nigeria",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return;
    }

    console.log("✅ Profile created with null phone");

    // Now test the profile page logic
    console.log("\n3. Testing profile page phone metadata logic...");

    // Get the profile
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (fetchError) {
      console.error("Error fetching profile:", fetchError);
      return;
    }

    console.log("Profile phone before metadata check:", profile.phone);

    // Simulate the profile page logic
    let phone = profile.phone || "";
    if (!phone && authData.user?.user_metadata?.phone) {
      phone = authData.user.user_metadata.phone;
      console.log("Phone from user metadata:", phone);

      // Update the profile with phone from metadata
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          phone: phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authData.user.id);

      if (updateError) {
        console.error("Error updating phone from metadata:", updateError);
      } else {
        console.log("✅ Phone updated from metadata to profile");
      }
    }

    // Verify the update
    console.log("\n4. Verifying the update...");
    const { data: updatedProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id);

    if (verifyError) {
      console.error("Error verifying profile:", verifyError);
    } else if (updatedProfile) {
      console.log("✅ Final profile verification:");
      console.log("Phone in profile:", updatedProfile.phone);
      console.log("Phone in metadata:", authData.user?.user_metadata?.phone);

      if (updatedProfile.phone === testPhone) {
        console.log(
          "🎉 SUCCESS: Phone correctly transferred from metadata to profile!"
        );
      } else {
        console.log("❌ FAILED: Phone not transferred correctly");
        console.log("Expected:", testPhone);
        console.log("Actual:", updatedProfile.phone);
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
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Profile update error:", updateError);
    } else {
      console.log("✅ Profile updated with new phone:", newPhone);
    }

    // Verify the update
    const { data: finalProfile, error: finalError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id);

    if (finalError) {
      console.error("Error fetching final profile:", finalError);
    } else if (finalProfile) {
      console.log("✅ Final profile phone:", finalProfile.phone);

      if (finalProfile.phone === newPhone) {
        console.log("🎉 SUCCESS: Profile phone update working correctly!");
      } else {
        console.log("❌ FAILED: Profile phone update not working");
        console.log("Expected:", newPhone);
        console.log("Actual:", finalProfile.phone);
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testProfilePhoneMetadata();
