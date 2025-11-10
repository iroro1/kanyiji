"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import WishlistButton from "@/components/ui/Wishlist";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomError from "@/app/error";
import { useFetchSingleProduct } from "@/components/http/QueryHttp";
import { useCart } from "@/contexts/CartContext";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const [retry, setRetry] = useState<boolean>(false);
  const { data, isPending, isError } = useFetchSingleProduct(params?.id, retry);
  const { dispatch } = useCart();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Mock product data - in real app this would come from API
  const shipping = {
    shipping: {
      "Local Delivery": "₦500 (2-3 days)",
      "National Shipping": "₦800 (3-5 days)",
      Express: "₦1,200 (1-2 days)",
    },
  };

  if (isPending) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <CustomError
        statusCode={500}
        title="Something went wrong"
        message="Please try again. Thank you"
        onRetry={setRetry}
        retry={retry}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/products"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
      {data?.map((product) => (
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          key={product.id}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-4">
                <Image
                  src={product.product_images[selectedImage]?.image_url}
                  alt={product?.name}
                  className="w-full h-full object-cover"
                  width={1000}
                  height={1000}
                />
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-3">
                {product.product_images.map(
                  (image: { image_url: string }, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? "border-primary-500"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image?.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        width={200}
                        height={200}
                      />
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              {/* Breadcrumb */}
              <div className="text-sm text-gray-500 mb-4">
                <Link href="/" className="hover:text-primary-600">
                  Home
                </Link>
                <span className="mx-2">/</span>
                <Link href="/categories" className="hover:text-primary-600">
                  Categories
                </Link>
                <span className="mx-2">/</span>
                <Link href="/products" className="hover:text-primary-600">
                  Products
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">{product.name}</span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Vendor Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(5)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {5} ({18} reviews)
                  </span>
                </div>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{"Lagos Island"}</span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.original_price > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ₦{product.original_price.toLocaleString()}
                    </span>
                  )}
                  {product.original_price > product.price && (
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded-full">
                      {Math.floor(product.discount_percent)}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Tags */}
              {/* <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div> */}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      product.stock_quantity ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {product.stock_quantity
                      ? `${product.stock_quantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
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
                  disabled={!product.stock_quantity}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>

                <WishlistButton
                  userId={user ? user.id : ""}
                  productId={product?.id}
                />
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Shipping Options
                </h3>
                <div className="space-y-2">
                  {Object.entries(shipping).map(([option, price]) => (
                    <div
                      key={option}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{option}</span>
                      </div>
                      <span className="text-gray-900">{"2000"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button className="border-b-2 border-primary-500 text-primary-600 py-4 px-1 font-medium">
                  Specifications
                </button>
                <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 font-medium">
                  Reviews
                </button>
                <button className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 py-4 px-1 font-medium">
                  Vendor Info
                </button>
              </nav>
            </div>

            <div className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* {Object.entries(product.specifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-3 border-b border-gray-100"
                  >
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-600">{"General"}</span>
                  </div>
                ))} */}
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 bg-white rounded-2xl p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Shield className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-600">
                  Your payment information is protected
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Truck className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Fast Delivery
                </h3>
                <p className="text-sm text-gray-600">
                  Quick and reliable shipping
                </p>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">
                  Quality Guaranteed
                </h3>
                <p className="text-sm text-gray-600">
                  Authentic products, verified vendors
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
      ,
    </div>
  );
}
