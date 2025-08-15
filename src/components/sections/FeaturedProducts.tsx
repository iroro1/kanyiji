'use client';

import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  vendor_name: string;
  rating: number;
  review_count: number;
  category: string;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data with real images for UI development
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Handwoven Aso Oke Cloth',
        description: 'Traditional Nigerian handwoven fabric with vibrant patterns',
        price: 45000,
        original_price: 60000,
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        vendor_name: 'Nigeria Weaves',
        rating: 4.8,
        review_count: 127,
        category: 'Fashion & Textiles',
      },
      {
        id: '2',
        name: 'Nigerian Beaded Necklace',
        description: 'Handcrafted beaded necklace from Nigerian artisans',
        price: 15000,
        image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        vendor_name: 'Nigeria Crafts',
        rating: 4.6,
        review_count: 89,
        category: 'Jewelry & Accessories',
      },
      {
        id: '3',
        name: 'Organic Nigerian Shea Butter',
        description: 'Pure shea butter from Nigeria, perfect for skin care',
        price: 8000,
        image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        vendor_name: 'Nigeria Naturals',
        rating: 4.9,
        review_count: 234,
        category: 'Beauty & Wellness',
      },
      {
        id: '4',
        name: 'Wooden Carved Mask',
        description: 'Traditional Nigerian wooden mask from Benin Kingdom',
        price: 25000,
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        vendor_name: 'Nigeria Arts',
        rating: 4.7,
        review_count: 156,
        category: 'Arts & Crafts',
      },
      {
        id: '5',
        name: 'Nigerian Print Dress',
        description: 'Beautiful Ankara print dress, perfect for any occasion',
        price: 35000,
        original_price: 45000,
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        vendor_name: 'Fashion Nigeria',
        rating: 4.5,
        review_count: 78,
        category: 'Fashion & Textiles',
      },
      {
        id: '6',
        name: 'Handmade Nigerian Pottery',
        description: 'Traditional Nigerian pottery bowl from Ilorin',
        price: 12000,
        image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
        vendor_name: 'Nigeria Pottery',
        rating: 4.8,
        review_count: 92,
        category: 'Home & Décor',
      },
    ];

    setProducts(mockProducts);
    setLoading(false);
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked products from our vendors</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                <div className="bg-gray-200 rounded h-4 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 mb-2"></div>
                <div className="bg-gray-200 rounded h-4 w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Featured Products</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">Handpicked products from our vendors</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.id} className="card group hover:shadow-lg transition-shadow duration-200">
              <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Discount Badge */}
                {product.original_price && (
                  <div className="absolute top-2 left-2 bg-error text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm">
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 text-sm sm:text-base">
                  {product.name}
                </h3>
                
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-warning fill-current" />
                    <span className="text-xs sm:text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-xs sm:text-sm text-gray-500">({product.review_count})</span>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-500">{product.vendor_name}</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                  
                  <button className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 w-full sm:w-auto">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <button className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
