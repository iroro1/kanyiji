"use client";

import { Trash2, Minus, Plus, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function CartPage() {
  const { state, dispatch } = useCart();
  const { isAuthenticated } = useAuth();
  const [vendorNames, setVendorNames] = useState<Record<string, string>>({});

  // Fetch vendor names for cart items
  useEffect(() => {
    const fetchVendorNames = async () => {
      const vendorIds = Array.from(
        new Set(
          state.items
            .map((item) => (item as any).vendor_id)
            .filter(Boolean)
        )
      );

      if (vendorIds.length === 0) return;

      try {
        const vendorMap: Record<string, string> = {};
        
        // Fetch vendors in batches
        for (const vendorId of vendorIds) {
          try {
            const response = await fetch(`/api/vendors/${vendorId}`, {
              credentials: "include",
              cache: "no-store",
            });
            if (response.ok) {
              const vendorData = await response.json();
              vendorMap[vendorId] = vendorData.vendor?.business_name || "Unknown Vendor";
            }
          } catch (err) {
            console.error(`Error fetching vendor ${vendorId}:`, err);
          }
        }
        
        setVendorNames(vendorMap);
      } catch (err) {
        console.error("Error fetching vendor names:", err);
      }
    };

    fetchVendorNames();
  }, [state.items]);

  console.log(state.items);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-4xl">🛒</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            href="/products"
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {state.items.length} item{state.items.length !== 1 ? "s" : ""} in
            your cart
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Cart Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="font-semibold text-gray-900">Cart Items</h2>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-200">
                {state.items.map((item) => (
                  <div key={item.id} className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Product Image */}
                      <Image
                        width={500}
                        height={200}
                        src={
                          item?.product_images?.[0]?.image_url ||
                          "/placeholder-product.png"
                        }
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Vendor: {vendorNames[(item as any).vendor_id] || "Unknown Vendor"}
                        </p>
                        <div className="flex items-center gap-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                dispatch({
                                  type: "DECREASE_QUANTITY",
                                  id: item.id,
                                })
                              }
                              disabled={item.quantity <= 1}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-2 text-gray-900 font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                dispatch({
                                  type: "INCREASE_QUANTITY",
                                  id: item.id,
                                })
                              }
                              disabled={!item.stock_quantity || item.quantity >= (item.stock_quantity || 0)}
                              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {item.stock_quantity && (
                            <span className="text-xs text-gray-500">
                              {item.stock_quantity} available
                            </span>
                          )}

                          {/* Price */}
                          <span className="font-semibold text-gray-900">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() =>
                          dispatch({
                            type: "REMOVE_FROM_CART",
                            id: item.id,
                          })
                        }
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Link
                    href="/products"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Continue Shopping
                  </Link>
                  <button
                    onClick={() =>
                      dispatch({
                        type: "CLEAR_CART",
                      })
                    }
                    className="text-gray-600 hover:text-red-600 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              {/* Summary Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal ({state.items.length} items)
                  </span>
                  <span className="font-medium">
                    ₦{state.total.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-400">
                    Calculated at checkout
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ₦{state.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-gray-900 mb-2">
                  Shipping Information
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Shipping fees are calculated based on weight and destination at checkout.
                </p>
                <p className="text-xs text-gray-500">
                  Rates: ₦3,000-₦6,000/kg (Nigeria) • ₦14,500/kg (International)
                </p>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </Link>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure checkout powered by Paystack
                </p>
              </div>
            </div>

            {/* Save for Later / Wishlist */}
            {!isAuthenticated ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Save for Later
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Sign in to save items to your wishlist and access them later.
              </p>
                <Link
                  href="/auth/login"
                  className="w-full border border-primary-500 text-primary-600 font-semibold py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors block text-center"
                >
                Sign In
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary-500" />
                  Your Wishlist
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Save items you love for later purchase.
                </p>
                <Link
                  href="/wishlist"
                  className="w-full border border-primary-500 text-primary-600 font-semibold py-2 px-4 rounded-lg hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                >
                  View Wishlist
                  <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
