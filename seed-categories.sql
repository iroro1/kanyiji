-- =============================================
-- 🌿 SEED CATEGORIES FOR KANYIJI
-- =============================================
-- This script populates the categories table with 
-- popular Made-in-Africa product categories

-- Insert main categories
INSERT INTO categories (name, slug, description, image_url, sort_order, is_active, product_count) VALUES
-- Fashion & Textiles
('Fashion & Textiles', 'fashion-textiles', 'Traditional and modern African clothing, fabrics, and accessories', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 1, true, 0),

-- Arts & Crafts
('Arts & Crafts', 'arts-crafts', 'Handcrafted Nigerian art, pottery, and traditional crafts', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 2, true, 0),

-- Food & Beverages
('Food & Beverages', 'food-beverages', 'Authentic African spices, teas, honey, and traditional foods', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 3, true, 0),

-- Home & Décor
('Home & Décor', 'home-decor', 'Nigerian-inspired home decoration, furniture, and accessories', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 4, true, 0),

-- Beauty & Wellness
('Beauty & Wellness', 'beauty-wellness', 'Natural Nigerian beauty products, skincare, and hair care', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 5, true, 0),

-- Jewelry & Accessories
('Jewelry & Accessories', 'jewelry-accessories', 'Traditional Nigerian jewelry, beads, and accessories', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 6, true, 0),

-- Art & Collectibles
('Art & Collectibles', 'art-collectibles', 'Original artwork, sculptures, and unique collectible items', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 7, true, 0),

-- Books & Media
('Books & Media', 'books-media', 'African literature, music, and educational materials', 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 9, true, 0),

-- Toys & Games
('Toys & Games', 'toys-games', 'Traditional and modern African games and toys', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 10, true, 0),

-- Kitchen & Dining
('Kitchen & Dining', 'kitchen-dining', 'Traditional cookware, dining sets, and kitchen accessories', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 12, true, 0),

-- Health & Medical
('Health & Medical', 'health-medical', 'Traditional medicine and health products', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 13, true, 0),

-- Musical Instruments
('Musical Instruments', 'musical-instruments', 'Traditional and modern African musical instruments', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 14, true, 0),

-- Bags & Luggage
('Bags & Luggage', 'bags-luggage', 'Handmade bags, backpacks, and luggage', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 15, true, 0)

ON CONFLICT (slug) DO NOTHING;

-- Update product_count based on actual products (this is a placeholder - in production, this would be calculated)
-- You can run this after products are added:
-- UPDATE categories SET product_count = (
--   SELECT COUNT(*) FROM products WHERE category_id = categories.id AND status = 'active'
-- );

