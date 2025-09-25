"use client";

import React, { SetStateAction } from "react";
import { AlertTriangle, Home } from "lucide-react";
import Link from "next/link";

/**
 * A beautiful, customizable error component for Next.js applications.
 *
 * @param {object} props - The component's props.
 * @param {number} [props.statusCode=500] - The HTTP status code of the error.
 * @param {string} [props.title="Oops! Something went wrong."] - The main title of the error message.
 * @param {string} [props.message="We're sorry, but an unexpected error occurred. Please try again later."] - A detailed, user-friendly message explaining the error.
 * @param {Function} [props.onRetry] - An optional function to call when the 'Try Again' button is clicked.
 * @param {boolean} [props.showHomeLink=true] - Whether to show the 'Go to Homepage' link.
 */
export const CustomError = ({
  statusCode = 500,
  title = "Oops! Something went wrong.",
  message = "We're sorry, but an unexpected error occurred on our server. Our team has been notified. Please try again later.",
  onRetry,
  retry,
  showHomeLink = true,
}: {
  statusCode?: number;
  title?: string;
  message?: string;
  onRetry?: (retry: boolean) => void;
  showHomeLink?: boolean;
  retry?: boolean;
}) => {
  // Determine color theme based on status code
  const isClientError = statusCode >= 400 && statusCode < 500;
  const themeColor = isClientError ? "blue" : "red";
  const themeClasses = {
    bg: `bg-${themeColor}-50`,
    text: `text-${themeColor}-600`,
    button: `bg-${themeColor}-600 hover:bg-${themeColor}-700`,
    buttonText: "text-white",
    ring: `focus:ring-${themeColor}-500`,
  };

  // Default messages for common status codes if title/message aren't provided
  if (title === "Oops! Something went wrong.") {
    if (statusCode === 404) {
      title = "Page Not Found";
      message =
        "Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.";
    } else if (statusCode === 403) {
      title = "Access Denied";
      message =
        "You don't have permission to view this page. Please check your credentials and try again.";
    } else if (statusCode === 503) {
      title = "Service Unavailable";
      message =
        "Our service is temporarily unavailable for maintenance. We'll be back online shortly.";
    }
  }

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-gray-100 font-sans`}
    >
      <main className="w-full max-w-lg p-8 mx-4 bg-white rounded-2xl shadow-xl transform transition-all hover:shadow-2xl">
        <div className="text-center">
          <div
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${themeClasses.bg} mb-6`}
          >
            <AlertTriangle className={`h-10 w-10 ${themeClasses.text}`} />
          </div>
          <p
            className={`text-5xl md:text-6xl font-extrabold ${themeClasses.text} tracking-tighter`}
          >
            {statusCode}
          </p>
          <h1 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {title}
          </h1>
          <p className="mt-4 text-base text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          {retry && (
            <button
              onClick={() => onRetry && onRetry(!retry)}
              className={`inline-flex items-center justify-center w-full sm:w-auto rounded-lg px-6 py-3 text-base font-semibold shadow-sm transition-transform transform hover:scale-105 bg-primary-500 hover:bg-primary-600`}
            >
              Try Again
            </button>
          )}

          {showHomeLink && (
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-lg px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-sm transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Homepage
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomError;
