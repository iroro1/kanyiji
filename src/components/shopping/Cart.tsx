"use client";

import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Image from "next/image";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { state, dispatch } = useCart();
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

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      dispatch({ type: "REMOVE_FROM_CART", id });
      return;
    }
    
    const item = state.items.find((item) => item.id === id);
    if (!item) return;

    const currentQuantity = item.quantity;
    if (newQuantity > currentQuantity) {
      dispatch({ type: "INCREASE_QUANTITY", id });
    } else if (newQuantity < currentQuantity) {
      dispatch({ type: "DECREASE_QUANTITY", id });
    }
  };

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_FROM_CART", id });
  };

  const subtotal = state.total;
  const shipping = 0; // Shipping calculated at checkout
  const total = subtotal + shipping;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500">
                  Start shopping to add items to your cart
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 border-b border-gray-100 pb-4"
                  >
                    {item.product_images && item.product_images[0] ? (
                      <Image
                        src={item.product_images[0].image_url}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {vendorNames[(item as any).vendor_id] || "Unknown Vendor"}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={!item.stock_quantity || item.quantity >= (item.stock_quantity || 0)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {state.items.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-400">
                    Calculated at checkout
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg mt-6 transition-colors duration-200">
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
