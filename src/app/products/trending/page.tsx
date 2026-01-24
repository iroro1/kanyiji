"use client";

import Link from "next/link";
import { Star, ShoppingCart, Heart, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useFetchAllProducts } from "@/components/http/QueryHttp";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getProductImageUrl } from "@/utils/helpers";

export default function TrendingProductsPage() {
  const {
    products: trendingProducts,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useFetchAllProducts(null, null, null, null, "trending", null);

  const { dispatch } = useCart();
  const { notify } = useToast();
  const safeProducts = Array.isArray(trendingProducts) ? trendingProducts : [];

  function AddToCart(product: any) {
    dispatch({
      type: "ADD_TO_CART",
      product: {
        ...product,
        id: String(product.id),
        price: Number(product.price),
        stock_quantity: product.stock_quantity || 0,
        weight: product.weight || undefined, // Include weight if available
        vendor_id: product.vendor_id,
      },
    });
    notify("Product added to cart successfully", "success");
  }

  // Only show loading spinner on INITIAL load when no data exists
  // This prevents blocking when switching tabs - background refetches won't trigger spinner
  if (isLoading && !trendingProducts) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/products" className="text-primary-600 hover:text-primary-700">
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Trending</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Trending Products</h1>
          <p className="mt-2 text-gray-600">
            See what's hot and trending in African products right now
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {safeProducts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Trending Products
            </h3>
            <p className="text-gray-600 mb-6">
              There are no trending products at the moment.
            </p>
            <Link
              href="/products"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {safeProducts
                .filter((p) => p != null)
                .map((product) => {
                  const priceValue = Number(product.price ?? 0);
                  const formattedPrice = Number.isFinite(priceValue)
                    ? priceValue.toLocaleString()
                    : "0";
                  return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <div className="relative aspect-square rounded-t-xl overflow-hidden">
                    <Image
                      width={1000}
                      height={700}
                      src={getProductImageUrl(product)}
                      alt={product.name ?? "Product"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3">
                      <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Trending
                      </span>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(4)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">(18 reviews)</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3">{product.vendor}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₦{formattedPrice}
                        </span>
                        {product.original_price && typeof product.original_price === 'number' && 
                         product.price && typeof product.price === 'number' &&
                         product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ₦{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          AddToCart(product);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-12">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg border border-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasNextPage || isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage
                  ? "Loading..."
                  : "Load More Trending Products"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
