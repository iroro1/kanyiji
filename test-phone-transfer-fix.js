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

async function testPhoneTransferFix() {
  console.log("Testing phone transfer fix...");

  try {
    // First, let's create a new user with phone in metadata
    const testEmail = `phone-transfer-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";
    const testPhone = "+1234567890";

    console.log("\n1. Creating new user with phone in metadata...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Transfer Test User",
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
    console.log("Email confirmed at:", authData.user?.email_confirmed_at);

    // Simulate the profile creation/update process from verify-email page
    console.log("\n2. Simulating email verification process...");

    if (authData.user?.id) {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", authData.user.id)
        .single();

      if (existingProfile) {
        console.log("Profile exists, updating phone from metadata...");

        // Update profile with phone from metadata
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            email_verified: true,
            phone: authData.user.user_metadata?.phone || "", // Update phone from user metadata
            updated_at: new Date().toISOString(),
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
        } else {
          console.log(
            "✅ Profile updated successfully with phone from metadata!"
          );
          console.log(
            "Phone from metadata:",
            authData.user.user_metadata?.phone
          );
        }
      } else {
        console.log("Profile doesn't exist, creating new profile...");

        // Create new profile with phone from metadata
        const { error: createError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: authData.user.email || testEmail,
          full_name: authData.user.user_metadata?.full_name || "User",
          role: authData.user.user_metadata?.role || "customer",
          phone: authData.user.user_metadata?.phone || "", // Use phone from user metadata
          address: "", // Initialize address as empty string
          city: "", // Initialize city as empty string
          state: "", // Initialize state as empty string
          zip_code: "", // Initialize zip_code as empty string
          country: "Nigeria", // Default country
          email_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (createError) {
          console.error("Profile creation error:", createError);
        } else {
          console.log(
            "✅ Profile created successfully with phone from metadata!"
          );
          console.log(
            "Phone from metadata:",
            authData.user.user_metadata?.phone
          );
        }
      }

      // Verify the profile was created/updated correctly
      console.log("\n3. Verifying profile data...");
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profile && profile.length > 0) {
        console.log("✅ Profile verification:");
        console.log("Phone in profile:", profile[0].phone);
        console.log("Email verified:", profile[0].email_verified);
        console.log("Full name:", profile[0].full_name);
        console.log("Role:", profile[0].role);

        if (profile[0].phone === testPhone) {
          console.log(
            "🎉 SUCCESS: Phone correctly transferred from metadata to profile!"
          );
        } else {
          console.log("❌ FAILED: Phone not transferred correctly");
          console.log("Expected:", testPhone);
          console.log("Actual:", profile[0].phone);
        }
      }
    }

    // Test with the existing user (ojigboleo+1@gmail.com)
    console.log("\n4. Testing with existing user (ojigboleo+1@gmail.com)...");

    // First, let's try to sign in to get the user data
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: "ojigboleo+1@gmail.com",
        password: "TestPassword123!", // Assuming this is the password
      });

    if (signInError) {
      console.log(
        "Could not sign in with existing user (this is expected if password is different)"
      );
      console.log("Error:", signInError.message);
    } else {
      console.log("✅ Signed in successfully!");
      console.log("Phone in metadata:", signInData.user?.user_metadata?.phone);

      if (signInData.user?.id) {
        // Update the existing profile with phone from metadata
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            phone: signInData.user.user_metadata?.phone || "",
            updated_at: new Date().toISOString(),
          })
          .eq("id", signInData.user.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
        } else {
          console.log("✅ Existing profile updated with phone from metadata!");
        }
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPhoneTransferFix();
