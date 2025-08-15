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
    // Mock data for UI development
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Handwoven Kente Cloth',
        description: 'Traditional Ghanaian handwoven fabric with vibrant patterns',
        price: 45000,
        original_price: 60000,
        image_url: '/images/products/kente.jpg',
        vendor_name: 'Ghana Weaves',
        rating: 4.8,
        review_count: 127,
        category: 'Fashion & Textiles',
      },
      {
        id: '2',
        name: 'African Beaded Necklace',
        description: 'Handcrafted beaded necklace from Kenya',
        price: 15000,
        image_url: '/images/products/necklace.jpg',
        vendor_name: 'Kenya Crafts',
        rating: 4.6,
        review_count: 89,
        category: 'Jewelry & Accessories',
      },
      {
        id: '3',
        name: 'Organic Shea Butter',
        description: 'Pure shea butter from Ghana, perfect for skin care',
        price: 8000,
        image_url: '/images/products/shea-butter.jpg',
        vendor_name: 'Ghana Naturals',
        rating: 4.9,
        review_count: 234,
        category: 'Beauty & Wellness',
      },
      {
        id: '4',
        name: 'Wooden Carved Mask',
        description: 'Traditional African wooden mask from Nigeria',
        price: 25000,
        image_url: '/images/products/mask.jpg',
        vendor_name: 'Nigeria Arts',
        rating: 4.7,
        review_count: 156,
        category: 'Arts & Crafts',
      },
      {
        id: '5',
        name: 'African Print Dress',
        description: 'Beautiful Ankara print dress, perfect for any occasion',
        price: 35000,
        original_price: 45000,
        image_url: '/images/products/dress.jpg',
        vendor_name: 'Fashion Africa',
        rating: 4.5,
        review_count: 78,
        category: 'Fashion & Textiles',
      },
      {
        id: '6',
        name: 'Handmade Pottery Bowl',
        description: 'Traditional pottery bowl from Morocco',
        price: 12000,
        image_url: '/images/products/pottery.jpg',
        vendor_name: 'Morocco Crafts',
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Handpicked products from our vendors</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="card group hover:shadow-lg transition-shadow duration-200">
              <div className="relative mb-4">
                <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-6xl text-primary-600 font-bold">
                    {product.name.charAt(0)}
                  </span>
                </div>
                
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
              
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                  {product.name}
                </h3>
                
                <p className="text-sm text-gray-600 line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-warning fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">({product.review_count})</span>
                </div>
                
                <p className="text-sm text-gray-500">{product.vendor_name}</p>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {product.original_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.original_price)}
                      </span>
                    )}
                  </div>
                  
                  <button className="btn-primary text-sm px-4 py-2">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <button className="btn-primary">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
