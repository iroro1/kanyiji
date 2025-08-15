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
}: {
  isMobile?: boolean;
  onSignIn?: () => void;
  onBecomeVendor?: () => void;
}) => (
  <div className={`flex items-center ${isMobile ? "space-y-3" : "space-x-4"}`}>
    <button
      onClick={onSignIn}
      className={`${
        isMobile
          ? "w-full text-left px-4 py-3 text-gray-600 hover:text-primary-600 font-medium text-base rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary-200 transition-all duration-200 hover:scale-105"
          : "hidden sm:block text-gray-600 hover:text-primary-600 font-medium text-sm px-5 py-2.5 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-primary-200 transition-all duration-200 hover:scale-105"
      }`}
    >
      Sign In
    </button>
    <button
      onClick={onBecomeVendor}
      className={`${
        isMobile
          ? "w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base px-4 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-primary-500 hover:border-primary-600 hover:scale-105"
          : "bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-primary-500 hover:border-primary-600 hover:scale-105"
      }`}
    >
      Become a Vendor
    </button>
  </div>
);

// Mobile Menu Component
const MobileMenu = ({
  isOpen,
  navigation,
  onLinkClick,
  onSearch,
  onSignIn,
  onBecomeVendor,
}: {
  isOpen: boolean;
  navigation: Array<{ name: string; href: string; hasDropdown?: boolean }>;
  onLinkClick: () => void;
  onSearch?: (query: string) => void;
  onSignIn?: () => void;
  onBecomeVendor?: () => void;
}) =>
  isOpen && (
    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-in slide-in-from-top-2 duration-300">
      <div className="px-4 py-6 space-y-4">
        <SearchBar isMobile={true} onSearch={onSearch} />
        <NavigationLinks
          navigation={navigation}
          isMobile={true}
          onLinkClick={onLinkClick}
        />
        <div className="pt-4 border-t border-gray-100">
          <AuthButtons
            isMobile={true}
            onSignIn={onSignIn}
            onBecomeVendor={onBecomeVendor}
          />
        </div>
      </div>
    </div>
  );

// Main Navbar Component
export default function Navbar() {
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
    console.log("Searching for:", query);
    // TODO: Implement search functionality
  };

  const handleSignIn = () => {
    setAuthModalMode("login");
    setShowAuthModal(true);
  };

  const handleBecomeVendor = () => {
    window.location.href = "/vendor/register";
  };

  const handleWishlistClick = () => {
    console.log("Wishlist clicked");
    // TODO: Navigate to wishlist
  };

  const handleCartClick = () => {
    window.location.href = "/cart";
  };

  const handleLanguageClick = () => {
    console.log("Language selector clicked");
    // TODO: Implement language selection
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

          {/* Center Search Bar */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Right side - Search, Cart, User actions */}
          <div className="flex items-center space-x-4 lg:space-x-6">
            {/* Action Icons */}
            <ActionIcons
              showMobileSearch={true}
              onMobileSearchClick={() => {}}
              onWishlistClick={handleWishlistClick}
              onCartClick={handleCartClick}
            />

            {/* Divider */}
            <div className="hidden lg:block w-px h-8 bg-gray-200 mx-4"></div>

            {/* Auth Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <AuthButtons
                onSignIn={handleSignIn}
                onBecomeVendor={handleBecomeVendor}
              />
            </div>

            {/* Mobile Auth Buttons - Compact */}
            <div className="lg:hidden flex items-center space-x-3">
              <button
                onClick={handleSignIn}
                className="text-gray-600 hover:text-primary-600 font-medium text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Sign In
              </button>
              <button
                onClick={handleBecomeVendor}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-sm px-3 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Vendor
              </button>
            </div>
          </div>

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
