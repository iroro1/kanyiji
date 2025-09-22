// src/app/not-found.js (for Next.js App Router)
// or create it as a component for any React project

"use client"; // Add this if you're in a Next.js App Router environment

import React from "react";
import { Ghost, Home, ArrowLeft } from "lucide-react";
import Link from "next/link"; // Use your router's Link component

const NotFoundPage = () => {
  // A simple function to navigate back to the previous page
  const goBack = () => {
    window.history.back();
  };

  return (
    <div className="bg-slate-100 font-sans min-h-screen flex items-center justify-center p-4">
      {/* Optional: Adds a subtle, decorative background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-slate-100"></div>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-2xl shadow-slate-300/40 text-center max-w-md w-full">
        {/* Bouncing Ghost Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-100 rounded-full">
            <Ghost className="w-16 h-16 md:w-20 md:h-20 text-indigo-500 animate-bounce" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-2">
          Oops!
        </h1>
        <h2 className="text-xl md:text-2xl font-semibold text-slate-700 mb-4">
          Page Not Found
        </h2>

        {/* Helper Text */}
        <p className="text-slate-500 mb-8">
          It seems the page you're looking for has taken a little ghostly
          detour. Let's get you back on track!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {/* Go Back Button */}
          <button
            onClick={goBack}
            className="flex items-center justify-center px-5 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          >
            <ArrowLeft size={18} className="mr-2" />
            Go Back
          </button>

          {/* Go Home Button (Primary Action) */}
          <Link
            href="/"
            className="flex items-center justify-center px-5 py-3 text-sm font-medium text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          >
            <Home size={18} className="mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
