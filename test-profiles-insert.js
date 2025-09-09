// Test profiles table insert
// Run this with: node test-profiles-insert.js

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testProfilesInsert() {
  try {
    console.log("=== Testing Profiles Table Insert ===");

    // Test data
    const testProfile = {
      id: "00000000-0000-0000-0000-000000000001",
      email: "test2@example.com",
      full_name: "Test User 2",
      role: "customer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("Attempting to insert profile:", testProfile);

    const { data, error } = await supabase
      .from("profiles")
      .insert(testProfile)
      .select();

    if (error) {
      console.error("❌ Insert failed:", error.message);
      console.error("Error code:", error.code);
      console.error("Error details:", error.details);
      console.error("Error hint:", error.hint);
    } else {
      console.log("✅ Insert successful:", data);
    }

    // Test reading profiles
    console.log("\n=== Testing Profiles Table Read ===");
    const { data: profiles, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .limit(5);

    if (readError) {
      console.error("❌ Read failed:", readError.message);
    } else {
      console.log("✅ Read successful, found", profiles.length, "profiles");
      console.log("Profiles:", profiles);
    }
  } catch (err) {
    console.error("❌ Test failed:", err.message);
  }
}

testProfilesInsert();
