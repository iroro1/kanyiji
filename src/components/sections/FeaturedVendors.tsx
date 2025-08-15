"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Users, Award } from "lucide-react";

interface Vendor {
  id: string;
  name: string;
  business_name: string;
  description: string;
  image_url: string;
  location: string;
  rating: number;
  review_count: number;
  product_count: number;
  specialty: string;
}

export default function FeaturedVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data with real images of black people for UI development
    const mockVendors: Vendor[] = [
      {
        id: "1",
        name: "Aisha Oke",
        business_name: "Ghana Weaves",
        description:
          "Traditional handwoven fabrics and modern fashion pieces from Ghana",
        image_url:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        location: "Lagos, Nigeria",
        rating: 4.9,
        review_count: 234,
        product_count: 45,
        specialty: "Handwoven Textiles",
      },
      {
        id: "2",
        name: "Kemi Adebayo",
        business_name: "Nigeria Crafts",
        description: "Handcrafted jewelry and accessories from Nigerian artisans",
        image_url:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        location: "Abuja, Nigeria",
        rating: 4.8,
        review_count: 189,
        product_count: 32,
        specialty: "Jewelry & Accessories",
      },
      {
        id: "3",
        name: "Bisi Ogunleye",
        business_name: "Nigeria Pottery",
        description: "Traditional Nigerian pottery and home decoration items",
        image_url:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        location: "Ibadan, Nigeria",
        rating: 4.7,
        review_count: 156,
        product_count: 28,
        specialty: "Home & Décor",
      },
      {
        id: "4",
        name: "Chukwudi Okonkwo",
        business_name: "Nigeria Arts",
        description: "Traditional Nigerian art and cultural artifacts",
        image_url:
          "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        location: "Lagos, Nigeria",
        rating: 4.6,
        review_count: 98,
        product_count: 23,
        specialty: "Arts & Crafts",
      },
    ];

    setVendors(mockVendors);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Featured Vendors</h2>
            <p className="section-subtitle">
              Meet the talented artisans behind our products
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 mb-4"></div>
                <div className="bg-gray-200 rounded h-4 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 mb-2"></div>
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
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Featured Vendors</h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            Meet the talented artisans behind our products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg">
                <img
                  src={vendor.image_url}
                  alt={vendor.business_name}
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Rating Badge */}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                  <Star className="w-3 h-3 text-warning fill-current" />
                  <span className="text-xs font-semibold text-gray-900">
                    {vendor.rating}
                  </span>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 text-sm sm:text-base">
                    {vendor.business_name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">{vendor.name}</p>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {vendor.description}
                </p>

                <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{vendor.location}</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {vendor.product_count} products
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-warning fill-current" />
                    <span className="text-gray-600">
                      ({vendor.review_count})
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="inline-block bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
                    {vendor.specialty}
                  </span>
                </div>

                <button className="w-full btn-outline text-xs sm:text-sm py-2">
                  View Store
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <button className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">View All Vendors</button>
        </div>
      </div>
    </section>
  );
}
