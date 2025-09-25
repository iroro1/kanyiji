"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  // vendor: string;
  product_images: { id: string; image_url: string };
  rating: number;
  reviewCount: number;
}

export default function WishlistPage() {
  const { user } = useAuth();

  const userId = user ? user.id : "";
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0); // <-- trigger refetch

  console.log(loading);

  const { dispatch } = useCart();

  useEffect(() => {
    if (!user) return;
    async function getWishList() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("wishlist_items")
          .select(
            `
    id,
    created_at,
    products (
      id,
      name,
      price,
      original_price,
      rating,
      review_count,
      product_images (
        id,
        image_url
      )
    )
  `
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching wishlist:", error.message);
          setWishlistItems([]);
          return;
        }

        // Map the returned data to WishlistItem[]
        const mappedItems: WishlistItem[] = (data || []).map((item: any) => {
          const product = item.products;
          return {
            id: product?.id || item.id,
            name: product?.name || "",
            price: product?.price || 0,
            originalPrice: product?.original_price,
            image: product?.product_images?.[0]?.image_url || "",
            product_images: product?.product_images?.[0] || { id: "", image_url: "" },
            rating: product?.rating || 0,
            reviewCount: product?.review_count || 0,
          };
        });

        setWishlistItems(mappedItems);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        return [];
      }
    }

    getWishList();
  }, [userId, refresh]);

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

  if (loading) {
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
                {wishlistItems.length} item
                {wishlistItems.length !== 1 ? "s" : ""} saved for later
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Items */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />

                  {/* Remove Button */}
                  <button
                    onClick={() => deleteWishlistProduct(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Discount Badge */}
                  {item.originalPrice && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      {Math.round(
                        ((item.originalPrice - item.price) /
                          item.originalPrice) *
                          100
                      )}
                      % OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.name}
                  </h3>

                  <p className="text-sm text-gray-500 mb-3">
                    Vendor: {"Kanyiji"}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(item.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      ({item.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        dispatch({
                          type: "ADD_TO_CART",
                          product: {
                            ...item,
                            id: String(item.id),
                            price: Number(item.price),
                            title: "",
                            product_images: item.image
                              ? [{ id: item.id, image_url: item.image }]
                              : [],
                          },
                        })
                      }
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <Link
                      href={`/products/${item.id}`}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                      View
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
        {wishlistItems.length > 0 && (
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
