"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getActiveCategories, type Category } from "@/data/categories";
import { SessionStorage } from "@/utils/sessionStorage";

export default function FeaturedCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      // Check sessionStorage first
      const cacheKey = 'featured_categories';
      const cached = SessionStorage.getWithExpiry<Category[]>(cacheKey);
      if (cached) {
        setCategories(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`/api/categories?limit=6`, {
          credentials: "include",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const dbCategories = data.categories || [];
          
          if (dbCategories.length > 0) {
            setCategories(dbCategories);
            // Cache in sessionStorage (10 minutes - categories change rarely)
            SessionStorage.set(cacheKey, dbCategories, 10 * 60 * 1000);
          } else {
            // Fallback to hardcoded categories if database is empty
            const allCategories = getActiveCategories();
            const featuredCategories = allCategories.slice(0, 6);
            setCategories(featuredCategories);
            SessionStorage.set(cacheKey, featuredCategories, 10 * 60 * 1000);
          }
        } else {
          // Try stale cache as fallback
          const staleCache = SessionStorage.get<Category[]>(cacheKey);
          if (staleCache) {
            setCategories(staleCache);
          } else {
            // Fallback to hardcoded categories if API fails
            const allCategories = getActiveCategories();
            const featuredCategories = allCategories.slice(0, 6);
            setCategories(featuredCategories);
          }
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        // Try stale cache as fallback
        const staleCache = SessionStorage.get<Category[]>(cacheKey);
        if (staleCache) {
          setCategories(staleCache);
        } else {
          // Fallback to hardcoded categories on error
          const allCategories = getActiveCategories();
          const featuredCategories = allCategories.slice(0, 6);
          setCategories(featuredCategories);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              Shop by Category
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
              Discover products organized by category
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-20 sm:h-24 md:h-28 lg:h-32 mb-2 sm:mb-3"></div>
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
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Shop by Category
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            Discover products organized by category
          </p>
        </div>

        {categories.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No categories available</p>
            <p className="text-sm text-gray-500">
              Categories will appear here once they are added to the system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {(Array.isArray(categories) ? categories : []).map((category) => {
              if (!category) return null;
              return (
              <Link
                key={category.id}
                href={`/categories/${category.slug || category.id}`}
                className="block"
              >
                <div className="group cursor-pointer transition-transform duration-200 hover:scale-105">
                  <div className="relative mb-2 sm:mb-3 overflow-hidden rounded-lg bg-gradient-to-br from-gray-100 to-gray-200">
                    {category.image_url ? (
                      <>
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="w-full h-20 sm:h-24 md:h-28 lg:h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            // Fallback to gradient background if image fails
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </>
                    ) : (
                      <div className="w-full h-20 sm:h-24 md:h-28 lg:h-32 flex items-center justify-center">
                        <span className="text-3xl sm:text-4xl">
                          {category.name ? String(category.name).charAt(0).toUpperCase() : "?"}
                        </span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1 text-xs sm:text-sm line-clamp-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">
                    {category.product_count || 0} {category.product_count === 1 ? "product" : "products"}
                  </p>
                </div>
              </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8 sm:mt-12">
          <Link href="/categories">
            <button className="btn-outline text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
              View All Categories
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
