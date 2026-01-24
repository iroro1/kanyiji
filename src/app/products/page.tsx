"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, Grid, List, Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useFetchAllProducts } from "@/components/http/QueryHttp";
import CustomError from "../error";
import { useDebounce } from "@/components/http/useDebounce";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { getProductImageUrl } from "@/utils/helpers";

export default function ProductsPage() {
  const { dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { notify } = useToast();

  const searchParams = useSearchParams();
  const searchQueryParam = searchParams.get("search") || "";
  const filterParam = searchParams.get("filter") || null;
  const sortParam = searchParams.get("sort") || null;

  const debounce = useDebounce(searchQueryParam || searchQuery, 500);

  // Determine filter and sort values
  const filterValue = selectedFilter || filterParam;
  const sortValue = sortBy || sortParam;

  // Map filter to API parameters
  let feature: string | null = null;
  let sale: string | null = null;
  let sort: string | null = null;

  // Apply filter dropdown selections
  if (filterValue === "featured") {
    feature = "true";
  } else if (filterValue === "trending") {
    // Only set trending sort if no explicit sort is selected
    if (!sortValue) {
      sort = "trending";
    }
  } else if (filterValue === "new") {
    // Only set new sort if no explicit sort is selected
    if (!sortValue) {
      sort = "updated_at-false";
    }
  }

  // Apply sort dropdown selections (takes precedence over filter sorts)
  if (sortValue === "price-low") {
    sort = "price-true";
  } else if (sortValue === "price-high") {
    sort = "price-false";
  } else if (sortValue === "newest") {
    sort = "updated_at-false";
  }
  
  console.log("Products Page - Filter/Sort mapping:", {
    filterValue,
    sortValue,
    feature,
    sale,
    sort,
  });

  const hasInitialLoadRef = useRef<boolean>(false); // Track if initial load has completed
  
  const {
    products,
    isError,
    isLoading,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useFetchAllProducts(debounce, null, sale, feature, sort, null);

  // Mark initial load as complete when products are loaded
  useEffect(() => {
    if (products && products.length > 0 && !hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
    }
  }, [products]);

  console.log(products);

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
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <select
                  value={selectedFilter || ""}
                  onChange={(e) => setSelectedFilter(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                >
                  <option value="">All Products</option>
                  <option value="featured">Featured</option>
                  <option value="trending">Trending</option>
                  <option value="new">New</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={sortBy || ""}
                  onChange={(e) => setSortBy(e.target.value || null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
                >
                  <option value="">Sort By</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-2 border-r border-gray-300 hover:bg-gray-50 transition-colors ${
                    viewMode === "grid" ? "bg-primary-50 text-primary-600" : ""
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-2 hover:bg-gray-50 transition-colors ${
                    viewMode === "list" ? "bg-primary-50 text-primary-600" : ""
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ERROR HANDLING HERE */}
      {isError && (
        <CustomError
          statusCode={500}
          title="Something went wrong"
          message="Please try again later"
          retry={false}
        />
      )}
      {/* CRITICAL: Only show loading spinner on TRUE initial load when no data exists */}
      {/* This prevents blocking when switching tabs - background refetches won't trigger spinner */}
      {/* Allow loader during initial fetch even if isFetching is true */}
      {isLoading &&
       !products?.length &&
       !hasInitialLoadRef.current && (
         <LoadingSpinner timeout={5000} />
       )}

      {!isLoading && products?.length === 0 && (
        <EmptyState
          title="No products found"
          message="Please clear filters or check back later"
        />
      )}

      {/* Products Grid/List */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-6"
        }>
          {/* Product Cards */}
          {(Array.isArray(products) ? products : [])
            .filter((p) => p != null)
            .map((product) => {
              const imageSrc = getProductImageUrl(product);
              return (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 block cursor-pointer overflow-hidden group ${
                viewMode === "list" ? "flex flex-row h-[150px]" : "hover:-translate-y-1"
              }`}
            >
              <div className={`relative ${viewMode === "list" ? "w-[200px] flex-shrink-0" : ""}`}>
                <div className={`relative ${viewMode === "list" ? "h-full" : "h-48"}`}>
                  <Image
                    src={imageSrc}
                    alt={product?.name ?? "Product"}
                    width={600}
                    height={500}
                    className={`w-full ${viewMode === "list" ? "h-full" : "h-48"} object-cover transition-transform duration-300 group-hover:scale-105 ${
                      viewMode === "list" ? "rounded-l-xl" : "rounded-t-xl"
                    }`}
                  />
                  {/* Gradient overlay for better badge visibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {product.original_price && typeof product.original_price === 'number' && 
                 product.price && typeof product.price === 'number' &&
                 product.original_price > product.price ? (
                  <div className="absolute top-4 left-4 bg-white text-gray-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
                    {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                  </div>
                ) : null}

                {product.is_featured ? (
                  <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md z-10">
                    Featured
                  </div>
                ) : null}
              </div>
              
              <div className={`${viewMode === "list" ? "flex-1 flex flex-row items-center justify-between p-3" : "p-4"}`}>
                <div className={`${viewMode === "list" ? "flex-1 mr-4" : ""}`}>
                  <div className={`${viewMode === "list" ? "flex items-start justify-between mb-2" : ""}`}>
                    <h3 className={`font-semibold text-gray-900 group-hover:text-primary-600 transition-colors ${
                      viewMode === "list" ? "text-base mb-1" : "mb-2"
                    }`}>
                      {product.name}
                    </h3>
                    
                    {viewMode === "list" && (
                      <div className="flex items-baseline gap-2 ml-4">
                        <span className="font-bold text-gray-900 text-lg">
                          ₦{Number(product?.price ?? 0).toLocaleString()}
                        </span>
                        {product.original_price && typeof product.original_price === 'number' && 
                         product.price && typeof product.price === 'number' &&
                         product.original_price > product.price && (
                          <span className="text-xs line-through text-gray-400">
                            ₦{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {product.description && viewMode !== "list" && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className={`flex items-center ${viewMode === "list" ? "mb-0" : "mb-3"}`}>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`${viewMode === "list" ? "w-3 h-3" : "w-4 h-4"} ${
                            i < Math.floor(product.rating || 0)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-gray-500 ml-2 ${viewMode === "list" ? "text-xs" : "text-sm"}`}>
                      {(product?.review_count ?? 0) > 0 
                        ? `${product.review_count} review${product.review_count !== 1 ? "s" : ""}`
                        : "0 reviews"}
                    </span>
                  </div>
                  
                  {viewMode !== "list" && (
                    <div className="flex items-center justify-between pb-5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-gray-900">
                          ₦{Number(product?.price ?? 0).toLocaleString()}
                        </span>

                        {product.original_price && typeof product.original_price === 'number' && 
                         product.price && typeof product.price === 'number' &&
                         product.original_price > product.price && (
                          <span className="text-sm line-through text-gray-400">
                            ₦{product.original_price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {viewMode === "list" && (
                    <button
                      className="flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-xs font-medium mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        AddToCart(product);
                      }}
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>

                {viewMode !== "list" && (
                  <button
                    className="flex items-center justify-center w-full gap-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      AddToCart(product);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-sm">Add to Cart</span>
                  </button>
                )}
              </div>
            </Link>
            );
          })}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <button
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 rounded-lg border border-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!hasNextPage || isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
}
