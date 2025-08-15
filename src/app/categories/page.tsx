import { Suspense } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Categories</h1>
          <p className="mt-2 text-gray-600">
            Explore our wide range of Made-in-Africa products by category
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Fashion & Textiles */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square bg-gradient-to-br from-pink-100 to-red-100 rounded-t-xl flex items-center justify-center">
              <div className="text-6xl">👗</div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Fashion & Textiles</h3>
              <p className="text-gray-600 text-sm mb-4">
                Traditional and modern African clothing, fabrics, and accessories
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">500+ Products</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Explore →
                </button>
              </div>
            </div>
          </div>

          {/* Jewelry & Accessories */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square bg-gradient-to-br from-yellow-100 to-amber-100 rounded-t-xl flex items-center justify-center">
              <div className="text-6xl">💍</div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Jewelry & Accessories</h3>
              <p className="text-gray-600 text-sm mb-4">
                Handcrafted beads, necklaces, bracelets, and traditional ornaments
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">300+ Products</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Explore →
                </button>
              </div>
            </div>
          </div>

          {/* Home & Decor */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-t-xl flex items-center justify-center">
              <div className="text-6xl">🏠</div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Home & Decor</h3>
              <p className="text-gray-600 text-sm mb-4">
                Beautiful home decorations, wall art, and traditional crafts
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">400+ Products</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Explore →
                </button>
              </div>
            </div>
          </div>

          {/* Beauty & Wellness */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square bg-gradient-to-br from-purple-100 to-indigo-100 rounded-t-xl flex items-center justify-center">
              <div className="text-6xl">✨</div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Beauty & Wellness</h3>
              <p className="text-gray-600 text-sm mb-4">
                Natural skincare, hair care, and wellness products from Africa
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">200+ Products</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Explore →
                </button>
              </div>
            </div>
          </div>

          {/* Food & Beverages */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square bg-gradient-to-br from-orange-100 to-red-100 rounded-t-xl flex items-center justify-center">
              <div className="text-6xl">🍯</div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Food & Beverages</h3>
              <p className="text-gray-600 text-sm mb-4">
                Authentic African spices, teas, honey, and traditional foods
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">150+ Products</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Explore →
                </button>
              </div>
            </div>
          </div>

          {/* Art & Collectibles */}
          <div className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-cyan-100 rounded-t-xl flex items-center justify-center">
              <div className="text-6xl">🎨</div>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Art & Collectibles</h3>
              <p className="text-gray-600 text-sm mb-4">
                Original artwork, sculptures, and unique collectible items
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">100+ Products</span>
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Explore →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
