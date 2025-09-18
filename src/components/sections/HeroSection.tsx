"use client";

import { Users, ShoppingBag, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden py-16 sm:py-20 lg:py-24">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
          alt="African marketplace background"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/70 to-primary-700/80" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Discover Authentic
          <span className="block text-primary-200 mt-2">Made-in-Africa</span>
          Products
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
          Connect with African artisans, brands, and businesses. Shop unique
          products that tell the story of Africa's rich heritage.
        </p>

        {/* Stats Section - Redesigned Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto mb-10">
          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="bg-primary-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">100+</h3>
              <p className="text-primary-100 font-medium">African Vendors</p>
            </div>
          </div>

          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="bg-primary-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">1000+</h3>
              <p className="text-primary-100 font-medium">Unique Products</p>
            </div>
          </div>

          <div className="group">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="bg-primary-400 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">1</h3>
              <p className="text-primary-100 font-medium">Country Served</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center">
          <Link
            href={"/products"}
            className="group bg-primary-500 hover:bg-primary-600 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
