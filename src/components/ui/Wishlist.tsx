"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Heart } from "lucide-react";
import { useToast } from "./Toast";

interface WishlistButtonProps {
  userId: string; // the logged in user
  productId: string;
}

export default function WishlistButton({
  userId,
  productId,
}: WishlistButtonProps) {
  const { notify } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log(userId, productId);

  useEffect(() => {
    if (!userId) return;

    const checkWishlist = async () => {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select("id")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();

      if (!error && data) {
        setIsWishlisted(true);
      }

      console.log(data);
    };

    checkWishlist();
  }, [userId, productId]);

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
          notify("Product removed from wishlist", "success");
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
          notify("Product added to wishlist", "success");
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggleWishlist}
      disabled={loading}
      className=" p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
    >
      <Heart
        className={`w-4 h-4 transition-colors text-3xl ${
          isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
        }`}
      />
    </button>
  );
}
