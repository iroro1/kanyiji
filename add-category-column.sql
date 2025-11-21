-- =============================================
-- 🌿 ADD CATEGORY_ID COLUMN TO PRODUCTS
-- =============================================
-- NOTE: This script assumes the categories table already exists
-- If you get an error "relation 'categories' does not exist",
-- run setup-categories-table.sql instead, which creates both the table and column

-- Step 1: Ensure categories table exists first
-- (If this fails, run setup-categories-table.sql)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'categories') THEN
    RAISE EXCEPTION 'Categories table does not exist. Please run setup-categories-table.sql first.';
  END IF;
END $$;

-- Step 2: Add category_id column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Step 3: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Verify
SELECT 
  'category_id column added' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'category_id'
    ) THEN 'SUCCESS'
    ELSE 'FAILED'
  END as result;

