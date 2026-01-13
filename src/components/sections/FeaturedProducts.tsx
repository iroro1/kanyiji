"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { getCategoryById } from "@/data/categories";

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
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Fetch recent products directly from products table via API
        // This gets active products ordered by created_at (most recent first)
        const response = await fetch(`/api/products?limit=6&offset=0`, {
          credentials: "include",
          next: { revalidate: 60 }, // Revalidate every 60 seconds for better performance
        });

        if (response.ok) {
          const data = await response.json();
          const dbProducts = data.products || [];
          
          console.log("FeaturedProducts: Fetched from products table:", {
            totalCount: dbProducts.length,
            apiResponse: data,
            products: dbProducts.map((p: any) => ({
              id: p.id,
              name: p.name,
              status: p.status,
              hasImages: p.images && p.images.length > 0,
              price: p.price,
              vendor_id: p.vendor_id,
              category_id: p.category_id,
            })),
          });
          
          // Use all products returned (up to 6) - filter out any null/undefined products
          const productsToShow = dbProducts.filter((p: any) => p && p.id);
          
          console.log("FeaturedProducts: Processing products:", {
            totalFromAPI: dbProducts.length,
            afterFilter: productsToShow.length,
            productIds: productsToShow.map((p: any) => p.id),
          });
          
          if (productsToShow.length === 0) {
            console.warn("FeaturedProducts: No products found after filtering. API returned:", dbProducts);
            setProducts([]);
            setLoading(false);
            return;
          }
          
          // Fetch vendor names for products
          const vendorIds = Array.from(new Set(productsToShow.map((p: any) => p.vendor_id).filter(Boolean)));
          const vendorMap: Record<string, string> = {};
          
          if (vendorIds.length > 0) {
            try {
              // Try to fetch vendor names from vendors API or directly
              const vendorsResponse = await fetch(`/api/vendors?limit=100`, {
                credentials: "include",
              });
              
              if (vendorsResponse.ok) {
                const vendorsData = await vendorsResponse.json();
                vendorsData.vendors?.forEach((vendor: any) => {
                  vendorMap[vendor.id] = vendor.business_name;
                });
              }
            } catch (err) {
              console.error("Error fetching vendor names:", err);
            }
          }
          
          // Map database products to component interface - show products even without all fields
          const mappedProducts: Product[] = productsToShow.map((product: any) => {
            try {
              return {
                id: product.id,
                name: product.name || "Unnamed Product",
                description: product.description || product.short_description || "No description available",
                price: parseFloat(product.price || "0"),
                original_price: product.original_price ? parseFloat(product.original_price) : undefined,
                image_url: product.images && product.images.length > 0 && product.images[0]
                  ? product.images[0]
                  : "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
                vendor_name: vendorMap[product.vendor_id] || "Vendor",
                rating: product.rating ? parseFloat(product.rating) : 0, // Use actual rating from database
                review_count: product.review_count || 0, // Use actual review count from database
                category: product.category_id 
                  ? getCategoryById(product.category_id)?.name || "General"
                  : "General",
              };
            } catch (err) {
              console.error("Error mapping product:", product, err);
              return null;
            }
          }).filter((p: Product | null): p is Product => p !== null);
          
          console.log("FeaturedProducts: Mapped products:", {
            count: mappedProducts.length,
            products: mappedProducts.map(p => ({ id: p.id, name: p.name })),
          });
          
          setProducts(mappedProducts);
        } else {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
          console.error("Failed to fetch products:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          setProducts([]);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">
              Handpicked products from our vendors
            </p>
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
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Featured Products
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            Handpicked products from our vendors
          </p>
        </div>

        {products.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products available</p>
            <p className="text-sm text-gray-500">
              Products will appear here once they are added to the system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="block"
            >
              <div className="card group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Discount Badge */}
                  {product.original_price && typeof product.original_price === 'number' && 
                   product.price && typeof product.price === 'number' &&
                   product.original_price > product.price && (
                    <div className="absolute top-3 left-3 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
                      {Math.round(
                        ((product.original_price - product.price) /
                          product.original_price) *
                          100
                      )}
                      % OFF
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Add to wishlist:", product.id);
                      }}
                    >
                      <Heart className="w-4 h-4" />
                    </button>
                    <button
                      className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Add to cart:", product.id);
                      }}
                    >
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

                  {product.rating > 0 && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-warning fill-current" />
                        <span className="text-xs sm:text-sm text-gray-600 ml-1">
                          {product.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-500">
                        ({product.review_count} {product.review_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-gray-500">
                    {product.vendor_name}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.original_price && typeof product.original_price === 'number' && 
                       product.price && typeof product.price === 'number' &&
                       product.original_price > product.price && (
                        <span className="text-xs sm:text-sm text-gray-500 line-through">
                          {formatPrice(product.original_price)}
                        </span>
                      )}
                    </div>

                    <div className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 w-full sm:w-auto text-center">
                      Add to Cart
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
          <Link href="/products">
            <button className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
              View All Products
            </button>
          </Link>
          </div>
        )}
      </div>
    </section>
  );
}
