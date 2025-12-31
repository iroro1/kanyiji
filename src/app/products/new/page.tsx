"use client";

import Link from "next/link";
import { Star, ShoppingCart, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useFetchAllProducts } from "@/components/http/QueryHttp";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/components/ui/Toast";

// MAIN COMPONENT //
export default function NewProductsPage() {
  const { dispatch } = useCart();
  const { notify } = useToast();
  const {
    products: newProducts,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useFetchAllProducts(null, null, null, null, "updated_at-false", null);

  // Only show loading spinner on INITIAL load when no data exists
  // This prevents blocking when switching tabs - background refetches won't trigger spinner
  if (isLoading && !newProducts) {
    return <LoadingSpinner />;
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/products"
              className="text-primary-600 hover:text-primary-700"
            >
              Products
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">New</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">New Products</h1>
          <p className="mt-2 text-gray-600">
            Discover the latest additions to our African product collection
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-square rounded-t-xl overflow-hidden">
                <Image
                  width={1000}
                  height={500}
                  src={product.product_images?.[0]?.image_url || ""}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <div className="absolute top-3 left-3">
                  <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    new
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
                  <span className="text-sm text-gray-600">(17 reviews)</span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.name}
                </h3>

                <p className="text-sm text-gray-600 mb-3">{product.vendor}</p>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      ₦{product.price.toLocaleString()}
                    </span>
                    {product.original_price &&
                      typeof product.original_price === "number" &&
                      product.price &&
                      typeof product.price === "number" &&
                      product.original_price > product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          ₦{product.original_price.toLocaleString()}
                        </span>
                      )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={() => AddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                  <Link
                    href={`/products/${product.id}`}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 rounded-lg border border-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasNextPage || isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load More New Products
          </button>
        </div>
      </div>
    </div>
  );
}
