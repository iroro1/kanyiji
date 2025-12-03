// Test database access
// Run this with: node test-database.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  try {
    console.log("=== Testing Database Access ===");

    // Test profiles table exists
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .limit(1);

    if (profilesError) {
      console.error("❌ Profiles table error:", profilesError.message);
      console.error("Error code:", profilesError.code);
      console.error("Error details:", profilesError.details);
      return;
    }

    console.log("✅ Profiles table accessible");
    console.log("Current profiles count:", profiles.length);

    // Test inserting a test profile (will fail due to RLS, but that's expected)
    const testProfile = {
      id: "00000000-0000-0000-0000-000000000000",
      email: "test@example.com",
      full_name: "Test User",
      role: "customer",
    };

    const { error: insertError } = await supabase
      .from("profiles")
      .insert(testProfile);

    if (insertError) {
      if (insertError.code === "42501") {
        console.log("✅ RLS is working (insert blocked as expected)");
      } else {
        console.log("Insert error (expected):", insertError.message);
      }
    }

    console.log("\n✅ Database test complete!");
  } catch (err) {
    console.error("❌ Database test failed:", err.message);
  }
}

testDatabase();
