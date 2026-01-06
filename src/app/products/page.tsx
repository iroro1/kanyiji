"use client";

import { useState } from "react";
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

export default function ProductsPage() {
  const { dispatch } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string | null>(null);
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

  if (filterValue === "featured") {
    feature = "true";
  } else if (filterValue === "trending") {
    sort = "trending";
  } else if (filterValue === "new") {
    sort = "updated_at-false";
  }

  if (sortValue === "price-low") {
    sort = "price-true";
  } else if (sortValue === "price-high") {
    sort = "price-false";
  } else if (sortValue === "newest") {
    sort = "updated_at-false";
  }

  const {
    products,
    isError,
    isLoading,
    isFetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useFetchAllProducts(debounce, null, sale, feature, sort, null);

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

      {/* ERROR HANDLING HERE */}
      {isError && (
        <CustomError
          statusCode={500}
          title="Something went wrong"
          message="Please try again later"
          retry={false}
        />
      )}
      {/* Only show loading spinner on INITIAL load when no data exists */}
      {/* This prevents blocking when switching tabs - background refetches won't trigger spinner */}
      {isLoading && !products && <LoadingSpinner />}

      {!isLoading && products?.length === 0 && (
        <EmptyState
          title="No products found"
          message="Please clear filters or check back later"
        />
      )}

      {/* Products Grid */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Product Card 1 */}
          {products?.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block cursor-pointer"
            >
              <div className="relative">
                <Image
                  src={product.product_images?.[0]?.image_url || ""}
                  alt={product?.name}
                  width={600}
                  height={500}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                {/* <WishlistButton
                    productId={product?.id}
                    userId={user ? user.id : ""}
                  /> */}

                {product.original_price && typeof product.original_price === 'number' && 
                 product.price && typeof product.price === 'number' &&
                 product.original_price > product.price ? (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-2xl">
                    {`-${Math.round(((product.original_price - product.price) / product.original_price) * 100)}%`}
                  </div>
                ) : null}

                {product.is_featured ? (
                  <div className="absolute top-3 right-3 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
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
                          i < Math.floor(product.rating || 0)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {product.review_count > 0 
                      ? `${product.review_count} review${product.review_count !== 1 ? "s" : ""}`
                      : "0 reviews"}
                  </span>
                </div>
                <div className="flex flex-wrap pb-5 items-center  justify-between">
                  <div>
                    <span className="text-lg pr-2 font-bold text-gray-900">
                      ₦{product.price.toLocaleString()}
                    </span>

                    {product.original_price && typeof product.original_price === 'number' && 
                     product.price && typeof product.price === 'number' &&
                     product.original_price > product.price && (
                      <span className="text-sm line-through text-gray-500">
                        ₦{product.original_price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  className="flex align-center justify-center  w-full m-auto items-center text-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    AddToCart(product);
                  }}
                >
                  <ShoppingCart className="w-4 h-4 text-center" />
                  <span className="text-sm text-center">Add to Cart</span>
                </button>
              </div>
            </Link>
          ))}
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
