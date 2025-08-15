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
    // Mock data with real images for UI development
    const mockCategories: Category[] = [
      {
        id: '1',
        name: 'Fashion & Textiles',
        description: 'Traditional and modern Nigerian fashion',
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        product_count: 150,
      },
      {
        id: '2',
        name: 'Arts & Crafts',
        description: 'Handcrafted Nigerian art and crafts',
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        product_count: 200,
      },
      {
        id: '3',
        name: 'Food & Beverages',
        description: 'Authentic Nigerian food products',
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        product_count: 100,
      },
      {
        id: '4',
        name: 'Home & Décor',
        description: 'Nigerian-inspired home decoration',
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        product_count: 120,
      },
      {
        id: '5',
        name: 'Beauty & Wellness',
        description: 'Natural Nigerian beauty products',
        image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        product_count: 80,
      },
      {
        id: '6',
        name: 'Jewelry & Accessories',
        description: 'Traditional Nigerian jewelry',
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
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
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Shop by Category</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">Discover products organized by category</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-20 sm:h-24 md:h-28 lg:h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm">
                {category.name}
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                {category.product_count} products
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <button className="btn-outline text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
}
