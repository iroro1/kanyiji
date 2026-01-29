-- Add size guide and third party return policy to products (for product upload and product detail page)
-- Run this in Supabase SQL editor if the columns do not exist.

ALTER TABLE products ADD COLUMN IF NOT EXISTS size_guide_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS third_party_return_policy TEXT;
