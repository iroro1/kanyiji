"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getCategoryBySlug, getActiveCategories, type Category } from "@/data/categories";
import { ArrowLeft, Package } from "lucide-react";
import { getProductImageUrl } from "@/utils/helpers";

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params.slug as string;
  // Normalize slug: remove trailing dashes and convert to lowercase
  const slug = rawSlug?.trim().toLowerCase().replace(/-+$/, '') || '';
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        // First, try to fetch category from database by slug
        // Try both normalized and original slug
        try {
          const categoryResponse = await fetch(`/api/categories?slug=${encodeURIComponent(slug)}`, {
            credentials: "include",
          });

          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            const dbCategory = categoryData.category;

            if (dbCategory) {
              // Use category from database
              setCategory({
                id: dbCategory.id,
                name: dbCategory.name,
                slug: dbCategory.slug,
                description: dbCategory.description,
                image_url: dbCategory.image_url,
                product_count: dbCategory.product_count,
              });

              // Fetch products for this category using category_id from database
              try {
                console.log("Fetching products for category:", {
                  categoryId: dbCategory.id,
                  categorySlug: dbCategory.slug,
                  categoryName: dbCategory.name,
                });

                const productsResponse = await fetch(`/api/products?category_id=${dbCategory.id}`, {
                  credentials: "include",
                });

                if (productsResponse.ok) {
                  const productsData = await productsResponse.json();
                  console.log("Products API response:", {
                    productCount: productsData.products?.length || 0,
                    products: productsData.products,
                  });
                  setProducts(Array.isArray(productsData.products) ? productsData.products : []);
                } else {
                  const errorData = await productsResponse.json().catch(() => ({}));
                  console.error("Failed to fetch products:", {
                    status: productsResponse.status,
                    error: errorData,
                  });
                  setProducts([]);
                }
              } catch (err) {
                console.error("Error fetching products:", err);
                setProducts([]);
              }
              
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("Error fetching category from database:", err);
        }

        // Fallback: Try hardcoded category list if database fetch fails
        const foundCategory = getCategoryBySlug(slug);
        
        if (!foundCategory) {
          setError("Category not found");
          setLoading(false);
          return;
        }

        setCategory(foundCategory);

        // Fetch products for this category using hardcoded category_id
        try {
          const response = await fetch(`/api/products?category_id=${foundCategory.id}`, {
            credentials: "include",
          });
          
          if (response.ok) {
            const data = await response.json();
            setProducts(Array.isArray(data.products) ? data.products : []);
          } else {
            setProducts([]);
          }
        } catch (err) {
          console.error("Error fetching products:", err);
          setProducts([]);
        }
      } catch (err: any) {
        console.error("Error loading category:", err);
        setError(err.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadCategoryData();
    }
  }, [slug]);

  // Loading spinner disabled - show content immediately
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <LoadingSpinner />
  //     </div>
  //   );
  // }

  if (!loading && (error || !category)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {error || "Category not found"}
            </h3>
            <p className="text-gray-600 mb-4">
              The category you're looking for doesn't exist.
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     {
      !loading && category && (
        <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Link>
          <div className="flex items-start gap-6">
            {category.image_url && (
              <div className="hidden md:block w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600 text-lg">{category.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                {products.length} {products.length === 1 ? "product" : "products"} available
              </p>
            </div>
          </div>
        </div>
      </div>

      )
     }
      {/* Loading spinner */}
      {loading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      )}

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
            <p className="text-gray-600 mb-4">
              There are no products in this category yet. Check back soon!
            </p>
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse Other Categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {(Array.isArray(products) ? products : [])
              .filter((p) => p != null)
              .map((product) => {
                const imageSrc = getProductImageUrl(product);
                return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
                  {imageSrc && imageSrc !== "/placeholder-image.jpg" ? (
                    <img
                      src={imageSrc}
                      alt={product.name || "Product"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder-image.jpg";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name || "Unnamed Product"}
                  </h3>
                  <p className="text-lg font-bold text-primary-600">
                    ₦{parseFloat(product.price || "0").toLocaleString()}
                  </p>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

