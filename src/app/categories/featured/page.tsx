import Link from "next/link";

export default function FeaturedCategoriesPage() {
  console.log('FeaturedCategoriesPage rendering...');
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/categories" className="text-primary-600 hover:text-primary-700">
              Categories
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900">Featured</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Featured Categories</h1>
          <p className="mt-2 text-gray-600">
            Discover our most popular and trending African product categories
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Categories Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            We're curating the best African product categories for you
          </p>
          <Link
            href="/categories"
            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Back to All Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
