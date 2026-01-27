export default function VendorDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-64" />
        </div>
      </div>
      {/* Stats cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-4 bg-gray-100 rounded w-20 mb-2" />
              <div className="h-7 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
        {/* Tabs + content skeleton */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="flex gap-6 px-6 py-4 border-b border-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-100 rounded w-16" />
            ))}
          </div>
          <div className="p-6 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-32 mb-6" />
            <div className="h-40 bg-gray-50 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
