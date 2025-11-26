# 🌿 Categories Setup Guide

This guide explains how to populate your database with categories for the Kanyiji marketplace.

## 📋 Overview

The Kanyiji marketplace uses a `categories` table to organize products. Categories are displayed:
- On the homepage in the "Featured Categories" section
- On the `/categories` page showing all available categories
- In the admin panel when creating/editing products

## 🚀 Quick Setup

### Step 1: Seed Categories

1. **Open your Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to the **SQL Editor**

2. **Run the Seeding Script**
   - Copy the contents of `seed-categories.sql`
   - Paste it into the SQL Editor
   - Click **Run** or press `Ctrl/Cmd + Enter`

This will create **13 categories** including:
- Fashion & Textiles
- Arts & Crafts
- Food & Beverages
- Home & Décor
- Beauty & Wellness
- Jewelry & Accessories
- And 7 more categories

### Step 2: Verify Categories

After running the script, you can verify categories were created:

```sql
SELECT id, name, slug, is_active, product_count 
FROM categories 
ORDER BY sort_order, name;
```

## 📊 Categories Included

The seeding script includes 13 diverse categories:

1. **Fashion & Textiles** - Traditional and modern African clothing
2. **Arts & Crafts** - Handcrafted Nigerian art and pottery
3. **Food & Beverages** - Authentic African spices and foods
4. **Home & Décor** - Nigerian-inspired home decoration
5. **Beauty & Wellness** - Natural Nigerian beauty products
6. **Jewelry & Accessories** - Traditional Nigerian jewelry
7. **Art & Collectibles** - Original artwork and sculptures
8. **Books & Media** - African literature and music
9. **Toys & Games** - Traditional and modern games
10. **Kitchen & Dining** - Traditional cookware
11. **Health & Medical** - Traditional medicine
12. **Musical Instruments** - African musical instruments
13. **Bags & Luggage** - Handmade bags and luggage

## 🔄 Updating Product Counts

The `product_count` field is initially set to 0. You can update it with actual counts:

```sql
UPDATE categories 
SET product_count = (
  SELECT COUNT(*) 
  FROM products 
  WHERE category_id = categories.id 
  AND status = 'active'
);
```

## 🎨 Customizing Categories

### Adding New Categories

You can add more categories using:

```sql
INSERT INTO categories (name, slug, description, image_url, sort_order, is_active) 
VALUES (
  'Category Name',
  'category-slug',
  'Category description',
  'https://image-url.com/image.jpg',
  20,
  true
);
```

### Updating Existing Categories

```sql
UPDATE categories 
SET 
  name = 'New Name',
  description = 'New description',
  image_url = 'https://new-image-url.com/image.jpg',
  sort_order = 5
WHERE slug = 'category-slug';
```

### Deactivating Categories

To hide a category from the app (without deleting it):

```sql
UPDATE categories 
SET is_active = false 
WHERE slug = 'category-slug';
```

## 🌐 API Endpoints

### Public Categories API

**GET** `/api/categories`
- Returns all active categories
- Query parameters:
  - `limit` - Limit number of results (e.g., `?limit=6`)

Example:
```bash
curl https://your-domain.com/api/categories
curl https://your-domain.com/api/categories?limit=6
```

### Admin Categories API

**GET** `/api/admin/categories`
- Returns all categories (including inactive) for admin panel
- Requires admin authentication

## 🔍 Display in App

### Homepage
- Featured Categories section shows 6 categories
- Fetches from `/api/categories?limit=6`
- Updated automatically when categories are added

### Categories Page
- Shows all active categories
- Fetches from `/api/categories`
- Responsive grid layout

### Admin Panel
- Category dropdown in product create/edit form
- Shows all active categories
- Automatically loads when modal opens

## 📝 Notes

- **Slug Uniqueness**: The `slug` field must be unique. The seeding script uses `ON CONFLICT (slug) DO NOTHING` to prevent duplicates.
- **Sort Order**: Categories are sorted by `sort_order` (ascending), then by `name` (ascending).
- **Images**: Categories can have images. If no image is provided, a fallback with the first letter is shown.
- **Product Count**: This can be updated automatically when products are created/updated using database triggers (optional).

## 🛠️ Troubleshooting

### Categories not appearing?
1. Check that `is_active = true` in the database
2. Verify the API route is working: visit `/api/categories` in your browser
3. Check browser console for errors

### Images not loading?
- Verify image URLs are accessible
- Check CORS settings if images are from external sources
- The app will show a fallback letter if images fail to load

### Product counts are wrong?
- Run the product count update query (see above)
- Or set up a database trigger to update counts automatically

