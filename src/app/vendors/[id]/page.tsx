"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Star, MapPin, Users, Building2, ArrowLeft, Phone, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Vendor {
  id: string;
  business_name: string;
  business_description: string;
  business_type: string;
  logo_url?: string | null;
  image_url: string | null;
  product_count: number;
  status: string;
  created_at: string;
  rating?: number;
  total_reviews?: number;
  // Additional fields that might exist
  owner_name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  images: string[];
  sku: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_on_sale: boolean;
  category_id: string | null;
}

export default function VendorDetailPage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch vendor by ID from API
        const response = await fetch(`/api/vendors/${vendorId}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Vendor not found");
          } else {
            const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
            setError(errorData.error || "Failed to fetch vendor");
          }
          setVendor(null);
          setProducts([]);
          return;
        }

        const data = await response.json();
        console.log("Vendor Detail Page: API Response:", {
          vendor: data.vendor,
          logo_url: data.vendor?.logo_url,
          logo_url_type: typeof data.vendor?.logo_url,
          logo_url_length: data.vendor?.logo_url?.length,
          image_url: data.vendor?.image_url,
          allVendorKeys: Object.keys(data.vendor || {}),
        });
        setVendor(data.vendor);
        setProducts(data.products || []);
      } catch (err: any) {
        console.error("Error fetching vendor:", err);
        setError("An error occurred while loading the vendor");
        setVendor(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchVendor();
    }
  }, [vendorId]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Loading spinner disabled - show content immediately
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-white flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Loading vendor details...</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Vendor not found"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error
              ? "An error occurred while loading the vendor details."
              : "The vendor you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Vendor Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Vendor Logo/Image */}
            <div className="flex-shrink-0">
              {(() => {
                const logoUrl = vendor.logo_url || vendor.image_url;
                console.log("Vendor Detail Page: Rendering logo:", {
                  hasLogoUrl: !!vendor.logo_url,
                  hasImageUrl: !!vendor.image_url,
                  logoUrl,
                  vendorId: vendor.id,
                  businessName: vendor.business_name,
                });
                
                return logoUrl ? (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
                    <img
                      src={logoUrl}
                      alt={vendor.business_name}
                      className="max-w-full max-h-full object-contain"
                      onLoad={() => {
                        console.log("Vendor logo loaded successfully:", logoUrl);
                      }}
                      onError={(e) => {
                        console.error("Vendor logo image failed to load:", {
                          logo_url: vendor.logo_url,
                          image_url: vendor.image_url,
                          attemptedUrl: logoUrl,
                          src: (e.target as HTMLImageElement).src,
                        });
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                              </svg>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                    <Building2 className="w-16 h-16 text-gray-400" />
                  </div>
                );
              })()}
            </div>

            {/* Vendor Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vendor.business_name}
              </h1>
              
              {vendor.business_type && (
                <span className="inline-block bg-primary-100 text-primary-700 text-sm px-3 py-1 rounded-full mb-4">
                  {vendor.business_type}
                </span>
              )}

              <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {vendor.rating && vendor.rating > 0 ? vendor.rating.toFixed(1) : "0.0"}
                  </span>
                  <span>
                    ({vendor.total_reviews || 0} {vendor.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span>{vendor.product_count} products</span>
                </div>
              </div>

              {vendor.business_description && (
                <p className="mt-4 text-gray-700 leading-relaxed">
                  {vendor.business_description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Vendor</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Business Information</h3>
              <p className="text-gray-600">
                {vendor.business_description || "No description available."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
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
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Products ({products.length})
          </h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group block"
                >
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Building2 className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Sale Badge */}
                      {product.is_on_sale && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Sale
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                        {product.original_price && product.original_price > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.original_price)}
                          </span>
                        )}
                      </div>

                      {/* Stock */}
                      {product.stock_quantity > 0 ? (
                        <p className="text-xs text-green-600">In Stock</p>
                      ) : (
                        <p className="text-xs text-red-600">Out of Stock</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">This vendor hasn't added any products yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

