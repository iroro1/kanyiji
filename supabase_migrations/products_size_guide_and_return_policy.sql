-- Add size guide (style guide) URL and third party return policy to products
-- Run this in Supabase SQL editor: Supabase Dashboard > SQL Editor > New query

-- size_guide_url: stores the public URL of the uploaded size/style guide (JPG, PNG, PDF)
ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide_url TEXT;

-- third_party_return_policy: optional vendor return policy text
ALTER TABLE products ADD COLUMN IF NOT EXISTS third_party_return_policy TEXT;
