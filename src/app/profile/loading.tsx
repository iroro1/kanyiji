export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page title */}
        <div className="h-9 bg-gray-200 rounded w-32 mb-8" />
        {/* Tab bar skeleton */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-100 rounded w-20" />
          ))}
        </div>
        {/* Card skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-4 bg-gray-100 rounded w-56" />
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-gray-50 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
