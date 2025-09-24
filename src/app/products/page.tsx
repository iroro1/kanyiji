"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import WishlistButton from "@/components/ui/Wishlist";

export default function ProductsPage() {
  const { dispatch, state } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>();

  console.log(products);

  // 2. Fetch vendor products once vendorDetails is loaded
  useEffect(() => {
    async function getVendorProducts() {
      setLoadingProducts(true);
      const { data, error } = await supabase
        .from("products")
        .select(`*, product_images( id, image_url )`);

      if (error) {
        console.error("Product fetch error:", error);
      } else {
        setProducts(data);
        setLoadingProducts(false);
        console.log("Vendor products:", data);
      }
    }

    getVendorProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="mt-2 text-gray-600">
            Discover authentic Made-in-Africa products from our trusted vendors
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <div className="flex items-center border border-gray-300 rounded-lg">
                <button className="p-2 border-r border-gray-300 hover:bg-gray-50">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-gray-50">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}

      {loadingProducts ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Product Card 1 */}
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative">
                  <img
                    src={product.product_images?.[0]?.image_url}
                    alt={product?.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <WishlistButton
                    productId={product?.id}
                    userId={user ? user.id : ""}
                  />

                  {product.featured ? (
                    <div className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Featured
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{product.title}</p>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < product.avgRatings
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 ml-2">
                      17 reviews
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₦{product.price}
                    </span>
                    <button
                      className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors"
                      onClick={() =>
                        dispatch({
                          type: "ADD_TO_CART",
                          product: {
                            ...product,
                            id: String(product.id),
                            price: Number(product.price),
                          },
                        })
                      }
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-8 py-3 rounded-lg border border-gray-300 transition-colors">
              Load More Products
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
