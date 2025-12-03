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

async function testPhoneFix() {
  console.log("Testing phone field fix...");

  try {
    // Test 1: Check current profiles
    console.log("\n1. Checking current profiles...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return;
    }

    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
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
      });
    });

    // Test 2: Update existing profiles to have empty phone fields
    console.log("\n2. Updating existing profiles...");

    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update({
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "Nigeria",
      })
      .is("phone", null)
      .select();

    if (updateError) {
      console.error("Update error:", updateError);
    } else {
      console.log("✅ Updated profiles:", updateData);
    }

    // Test 3: Test profile creation with phone field
    console.log("\n3. Testing profile creation with phone...");

    const testEmail = `phone-fix-test-${Date.now()}@gmail.com`;
    const testPassword = "TestPassword123!";

    console.log(`Creating user: ${testEmail}`);

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: "Phone Fix Test User",
          role: "customer",
        },
      },
    });

    if (authError) {
      console.error("Signup error:", authError);
      return;
    }

    console.log("✅ User created:", authData.user?.id);
    console.log(
      "📧 Check your email and verify to create profile with phone field"
    );
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testPhoneFix();
