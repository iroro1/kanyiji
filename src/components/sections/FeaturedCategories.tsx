'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_count: number;
}

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for UI development
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Fashion & Textiles',
        description: 'Traditional and modern African fashion',
        image_url: '/images/categories/fashion.jpg',
        product_count: 150,
      },
      {
        id: '2',
        name: 'Arts & Crafts',
        description: 'Handcrafted African art and crafts',
        image_url: '/images/categories/arts.jpg',
        product_count: 200,
      },
      {
        id: '3',
        name: 'Food & Beverages',
        description: 'Authentic African food products',
        image_url: '/images/categories/food.jpg',
        product_count: 100,
      },
      {
        id: '4',
        name: 'Home & Décor',
        description: 'African-inspired home decoration',
        image_url: '/images/categories/home.jpg',
        product_count: 120,
      },
      {
        id: '5',
        name: 'Beauty & Wellness',
        description: 'Natural African beauty products',
        image_url: '/images/categories/beauty.jpg',
        product_count: 80,
      },
      {
        id: '6',
        name: 'Jewelry & Accessories',
        description: 'Traditional African jewelry',
        image_url: '/images/categories/jewelry.jpg',
        product_count: 90,
      },
    ];

    setCategories(mockCategories);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Discover products organized by category</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-32 mb-3"></div>
                <div className="bg-gray-200 rounded h-4 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Discover products organized by category</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="relative mb-3">
                <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-4xl text-primary-600 font-bold">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1 text-sm">
                {category.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {category.product_count} products
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="btn-outline">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
}
