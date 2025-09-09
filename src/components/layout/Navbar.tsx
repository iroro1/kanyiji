"use client";

import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Heart,
  Globe,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import AuthModal from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

// Logo Component
const Logo = () => (
  <Link href="/" className="flex items-center space-x-3 group">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
        <Globe className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="hidden sm:block">
      <h1 className="text-2xl font-bold text-primary-600 group-hover:text-primary-700 transition-all duration-300">
        Kanyiji
      </h1>
    </div>
  </Link>
);

// Navigation Links Component
const NavigationLinks = ({
  navigation,
  isMobile = false,
  onLinkClick,
}: {
  navigation: Array<{ name: string; href: string; hasDropdown?: boolean }>;
  isMobile?: boolean;
  onLinkClick?: () => void;
}) => (
  <div
    className={`${
      isMobile ? "space-y-2" : "hidden md:flex items-center space-x-8"
    }`}
  >
    {navigation.map((item) => (
      <div key={item.name} className="relative group">
        <Link
          href={item.href}
          className={`${
            isMobile
              ? "block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-all duration-200"
              : "text-gray-700 hover:text-primary-600 font-medium text-sm transition-all duration-200 relative group/link flex items-center space-x-1"
          }`}
          onClick={onLinkClick}
        >
          {item.name}
          {item.hasDropdown && !isMobile && (
            <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover/link:rotate-180" />
          )}
          {!isMobile && (
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all duration-300 group-hover:w-full"></span>
          )}
        </Link>

        {/* Dropdown Menu */}
        {item.hasDropdown && !isMobile && (
          <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform -translate-y-2 group-hover:translate-y-0 z-50">
            <div className="py-2">
              <Link
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
              >
                All {item.name}
              </Link>
              <Link
                href={`${item.href}/featured`}
                className="block px-4 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              >
                Featured {item.name}
              </Link>
              <Link
                href={`${item.href}/trending`}
                className="block px-4 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              >
                Trending {item.name}
              </Link>
              <Link
                href={`${item.href}/new`}
                className="block px-4 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 transition-colors duration-200"
              >
                New {item.name}
              </Link>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
);

// Search Component
const SearchBar = ({
  isMobile = false,
  onSearch,
}: {
  isMobile?: boolean;
  onSearch?: (query: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative ${isMobile ? "block" : "block"}`}
    >
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search for products, vendors..."
        className={`${
          isMobile
            ? "w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            : "w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        } ${isFocused ? "ring-2 ring-primary-500 border-transparent" : ""}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <Search
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400`}
      />
    </form>
  );
};

// Action Icons Component
const ActionIcons = ({
  showMobileSearch = false,
  onMobileSearchClick,
  onWishlistClick,
  onCartClick,
}: {
  showMobileSearch?: boolean;
  onMobileSearchClick?: () => void;
  onWishlistClick?: () => void;
  onCartClick?: () => void;
}) => (
  <div className="flex items-center space-x-3 lg:space-x-4">
    {showMobileSearch && (
      <button
        onClick={onMobileSearchClick}
        className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-105"
      >
        <Search className="w-4 h-4" />
      </button>
    )}

    <button
      onClick={onWishlistClick}
      className="p-2 lg:p-2.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-all duration-200 relative group hover:scale-105"
    >
      <Heart className="w-4 h-4 lg:w-5 lg:h-5" />
      <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium shadow-sm animate-pulse">
        0
      </span>
    </button>

    <button
      onClick={onCartClick}
      className="p-2 lg:p-2.5 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-all duration-200 relative group hover:scale-105"
    >
      <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
      <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium shadow-sm animate-pulse">
        0
      </span>
    </button>
  </div>
);

// Auth Buttons Component
const AuthButtons = ({
  isMobile = false,
  onSignIn,
  onBecomeVendor,
  user,
  onLogout,
}: {
  isMobile?: boolean;
  onSignIn?: () => void;
  onBecomeVendor?: () => void;
  user: {
    isAuthenticated: boolean;
    isVendor: boolean;
    email?: string;
    name?: string;
  };
  onLogout?: () => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  if (isMobile) {
    return (
      <div className="space-y-3">
        {!user.isAuthenticated ? (
          <>
            <button
              onClick={onSignIn}
              className="w-full text-left px-4 py-3 text-gray-600 hover:text-primary-600 font-medium text-base rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary-200 transition-all duration-200 hover:scale-105"
            >
              Sign In
            </button>
            {!user.isVendor && (
              <button
                onClick={onBecomeVendor}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base px-4 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-primary-500 hover:border-primary-600 hover:scale-105"
              >
                Become a Vendor
              </button>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-sm text-gray-600">
                Welcome, {user.name || user.email}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-medium text-red-600">Sign Out</p>
                <p className="text-xs text-red-500">Logout from account</p>
              </div>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {!user.isAuthenticated ? (
        <>
          <button
            onClick={onSignIn}
            className="hidden sm:block text-gray-600 hover:text-primary-600 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary-200 transition-all duration-200 hover:scale-105"
          >
            Sign In
          </button>
          {!user.isVendor && (
            <button
              onClick={onBecomeVendor}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-4 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-primary-500 hover:border-primary-600 hover:scale-105"
            >
              Become a Vendor
            </button>
          )}
        </>
      ) : (
        <div className="relative">
          {/* Avatar Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : user.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-gray-700 hidden sm:block">
              {user.name || user.email}
            </span>
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />

              {/* Dropdown Content */}
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-20">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50 rounded-t-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name || "User"}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="py-2">
                  <Link
                    href="/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Profile</p>
                      <p className="text-xs text-gray-500">
                        Manage your account
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/orders"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">My Orders</p>
                      <p className="text-xs text-gray-500">
                        Track your purchases
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/cart"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Shopping Cart</p>
                      <p className="text-xs text-gray-500">View your cart</p>
                    </div>
                  </Link>

                  <Link
                    href="/wishlist"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Wishlist</p>
                      <p className="text-xs text-gray-500">Saved items</p>
                    </div>
                  </Link>

                  {/* Become a Vendor Section */}
                  {!user.isVendor && (
                    <>
                      <div className="border-t border-gray-100 my-2" />
                      <Link
                        href="/vendor/register"
                        className="flex items-center px-4 py-3 text-sm text-primary-700 hover:bg-primary-50 transition-colors group"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-primary-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-primary-700">
                            Become a Vendor
                          </p>
                          <p className="text-xs text-primary-600">
                            Start selling your products
                          </p>
                        </div>
                      </Link>
                    </>
                  )}

                  {/* Vendor Dashboard Link */}
                  {user.isVendor && (
                    <>
                      <div className="border-t border-gray-100 my-2" />
                      <Link
                        href="/vendor/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-green-700 hover:bg-green-50 transition-colors group"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 transition-colors">
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-green-700">
                            Vendor Dashboard
                          </p>
                          <p className="text-xs text-green-600">
                            Manage your store
                          </p>
                        </div>
                      </Link>
                    </>
                  )}

                  {/* Settings & Help */}
                  <div className="border-t border-gray-100 my-2" />
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-gray-500">
                        Account preferences
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/help"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
                    onClick={() => setShowDropdown(false)}
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium">Help & Support</p>
                      <p className="text-xs text-gray-500">Get assistance</p>
                    </div>
                  </Link>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 my-2" />
                  <button
                    onClick={() => {
                      onLogout?.();
                      setShowDropdown(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-red-600">Sign Out</p>
                      <p className="text-xs text-red-500">
                        Logout from account
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Main Navbar Component
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "login"
  );

  const navigation = [
    { name: "Categories", href: "/categories", hasDropdown: true },
    { name: "Products", href: "/products", hasDropdown: true },
    { name: "About", href: "/about" },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => setIsMenuOpen(false);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(
        query.trim()
      )}`;
    }
  };

  const handleSignIn = () => {
    setAuthModalMode("login");
    setShowAuthModal(true);
  };

  const handleBecomeVendor = () => {
    window.location.href = "/vendor/register";
  };

  const handleLogout = async () => {
    await logout();
  };

  // Test functions removed - now using real Appwrite authentication

  const handleWishlistClick = () => {
    // Navigate to wishlist page
    window.location.href = "/wishlist";
  };

  const handleCartClick = () => {
    window.location.href = "/cart";
  };

  const handleLanguageChange = (language: string) => {
    // TODO: Implement actual language switching with i18n
    // For demo purposes, show an alert
    alert(
      `Language switching to ${language} will be implemented with internationalization. For now, the app is in English.`
    );
  };

  return (
    <nav
      className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "shadow-lg border-b border-gray-200"
          : "shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 ml-8">
            <NavigationLinks navigation={navigation} />
          </div>

          {/* Search Bar - Visible on all screens */}
          <div className="flex-1 max-w-md mx-4 md:mx-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Right side - Search, Cart, User actions */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Action Icons - Hidden on mobile */}
            <div className="hidden md:flex">
              <ActionIcons
                showMobileSearch={false}
                onMobileSearchClick={() => {}}
                onWishlistClick={handleWishlistClick}
                onCartClick={handleCartClick}
              />
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-8 bg-gray-200 mx-4"></div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <AuthButtons
                onSignIn={handleSignIn}
                onBecomeVendor={handleBecomeVendor}
                user={{
                  isAuthenticated,
                  isVendor: user?.role === "vendor",
                  email: user?.email,
                  name: user?.name,
                }}
                onLogout={handleLogout}
              />
            </div>

            {/* Mobile Auth Buttons - Hidden on mobile */}
            <div className="hidden">
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={handleSignIn}
                    className="text-gray-600 hover:text-primary-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  {user?.role !== "vendor" && (
                    <button
                      onClick={handleBecomeVendor}
                      className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Vendor
                    </button>
                  )}
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-primary-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary-200 transition-all duration-200"
                >
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* Test Buttons - Remove in production */}
          {/* <div className="hidden lg:flex items-center space-x-2 mr-4">
            <button
              onClick={simulateLogin}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded"
            >
              Test User
            </button>
            <button
              onClick={simulateVendorLogin}
              className="text-xs bg-green-500 text-white px-2 py-1 rounded"
            >
              Test Vendor
            </button>
            <button
              onClick={handleLogout}
              className="text-xs bg-red-500 text-white px-2 py-1 rounded"
            >
              Test Logout
            </button>
          </div> */}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMenuOpen}
          navigation={navigation}
          onLinkClick={handleLinkClick}
          onSearch={handleSearch}
          onSignIn={handleSignIn}
          onBecomeVendor={handleBecomeVendor}
          user={{
            isAuthenticated,
            isVendor: user?.role === "vendor",
            email: user?.email,
            name: user?.name,
          }}
          onLogout={handleLogout}
        />
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </nav>
  );
}

// Mobile Menu Component - Complete user menu
const MobileMenu = ({
  isOpen,
  navigation,
  onLinkClick,
  onSearch,
  onSignIn,
  onBecomeVendor,
  user,
  onLogout,
}: {
  isOpen: boolean;
  navigation: Array<{ name: string; href: string; hasDropdown?: boolean }>;
  onLinkClick: () => void;
  onSearch?: (query: string) => void;
  onSignIn?: () => void;
  onBecomeVendor?: () => void;
  user: {
    isAuthenticated: boolean;
    isVendor: boolean;
    email?: string;
    name?: string;
  };
  onLogout?: () => void;
}) =>
  isOpen && (
    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-in slide-in-from-top-2 duration-300 max-h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="px-4 py-6 space-y-4">
        <NavigationLinks
          navigation={navigation}
          isMobile={true}
          onLinkClick={onLinkClick}
        />

        {/* User Profile Section */}
        {user.isAuthenticated ? (
          <div className="pt-4 border-t border-gray-100">
            {/* User Info Header */}
            <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-2xl p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {user.name || "User"}
                  </h3>
                  <p className="text-gray-600 text-sm">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Personal Account Menu */}
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                Personal Account
              </h4>

              <Link
                href="/profile"
                className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                onClick={onLinkClick}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Profile</p>
                  <p className="text-xs text-gray-500">Manage your account</p>
                </div>
              </Link>

              <Link
                href="/orders"
                className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                onClick={onLinkClick}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">My Orders</p>
                  <p className="text-xs text-gray-500">Track your purchases</p>
                </div>
              </Link>

              <Link
                href="/cart"
                className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                onClick={onLinkClick}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Shopping Cart</p>
                  <p className="text-xs text-gray-500">View your cart</p>
                </div>
              </Link>

              <Link
                href="/wishlist"
                className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                onClick={onLinkClick}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Wishlist</p>
                  <p className="text-xs text-gray-500">Saved items</p>
                </div>
              </Link>
            </div>

            {/* Business & App Settings */}
            <div className="space-y-2 mb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                Business & App Settings
              </h4>

              {!user.isVendor && (
                <Link
                  href="/vendor/register"
                  className="flex items-center px-3 py-3 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors group"
                  onClick={onLinkClick}
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-200 transition-colors">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-orange-600">
                      Become a Vendor
                    </p>
                    <p className="text-xs text-orange-500">
                      Start selling your products
                    </p>
                  </div>
                </Link>
              )}

              <Link
                href="/settings"
                className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                onClick={onLinkClick}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Settings</p>
                  <p className="text-xs text-gray-500">Account preferences</p>
                </div>
              </Link>

              <Link
                href="/help"
                className="flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                onClick={onLinkClick}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-primary-100 transition-colors">
                  <svg
                    className="w-4 h-4 text-gray-600 group-hover:text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">Help & Support</p>
                  <p className="text-xs text-gray-500">Get assistance</p>
                </div>
              </Link>
            </div>

            {/* Sign Out */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => {
                  onLogout?.();
                  onLinkClick();
                }}
                className="flex items-center w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 transition-colors">
                  <svg
                    className="w-4 h-4 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium text-red-600">Sign Out</p>
                  <p className="text-xs text-red-500">Logout from account</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 border-t border-gray-100">
            <AuthButtons
              isMobile={true}
              onSignIn={onSignIn}
              onBecomeVendor={onBecomeVendor}
              user={user}
              onLogout={onLogout}
            />
          </div>
        )}

        {/* Scroll indicator */}
        <div className="flex justify-center py-2 pb-4">
          <div className="w-8 h-1 bg-gray-200 rounded-full opacity-50"></div>
        </div>
      </div>
    </div>
  );
