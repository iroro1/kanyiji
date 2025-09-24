"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";

interface WishlistButtonProps {
  userId: string; // the logged in user
  productId: string;
}

export default function WishlistButton({
  userId,
  productId,
}: WishlistButtonProps) {
  useEffect(() => {
    const checkWishlist = async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .single();

      if (!error && data) {
        setIsWishlisted(true);
      }
    };

    checkWishlist();
  }, [userId, productId]);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleToggleWishlist() {
    if (loading) return;
    setLoading(true);

    try {
      if (isWishlisted) {
        // ❌ Remove from wishlist
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", userId)
          .eq("product_id", productId);

        if (error) {
          console.error("Error removing from wishlist:", error.message);
        } else {
          setIsWishlisted(false);
        }
      } else {
        // ❤️ Add to wishlist
        const { error } = await supabase
          .from("wishlist_items")
          .insert([{ user_id: userId, product_id: productId }]);

        if (error) {
          console.error("Error adding to wishlist:", error.message);
        } else {
          setIsWishlisted(true);
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  console.log("from wishlist");

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
        }`}
      />
    </button>
  );
}
