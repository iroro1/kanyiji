// components/ui/EmptyState.tsx

import React from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;

  message: string;

  ctaText?: string;

  onCtaClick?: () => void;
}

/**
 * A component to display when a list or collection is empty, such as no products found.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  ctaText,
  onCtaClick,
}) => {
  return (
    <div className="flex min-h-[400px] w-full items-center text-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
      <div className="text-center justify-center align-middle">
        <div className="flex justify-center items-center">
          <SearchX size={70} className="opacity-45" />
        </div>
        <h3 className="mt-4 text-2xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-base text-gray-500">{message}</p>
        {ctaText && onCtaClick && (
          <div className="mt-6">
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {ctaText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
