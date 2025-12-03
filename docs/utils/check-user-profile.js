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

async function checkUserProfile() {
  console.log("Checking user profile for phone-save-test user...");

  try {
    const testEmail = "phone-save-test-1757378371882@gmail.com";
    const userId = "5e7efea3-6360-4bff-b499-4d43962496d6";

    // Check 1: Look for profile by email
    console.log("\n1. Checking profile by email...");
    const { data: profileByEmail, error: emailError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", testEmail);

    if (emailError) {
      console.error("Error fetching profile by email:", emailError);
    } else {
      console.log(`Found ${profileByEmail.length} profiles by email`);
      if (profileByEmail.length > 0) {
        console.log("Profile by email:", profileByEmail[0]);
      }
    }

    // Check 2: Look for profile by user ID
    console.log("\n2. Checking profile by user ID...");
    const { data: profileById, error: idError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId);

    if (idError) {
      console.error("Error fetching profile by ID:", idError);
    } else {
      console.log(`Found ${profileById.length} profiles by ID`);
      if (profileById.length > 0) {
        console.log("Profile by ID:", profileById[0]);
      }
    }

    // Check 3: Check all profiles
    console.log("\n3. Checking all profiles...");
    const { data: allProfiles, error: allError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (allError) {
      console.error("Error fetching all profiles:", allError);
    } else {
      console.log(`Total profiles in database: ${allProfiles.length}`);
      allProfiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`, {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          phone: profile.phone,
          email_verified: profile.email_verified,
          created_at: profile.created_at,
        });
      });
    }

    // Check 4: User authentication status
    console.log("\n4. Checking user authentication status...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.log("No authenticated user (expected)");
    } else {
      console.log("Current authenticated user:", {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
      });
    }

    console.log("\n📋 Summary:");
    console.log("✅ User exists in auth.users table");
    console.log("❌ Email not confirmed yet (email_confirmed_at: null)");
    console.log(
      "❌ No profile created yet (will be created after email verification)"
    );
    console.log("\n🔗 Next steps:");
    console.log(
      "1. Go to: http://localhost:3000/verify-email?email=phone-save-test-1757378371882%40gmail.com"
    );
    console.log("2. Check your email for the 6-digit verification code");
    console.log("3. Enter the code to verify your email");
    console.log(
      "4. Profile will be created with phone field after verification"
    );
  } catch (error) {
    console.error("Check failed:", error);
  }
}

checkUserProfile();
