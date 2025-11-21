-- =============================================
-- 🌿 SETUP CATEGORIES TABLE AND COLUMN
-- =============================================
-- This script creates the categories table and adds category_id to products
-- Run this in Supabase SQL Editor

-- Step 1: Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);

-- Step 3: Add category_id column to products table if it doesn't exist
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;

-- Step 4: Create index for category_id in products table
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Step 5: Seed categories with hardcoded data
INSERT INTO categories (id, name, slug, description, image_url, sort_order, is_active, product_count) VALUES
-- Fashion & Textiles
('00000000-0000-0000-0000-000000000001', 'Fashion & Textiles', 'fashion-textiles', 'Traditional and modern African clothing, fabrics, and accessories', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 1, true, 0),

-- Arts & Crafts
('00000000-0000-0000-0000-000000000002', 'Arts & Crafts', 'arts-crafts', 'Handcrafted Nigerian art, pottery, and traditional crafts', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 2, true, 0),

-- Food & Beverages
('00000000-0000-0000-0000-000000000003', 'Food & Beverages', 'food-beverages', 'Authentic African spices, teas, honey, and traditional foods', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 3, true, 0),

-- Home & Décor
('00000000-0000-0000-0000-000000000004', 'Home & Décor', 'home-decor', 'Nigerian-inspired home decoration, furniture, and accessories', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 4, true, 0),

-- Beauty & Wellness
('00000000-0000-0000-0000-000000000005', 'Beauty & Wellness', 'beauty-wellness', 'Natural Nigerian beauty products, skincare, and hair care', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 5, true, 0),

-- Jewelry & Accessories
('00000000-0000-0000-0000-000000000006', 'Jewelry & Accessories', 'jewelry-accessories', 'Traditional Nigerian jewelry, beads, and accessories', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 6, true, 0),

-- Art & Collectibles
('00000000-0000-0000-0000-000000000007', 'Art & Collectibles', 'art-collectibles', 'Original artwork, sculptures, and unique collectible items', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 7, true, 0),

-- Electronics & Gadgets
('00000000-0000-0000-0000-000000000008', 'Electronics & Gadgets', 'electronics-gadgets', 'African-made electronics and tech accessories', 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 8, true, 0),

-- Books & Media
('00000000-0000-0000-0000-000000000009', 'Books & Media', 'books-media', 'African literature, music, and educational materials', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 9, true, 0),

-- Toys & Games
('00000000-0000-0000-0000-000000000010', 'Toys & Games', 'toys-games', 'Traditional and modern African games and toys', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 10, true, 0),

-- Sports & Outdoors
('00000000-0000-0000-0000-000000000011', 'Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 11, true, 0),

-- Kitchen & Dining
('00000000-0000-0000-0000-000000000012', 'Kitchen & Dining', 'kitchen-dining', 'Traditional cookware, dining sets, and kitchen accessories', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 12, true, 0),

-- Health & Medical
('00000000-0000-0000-0000-000000000013', 'Health & Medical', 'health-medical', 'Traditional medicine and health products', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 13, true, 0),

-- Musical Instruments
('00000000-0000-0000-0000-000000000014', 'Musical Instruments', 'musical-instruments', 'Traditional and modern African musical instruments', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 14, true, 0),

-- Bags & Luggage
('00000000-0000-0000-0000-000000000015', 'Bags & Luggage', 'bags-luggage', 'Handmade bags, backpacks, and luggage', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 15, true, 0),

-- Pet Supplies
('00000000-0000-0000-0000-000000000016', 'Pet Supplies', 'pet-supplies', 'Pet care products and accessories', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 16, true, 0)

ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Verify the setup
SELECT 
  'Categories table created' as status,
  COUNT(*) as category_count
FROM categories;

SELECT 
  'Products table has category_id column' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      AND column_name = 'category_id'
    ) THEN 'YES'
    ELSE 'NO'
  END as has_category_id;

