'use client';

import { useState } from 'react';
import { Search, ShoppingBag, Users, Globe } from 'lucide-react';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-700 text-white">
      <div className="absolute inset-0 bg-black/20" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display">
            Discover Authentic
            <span className="block text-primary-200">Made-in-Africa</span>
            Products
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-primary-100">
            Connect with African artisans, brands, and businesses. 
            Shop unique products that tell the story of Africa's rich heritage.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, categories, or vendors..."
                className="w-full px-6 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-primary-500 hover:bg-primary-600 text-white p-3 rounded-full transition-colors duration-200"
              >
                <Search className="w-6 h-6" />
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">100+</h3>
              <p className="text-primary-100">African Vendors</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">1000+</h3>
              <p className="text-primary-100">Unique Products</p>
            </div>
            
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-2">50+</h3>
              <p className="text-primary-100">Countries Served</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button className="btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-100">
              Start Shopping
            </button>
            <button className="btn-outline text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-600">
              Become a Vendor
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
