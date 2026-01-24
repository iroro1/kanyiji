"use client";

import { useState } from "react";
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useFetchWishlist } from "@/components/http/QueryHttp";

export default function WishlistPage() {
  const { user } = useAuth();
  const userId = user ? user.id : "";
  const [refresh, setRefresh] = useState(0); // <-- trigger refetch
  const { data, isError, isLoading, error } = useFetchWishlist(userId, refresh);

  const { dispatch } = useCart();

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  async function deleteWishlistProduct(id: string) {
    console.log(id);
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("product_id", id);

    if (error) {
      console.error("Error removing from wishlist:", error.message);
    } else {
      setRefresh((prev) => prev + 1);
    }
  }

  // Only show loading spinner on INITIAL load when no data exists
  // This prevents blocking when switching tabs - background refetches won't trigger spinner
  if (isLoading && !data) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600 fill-current" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-600">
                {data?.length} item
                {data?.length !== 1 ? "s" : ""} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {data && data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 group"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={
                      item.product_images?.[0]?.image_url || "/placeholder-product.png"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder-product.png";
                    }}
                  />

                  {/* Remove Button */}
                  <button
                    onClick={() => deleteWishlistProduct(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Discount Badge */}
                  {item.original_price && item.original_price > item.price && (
                    <div className="absolute top-3 left-3 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
                      {Math.round(
                        ((item.original_price - item.price) /
                          item.original_price) *
                          100
                      )}
                      % OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-base leading-tight">
                    {item.name}
                  </h3>

                  {/* Vendor */}
                  <p className="text-xs text-gray-500 mb-3">
                    {(() => {
                      const vendorName = item.vendors?.business_name 
                        || (item.vendors && typeof item.vendors === 'object' && item.vendors.business_name)
                        || "Unknown Vendor";
                      return vendorName;
                    })()}
                  </p>

                  {/* Rating & Reviews - Compact inline format */}
                  {(item.rating || item.review_count) ? (
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-900">
                          {item.rating ? item.rating.toFixed(1) : "0.0"}
                        </span>
                      </div>
                      {item.review_count > 0 && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">
                            {item.review_count} review{item.review_count !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mb-3 h-5" />
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.original_price && item.original_price > item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(item.original_price)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "ADD_TO_CART",
                          product: {
                            ...item,
                            id: String(item.id),
                            price: Number(item.price),
                            stock_quantity: item.stock_quantity || 0,
                            weight: item.weight || undefined, // Include weight if available
                            vendor_id: item.vendor_id,
                            title: "",
                            product_images: item.product_images?.[0]?.image_url
                              ? [
                                  {
                                    id: item.id,
                                    image_url: item.product_images?.[0]?.image_url,
                                  },
                                ]
                              : [],
                          },
                        })
                      }
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Add to Cart</span>
                    </button>

                    <Link
                      href={`/products/${item.id}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center min-w-[80px] shadow-sm hover:shadow-md"
                    >
                      <span className="text-sm">View</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Your wishlist is empty
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start exploring our products and save your favorites for later.
              You can add items to your wishlist while browsing.
            </p>
            <Link href="/products" className="btn-primary px-8 py-3 text-lg">
              Start Shopping
            </Link>
          </div>
        )}

        {/* Quick Actions */}
        {data && data?.length > 0 && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center space-x-4 bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
              <span className="text-gray-700">Quick actions:</span>
              <button className="text-primary-600 hover:text-primary-700 underline">
                Add all to cart
              </button>
              <span className="text-gray-300">|</span>
              <button className="text-red-600 hover:text-red-700 underline">
                Clear wishlist
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
