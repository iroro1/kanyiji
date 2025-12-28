// Hardcoded categories list for Kanyiji marketplace
// This can be replaced with database fetch once categories are properly seeded
// Category IDs match the UUIDs in setup-categories-table.sql

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  product_count?: number;
}

export const CATEGORIES: Category[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Fashion & Textiles",
    slug: "fashion-textiles",
    description: "Traditional and modern African clothing, fabrics, and accessories",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Arts & Crafts",
    slug: "arts-crafts",
    description: "Handcrafted Nigerian art, pottery, and traditional crafts",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Food & Beverages",
    slug: "food-beverages",
    description: "Authentic African spices, teas, honey, and traditional foods",
    image_url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Home & Décor",
    slug: "home-decor",
    description: "Nigerian-inspired home decoration, furniture, and accessories",
    image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Beauty & Wellness",
    slug: "beauty-wellness",
    description: "Natural Nigerian beauty products, skincare, and hair care",
    image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "Jewelry & Accessories",
    slug: "jewelry-accessories",
    description: "Traditional Nigerian jewelry, beads, and accessories",
    image_url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "Art & Collectibles",
    slug: "art-collectibles",
    description: "Original artwork, sculptures, and unique collectible items",
    image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "Books & Media",
    slug: "books-media",
    description: "African literature, music, and educational materials",
    image_url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000010",
    name: "Toys & Games",
    slug: "toys-games",
    description: "Traditional and modern African games and toys",
    image_url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000012",
    name: "Kitchen & Dining",
    slug: "kitchen-dining",
    description: "Traditional cookware, dining sets, and kitchen accessories",
    image_url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000013",
    name: "Health & Medical",
    slug: "health-medical",
    description: "Traditional medicine and health products",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000014",
    name: "Musical Instruments",
    slug: "musical-instruments",
    description: "Traditional and modern African musical instruments",
    image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
  {
    id: "00000000-0000-0000-0000-000000000015",
    name: "Bags & Luggage",
    slug: "bags-luggage",
    description: "Handmade bags, backpacks, and luggage",
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    product_count: 0,
  },
];

// Helper function to get category by ID
export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(cat => cat.id === id);
}

// Helper function to get category by slug
export function getCategoryBySlug(slug: string): Category | undefined {
  return CATEGORIES.find(cat => cat.slug === slug);
}

// Helper function to get active categories (all for now)
export function getActiveCategories(): Category[] {
  return CATEGORIES;
}

// Helper function to get categories for admin dropdown (id and name only)
export function getCategoriesForSelect(): Array<{ id: string; name: string }> {
  return CATEGORIES.map(cat => ({ id: cat.id, name: cat.name }));
}
