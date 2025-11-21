"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import kanyijiLogo from "@/assets/Kanyiji-light.png";
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
  ChevronRight,
} from "lucide-react";
import NotificationDropdown from "@/components/admin/NotificationDropdown";

export default function AdminNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [adminInfo, setAdminInfo] = useState<{ email?: string; name?: string } | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get admin session info from API
    const fetchAdminInfo = async () => {
      try {
        const response = await fetch('/api/admin/auth', {
          credentials: 'include',
        });
        const data = await response.json();
        if (data.authenticated && data.user) {
          setAdminInfo(data.user);
        }
      } catch (error) {
        console.error("Error fetching admin info:", error);
      }
    };

    fetchAdminInfo();

    // Set active tab based on URL
    const tab = searchParams.get("tab") || "overview";
    setActiveTab(tab);

    // Fetch unread notification count
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch("/api/admin/notifications?limit=1&unread_only=true", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.unreadCount || 0);
        }
      } catch (error) {
        // Silent fail for unread count
      }
    };

    fetchUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [searchParams]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include',
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/admin/login');
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Search functionality to be implemented
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
    
    // Dispatch custom event for AdminDashboard to listen to
    window.dispatchEvent(new CustomEvent('tabChange', { detail: { tab } }));
    setIsMobileMenuOpen(false);
  };

  const adminNavigation = [
    { id: "overview", name: "Overview", href: "/admin?tab=overview", icon: BarChart3 },
    { id: "vendors", name: "Vendors", href: "/admin?tab=vendors", icon: Users },
    { id: "products", name: "Products", href: "/admin?tab=products", icon: Package },
    { id: "orders", name: "Orders", href: "/admin?tab=orders", icon: ShoppingBag },
    { id: "notifications", name: "Notifications", href: "/admin?tab=notifications", icon: Bell },
    { id: "users", name: "Users", href: "/admin?tab=users", icon: Users },
    { id: "analytics", name: "Analytics", href: "/admin?tab=analytics", icon: BarChart3 },
    { id: "settings", name: "Settings", href: "/admin?tab=settings", icon: Settings },
  ];

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo and Menu Toggle */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>

              {/* Logo */}
              <div className="flex items-center justify-center flex-shrink-0">
                <div className="relative w-14 h-14 flex items-center justify-center overflow-hidden">
                  <Image
                    src={kanyijiLogo}
                    alt="Kanyiji Logo"
                    width={56}
                    height={56}
                    className="object-contain"
                    priority
                    style={{ 
                      filter: 'brightness(0.85) contrast(1.3) saturate(1.1)',
                      width: '100%',
                      height: '100%'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs */}
            <div className="hidden lg:flex items-center space-x-1">
              {adminNavigation.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* Mobile Search Toggle */}
              <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <NotificationDropdown 
                unreadCount={unreadCount}
                onUnreadCountChange={setUnreadCount} 
                onUnreadCountChange={(count) => {
                  setUnreadCount(count);
                }}
              />

              {/* Admin Profile Dropdown */}
              <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-gray-200 flex-shrink-0">
                <div className="text-right min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {adminInfo?.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {adminInfo?.email || "admin@kanyiji.com"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Profile */}
              <button className="sm:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src={kanyijiLogo}
                    alt="Admin"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden overflow-y-auto shadow-xl">
            <div className="p-4 space-y-1">
              {/* Navigation Links */}
              {adminNavigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  {activeTab === item.id && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}

              {/* Divider */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                {/* Admin Info */}
                <div className="px-4 py-3 mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {adminInfo?.name || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {adminInfo?.email || "admin@kanyiji.com"}
                  </p>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
