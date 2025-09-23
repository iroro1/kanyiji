import { CheckCircle } from "lucide-react";
import Link from "next/link";

export const SuccessModal = ({ isOpen, onClose }: any) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={onClose} // Close modal on backdrop click
    >
      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-lg p-6 sm:p-10 text-center w-full max-w-lg mx-4 transition-transform transform scale-95 duration-300"
        // Prevent modal from closing when clicking inside it
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isOpen ? "scale(1)" : "scale(0.95)" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle />
        </div>

        {/* Content */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Product Added Successfully!
        </h1>
        <p className="text-gray-600 mb-8 text-base sm:text-lg">
          Your new product has been added to the catalog and is now live. What
          would you like to do next?
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/" // In a real app, this would navigate to the dashboard
            onClick={onClose}
            className="w-full sm:w-auto bg-indigo-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            Go to Dashboard
          </Link>
          {/* This button now closes the modal */}
          <Link
            href={"/vendor/dashboard/add-product"}
            onClick={onClose}
            className="w-full sm:w-auto bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all duration-300 transform hover:-translate-y-1"
          >
            Add Another Product
          </Link>
        </div>
      </div>
    </div>
  );
};
