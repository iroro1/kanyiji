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

async function runMigration() {
  console.log("Running profile fields migration...");

  try {
    // Read the SQL migration file
    const fs = require("fs");
    const path = require("path");

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, "add-profile-fields.sql"),
      "utf8"
    );

    console.log("Migration SQL:", migrationSQL);

    // Execute the migration
    const { data, error } = await supabase.rpc("exec_sql", {
      sql: migrationSQL,
    });

    if (error) {
      console.error("Migration error:", error);
      console.log(
        "\n⚠️  You may need to run this SQL manually in your Supabase SQL Editor:"
      );
      console.log("=".repeat(60));
      console.log(migrationSQL);
      console.log("=".repeat(60));
    } else {
      console.log("✅ Migration completed successfully:", data);
    }
  } catch (error) {
    console.error("Migration failed:", error);
    console.log(
      "\n⚠️  Please run the following SQL manually in your Supabase SQL Editor:"
    );
    console.log("=".repeat(60));
    console.log(`
-- Add additional profile fields to the profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Nigeria';

-- Update existing profiles with default country if not set
UPDATE profiles 
SET country = 'Nigeria' 
WHERE country IS NULL;
    `);
    console.log("=".repeat(60));
  }
}

runMigration();
