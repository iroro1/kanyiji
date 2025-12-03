// Test Supabase connection
// Run this with: node test-supabase.js

const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("=== Supabase Configuration Test ===");
console.log("URL:", supabaseUrl);
console.log("Key exists:", !!supabaseAnonKey);
console.log("Key length:", supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing environment variables!");
  console.log("Make sure you have .env.local with:");
  console.log("NEXT_PUBLIC_SUPABASE_URL=your_url");
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key");
  process.exit(1);
}

// Test connection
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log("\n=== Testing Supabase Connection ===");

    // Test auth
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();
    console.log("Session test:", sessionError ? "Error" : "Success");
    if (sessionError) console.log("Session error:", sessionError.message);

    // Test database
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.log("Database test:", "Error");
      console.log("Database error:", error.message);
    } else {
      console.log("Database test:", "Success");
    }

    console.log("\n✅ Supabase connection test complete!");
  } catch (err) {
    console.error("❌ Connection test failed:", err.message);
  }
}

testConnection();
