"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  MapPin,
  Users,
  Clock,
  Package,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import WishlistButton from "@/components/ui/Wishlist";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import CustomError from "@/app/error";
import { useFetchSingleProduct } from "@/components/http/QueryHttp";
import { calculateProductStock } from "@/utils/stockCalculator";
import { useCart } from "@/contexts/CartContext";
import { calculateShippingFee, type ShippingLocation } from "@/utils/shippingCalculator";
import { useMemo } from "react";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const [retry, setRetry] = useState<boolean>(false);
  const { data, isPending, isLoading, isError, refetch } = useFetchSingleProduct(params?.id, retry);
  const { dispatch } = useCart();
  
  // Silent background refetch when page becomes visible - doesn't block UI
  useEffect(() => {
    if (!params?.id) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && data) {
        // Silent background refetch - only if we already have data (prevents blocking)
        // This updates stock without showing loading spinner
        refetch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [params?.id, refetch, data]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"specifications" | "reviews" | "vendor">("specifications");
  const [selectedVariant, setSelectedVariant] = useState<{ size?: string; color?: string; id?: string; quantity?: number } | null>(null);
  
  // Fetch vendor info when vendor tab is active
  const [vendor, setVendor] = useState<any>(null);
  const [vendorLoading, setVendorLoading] = useState(false);
  
  // Calculate stock from database product_attributes
  const productWithStock = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;
    const product = data[0];
    if (!product) return null;
    // Always recalculate stock from product_attributes to ensure it's from the database
    const calculatedStock = calculateProductStock(product);
    return {
      ...product,
      stock_quantity: calculatedStock,
      product_images: product.product_images || [],
      product_attributes: product.product_attributes || [],
    };
  }, [data]);

  // Get unique sizes and colors from product_attributes
  const availableSizes = useMemo(() => {
    if (!productWithStock?.product_attributes) return [];
    const sizes = new Set<string>();
    productWithStock.product_attributes.forEach((attr: any) => {
      if (attr.size) sizes.add(attr.size);
    });
    return Array.from(sizes).sort();
  }, [productWithStock]);

  const availableColors = useMemo(() => {
    if (!productWithStock?.product_attributes) return [];
    const colors = new Set<string>();
    productWithStock.product_attributes.forEach((attr: any) => {
      if (attr.color) colors.add(attr.color);
    });
    return Array.from(colors).sort();
  }, [productWithStock]);

  // Get available variants based on selected size/color
  const availableVariants = useMemo(() => {
    if (!productWithStock?.product_attributes) return [];
    return productWithStock.product_attributes.filter((attr: any) => {
      if (selectedVariant?.size && attr.size !== selectedVariant.size) return false;
      if (selectedVariant?.color && attr.color !== selectedVariant.color) return false;
      return true;
    });
  }, [productWithStock, selectedVariant]);

  // Get stock for selected variant
  const selectedVariantStock = useMemo(() => {
    if (!selectedVariant || !productWithStock?.product_attributes) {
      return productWithStock?.stock_quantity || 0;
    }
    const variant = productWithStock.product_attributes.find((attr: any) => {
      const sizeMatch = !selectedVariant.size || attr.size === selectedVariant.size;
      const colorMatch = !selectedVariant.color || attr.color === selectedVariant.color;
      return sizeMatch && colorMatch;
    });
    return variant?.quantity || 0;
  }, [selectedVariant, productWithStock]);

  // Reset selected variant when product changes
  useEffect(() => {
    if (productWithStock?.product_attributes && productWithStock.product_attributes.length > 0) {
      // Auto-select first available variant if none selected
      if (!selectedVariant) {
        const firstAvailableVariant = productWithStock.product_attributes.find(
          (attr: any) => attr.quantity && attr.quantity > 0
        ) || productWithStock.product_attributes[0];
        
        if (firstAvailableVariant) {
          setSelectedVariant({
            size: firstAvailableVariant.size,
            color: firstAvailableVariant.color,
            id: firstAvailableVariant.id,
            quantity: firstAvailableVariant.quantity,
          });
        }
      }
    } else {
      setSelectedVariant(null);
    }
  }, [productWithStock?.id]); // Only reset when product ID changes, not on every render
  
  // Reset quantity when product changes or stock is less than current quantity
  useEffect(() => {
    const maxStock = selectedVariantStock || 0;
    if (quantity > maxStock && maxStock > 0) {
      setQuantity(Math.max(1, maxStock));
    } else if (maxStock === 0 && quantity > 0) {
      setQuantity(0);
    }
  }, [selectedVariantStock, quantity]);
  
  useEffect(() => {
    if (activeTab === "vendor" && productWithStock?.vendor_id && !vendor) {
      const fetchVendor = async () => {
        setVendorLoading(true);
        try {
          const response = await fetch(`/api/vendors/${productWithStock.vendor_id}`, {
            credentials: "include",
            cache: "no-store",
          });
          if (response.ok) {
            const vendorData = await response.json();
            setVendor(vendorData.vendor);
          }
        } catch (err) {
          console.error("Error fetching vendor:", err);
        } finally {
          setVendorLoading(false);
        }
      };
      fetchVendor();
    }
  }, [activeTab, productWithStock, vendor]);

  // Calculate shipping options matching the policy page format
  const shippingOptions = useMemo(() => {
    if (!productWithStock) return [];
    
    const product = productWithStock;
    // Use product weight or default to 1kg (add 1kg for packaging)
    const productWeight = product.weight ? parseFloat(product.weight.toString()) : 1;
    const totalWeight = productWeight + 1; // Add 1kg for packaging
    
    // Calculate example prices for each shipping type
    // Standard Delivery - Lagos example (domestic)
    const standardLocation: ShippingLocation = { country: "Nigeria", state: "Lagos", city: "Lagos" };
    const standardResult = calculateShippingFee(totalWeight, standardLocation);
    
    // Express Delivery - Lagos example (same location, but faster service)
    const expressResult = standardResult; // Same calculation, different timeframe
    
    // International Delivery - UK example
    const internationalLocation: ShippingLocation = { country: "UK" };
    const internationalResult = calculateShippingFee(totalWeight, internationalLocation);
    
    return [
      {
        name: "Standard Delivery",
        deliveryDays: "3-7 business days",
        description: "Available for all Nigerian destinations",
        price: standardResult?.price || 0,
        icon: Truck,
        bgColor: "bg-green-50",
        iconColor: "text-green-600",
      },
      {
        name: "Express Delivery",
        deliveryDays: "2-4 business days",
        description: "Available for major cities",
        price: expressResult ? expressResult.price * 1.5 : 0, // Express is typically more expensive
        icon: Clock,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        name: "International Delivery",
        deliveryDays: "7-14 business days",
        description: "Available for UK, US, Canada, and other international destinations",
        price: internationalResult?.price || 0,
        icon: Package,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
    },
    ];
  }, [productWithStock]);

  // Only show loading spinner on INITIAL load (isLoading), not on background refetches (isPending)
  // This prevents blocking when switching tabs - data updates happen silently in background
  if (isLoading && !data) {
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
      {productWithStock && (
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          key={productWithStock.id}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div>
              <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-4">
                {productWithStock.product_images && productWithStock.product_images.length > 0 ? (
                <Image
                    src={productWithStock.product_images[selectedImage]?.image_url || productWithStock.product_images[0]?.image_url || '/placeholder-image.jpg'}
                    alt={productWithStock?.name || 'Product image'}
                  className="w-full h-full object-cover"
                  width={1000}
                  height={1000}
                />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    No image available
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="flex gap-3">
                {productWithStock.product_images && productWithStock.product_images.length > 0 && productWithStock.product_images.map(
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
                        alt={`${productWithStock.name} ${index + 1}`}
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
                <span className="text-gray-900">{productWithStock.name}</span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {productWithStock.name}
              </h1>

              {/* Vendor Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(productWithStock.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    {productWithStock.rating ? productWithStock.rating.toFixed(1) : "0.0"} ({(productWithStock.review_count || 0)} {productWithStock.review_count === 1 ? "review" : "reviews"})
                  </span>
                </div>
                {vendor?.location && (
                  <>
                <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-600">{vendor.location}</span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900">
                    ₦{productWithStock.price.toLocaleString()}
                  </span>
                  {productWithStock.original_price > productWithStock.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ₦{productWithStock.original_price.toLocaleString()}
                    </span>
                  )}
                  {productWithStock.original_price > productWithStock.price && (
                    <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded-full">
                      {Math.floor(productWithStock.discount_percent)}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {productWithStock.description}
              </p>

              {/* Size Selection */}
              {availableSizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size {selectedVariant?.size && <span className="text-gray-500 font-normal">({selectedVariant.size})</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableSizes.map((size) => {
                      const variantWithSize = productWithStock.product_attributes?.find(
                        (attr: any) => attr.size === size && (!selectedVariant?.color || attr.color === selectedVariant.color)
                      );
                      const isAvailable = variantWithSize && (variantWithSize.quantity || 0) > 0;
                      const isSelected = selectedVariant?.size === size;
                      
                      return (
                        <button
                          key={size}
                          onClick={() => {
                            const matchingVariant = productWithStock.product_attributes?.find(
                              (attr: any) => attr.size === size && (!selectedVariant?.color || attr.color === selectedVariant.color)
                            );
                            if (matchingVariant) {
                              setSelectedVariant({
                                size: size,
                                color: selectedVariant?.color || matchingVariant.color,
                                id: matchingVariant.id,
                                quantity: matchingVariant.quantity,
                              });
                            }
                          }}
                          disabled={!isAvailable}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            isSelected
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : isAvailable
                              ? "border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {size}
                          {variantWithSize && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({variantWithSize.quantity || 0})
                  </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color {selectedVariant?.color && <span className="text-gray-500 font-normal">({selectedVariant.color})</span>}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      const variantWithColor = productWithStock.product_attributes?.find(
                        (attr: any) => attr.color === color && (!selectedVariant?.size || attr.size === selectedVariant.size)
                      );
                      const isAvailable = variantWithColor && (variantWithColor.quantity || 0) > 0;
                      const isSelected = selectedVariant?.color === color;
                      
                      return (
                        <button
                          key={color}
                          onClick={() => {
                            const matchingVariant = productWithStock.product_attributes?.find(
                              (attr: any) => attr.color === color && (!selectedVariant?.size || attr.size === selectedVariant.size)
                            );
                            if (matchingVariant) {
                              setSelectedVariant({
                                size: selectedVariant?.size || matchingVariant.size,
                                color: color,
                                id: matchingVariant.id,
                                quantity: matchingVariant.quantity,
                              });
                            }
                          }}
                          disabled={!isAvailable}
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            isSelected
                              ? "border-primary-500 bg-primary-50 text-primary-700"
                              : isAvailable
                              ? "border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {color}
                          {variantWithColor && (
                            <span className="ml-1 text-xs text-gray-500">
                              ({variantWithColor.quantity || 0})
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Variant Info */}
              {selectedVariant && (selectedVariant.size || selectedVariant.color) && (
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Selected:</span>{" "}
                    {selectedVariant.size && `Size ${selectedVariant.size}`}
                    {selectedVariant.size && selectedVariant.color && " • "}
                    {selectedVariant.color && `Color ${selectedVariant.color}`}
                    {selectedVariant.quantity !== undefined && (
                      <span className="ml-2 text-blue-600">
                        ({selectedVariant.quantity} available)
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg w-32">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(selectedVariantStock || 1, quantity + 1))}
                    disabled={!selectedVariantStock || quantity >= (selectedVariantStock || 0)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      selectedVariantStock ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedVariantStock
                      ? `${selectedVariantStock} in stock${selectedVariant ? ` for selected variant` : ""}`
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
                        ...productWithStock,
                        id: String(productWithStock.id),
                        price: Number(productWithStock.price),
                        stock_quantity: selectedVariantStock || 0,
                        vendor_id: productWithStock.vendor_id,
                        product_images: productWithStock.product_images || [],
                        selectedVariant: selectedVariant ? {
                          size: selectedVariant.size,
                          color: selectedVariant.color,
                          variantId: selectedVariant.id,
                        } : undefined,
                      },
                    })
                  }
                  disabled={!selectedVariantStock || quantity > (selectedVariantStock || 0)}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                  {selectedVariant && (selectedVariant.size || selectedVariant.color) && (
                    <span className="text-xs opacity-90">
                      ({selectedVariant.size || ""} {selectedVariant.size && selectedVariant.color ? "•" : ""} {selectedVariant.color || ""})
                    </span>
                  )}
                </button>

                <WishlistButton
                  userId={user ? user.id : ""}
                  productId={productWithStock?.id}
                />
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Shipping Options
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  We offer multiple delivery options based on your location and preference:
                </p>
                {shippingOptions.length > 0 ? (
                  <div className="space-y-3">
                    {shippingOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                    <div
                          key={option.name}
                          className={`flex items-start gap-3 p-4 ${option.bgColor} rounded-lg`}
                        >
                          <IconComponent className={`w-5 h-5 ${option.iconColor} mt-0.5 flex-shrink-0`} />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {option.name}
                            </h4>
                            <p className="text-sm text-gray-700 mb-2">{option.deliveryDays}</p>
                            <p className="text-xs text-gray-600 mb-2">
                              {option.description}
                            </p>
                            {option.price > 0 && (
                              <p className="text-sm font-semibold text-gray-900 mt-2">
                                From ₦{option.price.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                      </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Shipping rates will be calculated at checkout based on your destination.
                    </div>
                )}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Note:</strong> Shipping costs vary based on destination, package weight, and selected shipping method.
                  </p>
                  <p className="text-sm text-gray-700">
                    Exact rates are displayed at checkout before payment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-16">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab("specifications")}
                  className={`border-b-2 py-4 px-1 font-medium transition-colors ${
                    activeTab === "specifications"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`border-b-2 py-4 px-1 font-medium transition-colors ${
                    activeTab === "reviews"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Reviews
                </button>
                <button
                  onClick={() => setActiveTab("vendor")}
                  className={`border-b-2 py-4 px-1 font-medium transition-colors ${
                    activeTab === "vendor"
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Vendor Info
                </button>
              </nav>
            </div>

            <div className="py-8">
              {/* Specifications Tab */}
              {activeTab === "specifications" && (
                <div className="bg-white rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-700">SKU</span>
                      <span className="text-gray-600">{productWithStock.sku || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="font-medium text-gray-700">Category</span>
                      <span className="text-gray-600">{productWithStock.category || "General"}</span>
                    </div>
                    {productWithStock.stock_quantity && (
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Stock Quantity</span>
                        <span className="text-gray-600">{productWithStock.stock_quantity}</span>
                      </div>
                    )}
                    {productWithStock.weight && (
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Weight</span>
                        <span className="text-gray-600">{productWithStock.weight}</span>
                      </div>
                    )}
                    {productWithStock.material && (
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="font-medium text-gray-700">Material</span>
                        <span className="text-gray-600">{productWithStock.material}</span>
                      </div>
                    )}
                  </div>
                  
                  {productWithStock.description && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{productWithStock.description}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="bg-white rounded-lg p-6">
                  <div className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Reviews Yet
                    </h3>
                    <p className="text-gray-600">
                      Be the first to review this product!
                    </p>
                  </div>
                </div>
              )}

              {/* Vendor Info Tab */}
              {activeTab === "vendor" && (
                <div className="bg-white rounded-lg p-6">
                  {vendorLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading vendor information...</p>
                    </div>
                  ) : vendor ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                        {vendor.image_url ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={vendor.image_url}
                              alt={vendor.business_name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {vendor.business_name}
                          </h3>
                          {vendor.business_type && (
                            <span className="inline-block bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full mt-1">
                              {vendor.business_type}
                            </span>
                          )}
                        </div>
                      </div>

                      {vendor.business_description && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">About</h4>
                          <p className="text-gray-600">{vendor.business_description}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        {vendor.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">{vendor.email}</span>
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">{vendor.phone}</span>
                          </div>
                        )}
                        {vendor.location && (
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">{vendor.location}</span>
                          </div>
                        )}
                        {vendor.product_count > 0 && (
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700">{vendor.product_count} products</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <Link
                          href={`/vendors/${vendor.id}`}
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                        >
                          View Vendor Store
                          <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Vendor Information Not Available
                      </h3>
                      <p className="text-gray-600">
                        Unable to load vendor details at this time.
                      </p>
                    </div>
                  )}
                </div>
              )}
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
      )}
    </div>
  );
}
