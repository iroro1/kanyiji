"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Shield,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  BarChart3,
  Users,
  Package,
  ShoppingBag,
  Settings,
} from "lucide-react";

export default function AdminNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    // Get admin session info
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        setAdminInfo(session);
      } catch (error) {
        console.error("Error parsing admin session:", error);
      }
    }

    // Set active tab based on URL
    const tab = searchParams.get("tab") || "overview";
    console.log("AdminNavbar - Setting initial tab from URL:", tab);
    setActiveTab(tab);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchParams]);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/admin/login");
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      console.log("Admin searching for:", query);
    }
  };

  const handleTabChange = (tab: string) => {
    console.log("AdminNavbar - Tab clicked:", tab);
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
    
    // Dispatch custom event for AdminDashboard to listen to
    window.dispatchEvent(new CustomEvent('tabChange', { detail: { tab } }));
  };

  const adminNavigation = [
    { id: "overview", name: "Overview", href: "/admin?tab=overview", icon: BarChart3 },
    { id: "vendors", name: "Vendors", href: "/admin?tab=vendors", icon: Users },
    { id: "products", name: "Products", href: "/admin?tab=products", icon: Package },
    { id: "orders", name: "Orders", href: "/admin?tab=orders", icon: ShoppingBag },
    { id: "kyc", name: "KYC Review", href: "/admin?tab=kyc", icon: Shield },
    { id: "analytics", name: "Analytics", href: "/admin?tab=analytics", icon: BarChart3 },
    { id: "users", name: "Users", href: "/admin?tab=users", icon: Users },
    { id: "settings", name: "Settings", href: "/admin?tab=settings", icon: Settings },
  ];

  return (
    <>
      {/* Large Desktop Admin Navbar (xl and above) */}
      <nav
        className={`hidden xl:block bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "shadow-2xl border-b border-gray-700"
            : "shadow-lg border-b border-gray-700"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Kanyiji Admin</h1>
                <p className="text-xs text-gray-300">Platform Administration</p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="flex items-center space-x-1">
              {adminNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group relative ${
                    activeTab === item.id
                      ? "text-white bg-gray-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium">{item.name}</span>
                  {activeTab === item.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Admin Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors, products, orders..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  3
                </span>
              </button>

              {/* Admin Profile */}
              <button className="flex items-center space-x-2 p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium">
                  {adminInfo?.email || "Admin"}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Medium Desktop Admin Navbar (lg to xl) */}
      <nav
        className={`hidden lg:block xl:hidden bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "shadow-2xl border-b border-gray-700"
            : "shadow-lg border-b border-gray-700"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin</h1>
                <p className="text-xs text-gray-300">Platform</p>
              </div>
            </div>

            {/* Medium Desktop Navigation Tabs */}
            <div className="flex items-center space-x-1">
              {adminNavigation.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 group relative ${
                    activeTab === item.id
                      ? "text-white bg-gray-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{item.name}</span>
                  {activeTab === item.id && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Right side - Compact */}
            <div className="flex items-center space-x-2">
              {/* Compact Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-40 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-sm"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  3
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Admin Navbar (below lg) */}
      <nav
        className={`lg:hidden bg-gradient-to-r from-gray-900 to-gray-800 sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "shadow-2xl border-b border-gray-700"
            : "shadow-lg border-b border-gray-700"
        }`}
      >
        <div className="px-4">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Admin</h1>
              </div>
            </div>

            {/* Mobile Right Side */}
            <div className="flex items-center space-x-2">
              {/* Mobile Search Toggle */}
              <button className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                <Search className="w-5 h-5" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Always visible */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="bg-gray-800 border-t border-gray-700">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Navigation Links */}
              {adminNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                    activeTab === item.id
                      ? "text-white bg-gray-700"
                      : "text-gray-300 hover:text-white hover:bg-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </button>
              ))}

              {/* Mobile Admin Info */}
              <div className="pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-3 px-4 py-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {adminInfo?.email || "Admin"}
                    </p>
                    <p className="text-xs text-gray-400">
                      Platform Administrator
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile Logout */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
