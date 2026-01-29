"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import Link from "next/link";
import { getCategoryById } from "@/data/categories";
import { SessionStorage } from "@/utils/sessionStorage";
import { getProductImageUrl } from "@/utils/helpers";

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

export default function NewProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const cacheKey = "new_products";
      const cached = SessionStorage.getWithExpiry<Product[]>(cacheKey);
      if (cached) {
        setProducts(cached);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(
          `/api/products?limit=6&offset=0&sort=newest`,
          { credentials: "include", signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          const dbProducts = data.products || [];
          const productsToShow = dbProducts.filter((p: any) => p && p.id);

          if (productsToShow.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
          }

          const vendorIds = Array.from(
            new Set(productsToShow.map((p: any) => p.vendor_id).filter(Boolean))
          );
          const vendorMap: Record<string, string> = {};
          if (vendorIds.length > 0) {
            try {
              const vendorsResponse = await fetch(`/api/vendors?limit=100`, {
                credentials: "include",
              });
              if (vendorsResponse.ok) {
                const vendorsData = await vendorsResponse.json();
                vendorsData.vendors?.forEach((vendor: any) => {
                  vendorMap[vendor.id] = vendor.business_name;
                });
              }
            } catch {
              // ignore
            }
          }

          const mappedProducts: Product[] = productsToShow
            .map((product: any) => {
              try {
                return {
                  id: product.id,
                  name: product.name || "Unnamed Product",
                  description:
                    product.description ||
                    product.short_description ||
                    "No description available",
                  price: parseFloat(product.price || "0"),
                  original_price: product.original_price
                    ? parseFloat(product.original_price)
                    : undefined,
                  image_url: getProductImageUrl(product),
                  vendor_name: vendorMap[product.vendor_id] || "Vendor",
                  rating: product.rating ? parseFloat(product.rating) : 0,
                  review_count: product.review_count || 0,
                  category: product.category_id
                    ? getCategoryById(product.category_id)?.name || "General"
                    : "General",
                };
              } catch {
                return null;
              }
            })
            .filter((p: Product | null): p is Product => p !== null);

          setProducts(mappedProducts);
          SessionStorage.set(cacheKey, mappedProducts, 5 * 60 * 1000);
        } else {
          const staleCache = SessionStorage.get<Product[]>(cacheKey);
          setProducts(staleCache || []);
        }
      } catch {
        const staleCache = SessionStorage.get<Product[]>("new_products");
        setProducts(staleCache || []);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
              New Products
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
              Latest additions from our vendors
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
            New Products
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            Latest additions from our vendors
          </p>
        </div>

        {products.length === 0 && !loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No new products yet</p>
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
                    {product.original_price &&
                      typeof product.original_price === "number" &&
                      product.price < product.original_price && (
                        <div className="absolute top-3 left-3 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
                          {Math.round(
                            ((product.original_price - product.price) /
                              product.original_price) *
                              100
                          )}
                          % OFF
                        </div>
                      )}
                    <div className="absolute top-2 right-2 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>
                    {product.rating > 0 && (
                      <div className="flex items-center space-x-2">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-warning fill-current" />
                        <span className="text-xs sm:text-sm text-gray-600">
                          {product.rating.toFixed(1)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500">
                          ({product.review_count} reviews)
                        </span>
                      </div>
                    )}
                    <p className="text-xs sm:text-sm text-gray-500">
                      {product.vendor_name}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2">
                      <span className="text-base sm:text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <span className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2 w-full sm:w-auto text-center">
                        Add to Cart
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="text-center mt-8 sm:mt-12">
            <Link href="/products/new">
              <button className="btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3">
                View All New Products
              </button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
