"use client";

import { useState } from "react";
import { Search, ShoppingBag, Users, Globe } from "lucide-react";

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Background Image - Black African print */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-700">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto text-center text-white">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 font-display leading-tight">
          Discover Authentic
          <span className="block text-primary-300 mt-2">Made-in-Nigeria</span>
          Products
        </h1>

        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-2xl lg:max-w-3xl mx-auto text-gray-100 leading-relaxed px-4">
          Connect with Nigerian artisans, brands, and businesses. Shop unique
          products that tell the story of Nigeria's rich heritage.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, categories, or vendors..."
              className="w-full px-4 sm:px-6 py-3 sm:py-4 text-gray-900 rounded-full text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white p-2 sm:p-3 rounded-full transition-colors duration-200"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
        </form>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-2xl lg:max-w-4xl mx-auto mb-8 sm:mb-12 px-4">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">
              100+
            </h3>
            <p className="text-sm sm:text-base text-gray-200">
              Nigerian Vendors
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">
              1000+
            </h3>
            <p className="text-sm sm:text-base text-gray-200">
              Unique Products
            </p>
          </div>

          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">
              1
            </h3>
            <p className="text-sm sm:text-base text-gray-200">Country Served</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <button className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto">
            Start Shopping
          </button>
          <button className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-white text-white hover:bg-white hover:text-primary-600 w-full sm:w-auto">
            Become a Vendor
          </button>
        </div>
      </div>
    </section>
  );
}
