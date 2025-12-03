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

async function testAPIProfileCreation() {
  console.log("Testing API profile creation...");

  try {
    // Test 1: Check if API route exists
    console.log("\n1. Testing API route...");

    const response = await fetch("http://localhost:3000/api/create-profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "5e7efea3-6360-4bff-b499-4d43962496d6",
        email: "phone-save-test-1757378371882@gmail.com",
        fullName: "Phone Save Test User",
        role: "customer",
        emailVerified: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ API route error:", response.status, errorText);
    } else {
      const data = await response.json();
      console.log("✅ API route success:", data);
    }

    // Test 2: Check if profile was created
    console.log("\n2. Checking if profile was created...");
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", "phone-save-test-1757378371882@gmail.com");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    } else {
      console.log(`Found ${profiles.length} profiles`);
      if (profiles.length > 0) {
        console.log("Profile data:", profiles[0]);
        console.log("Phone field:", profiles[0].phone);
      }
    }
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testAPIProfileCreation();
