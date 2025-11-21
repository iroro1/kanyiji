"use client";

import { useState, useEffect } from "react";
import { Star, MapPin, Users, Award, Building2 } from "lucide-react";
import Link from "next/link";

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
    const fetchVendors = async () => {
      try {
        setLoading(true);
        
        // Fetch vendors from database (approved vendors only)
        // This queries the vendors table via /api/vendors endpoint
        const response = await fetch(`/api/vendors?limit=4`, {
          credentials: "include",
          cache: "no-store", // Ensure fresh data from vendors table
        });

        if (response.ok) {
          const data = await response.json();
          const dbVendors = data.vendors || [];
          
          console.log("FeaturedVendors: Fetched from vendors table:", {
            totalCount: dbVendors.length,
            apiResponse: data,
            vendors: dbVendors.map((v: any) => ({
              id: v.id,
              business_name: v.business_name,
              status: v.status,
              product_count: v.product_count,
            })),
          });
          
          // Map database vendor structure to component interface
          const mappedVendors: Vendor[] = dbVendors.map((vendor: any) => ({
            id: vendor.id,
            name: vendor.business_name || "Vendor", // Use business name as fallback
            business_name: vendor.business_name,
            description: vendor.business_description || "",
            image_url: vendor.image_url || null, // Don't use placeholder URL, will show icon instead
            location: "Nigeria", // TODO: Add location field to vendors table
            rating: 4.5, // TODO: Add rating field to vendors table or calculate from reviews
            review_count: 0, // TODO: Add review_count field or calculate from reviews table
            product_count: vendor.product_count || 0,
            specialty: vendor.business_type || "General",
          }));
          
          console.log("FeaturedVendors: Mapped vendors for display:", {
            count: mappedVendors.length,
            vendors: mappedVendors.map(v => ({ id: v.id, business_name: v.business_name })),
          });
          
          setVendors(mappedVendors);
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          console.error("Failed to fetch vendors from database:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          setVendors([]);
        }
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setVendors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
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

  if (vendors.length === 0) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Featured Vendors
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
              Meet the talented artisans behind our products
            </p>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600">No approved vendors available at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Vendors will appear here once they are approved.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Featured Vendors
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            Meet the talented artisans behind our products
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.id}`}
              className="block"
            >
              <div className="card group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer">
                <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg bg-gray-100">
                  {vendor.image_url ? (
                    <>
                      <img
                        src={vendor.image_url}
                        alt={vendor.business_name}
                        className="w-full h-32 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-32 sm:h-40 lg:h-48 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-gray-400" />
                    </div>
                  )}

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
                    <p className="text-xs sm:text-sm text-gray-500">
                      {vendor.name}
                    </p>
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

                  <div className="w-full btn-outline text-xs sm:text-sm py-2 text-center">
                    View Store
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link href="/vendors">
            <button className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
              View All Vendors
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
