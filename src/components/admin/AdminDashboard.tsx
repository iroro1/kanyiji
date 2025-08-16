"use client";

import {
  Ban,
  Check,
  Clock,
  Eye,
  Package,
  Settings,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  productsCount: number;
  joinDate: string;
  kycStatus: "pending" | "verified" | "rejected";
}

interface Product {
  id: string;
  name: string;
  vendor: string;
  price: number;
  status: "active" | "inactive" | "pending" | "rejected";
  category: string;
  reportCount: number;
}

interface Order {
  id: string;
  customerName: string;
  vendorName: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "vendors"
    | "products"
    | "orders"
    | "kyc"
    | "analytics"
    | "users"
    | "settings"
  >("overview");

  // Debug: Log active tab changes
  useEffect(() => {
    console.log("AdminDashboard - Active tab changed to:", activeTab);
  }, [activeTab]);

  // Get active tab from URL and listen for changes
  useEffect(() => {
    const updateActiveTab = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab =
        (urlParams.get("tab") as
          | "overview"
          | "vendors"
          | "products"
          | "orders"
          | "kyc"
          | "analytics"
          | "users"
          | "settings") || "overview";
      console.log(
        "AdminDashboard - updateActiveTab called, setting tab to:",
        tab
      );
      setActiveTab(tab);
    };

    // Set initial tab
    updateActiveTab();

    // Listen for URL changes (popstate event)
    window.addEventListener("popstate", updateActiveTab);

    // Listen for custom navigation events
    const handleTabChange = () => updateActiveTab();
    window.addEventListener("tabChange", handleTabChange);

    // Poll for URL changes as a fallback (every 100ms)
    const intervalId = setInterval(updateActiveTab, 100);

    return () => {
      window.removeEventListener("popstate", updateActiveTab);
      window.removeEventListener("tabChange", handleTabChange);
      clearInterval(intervalId);
    };
  }, []);

  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: "1",
      businessName: "African Crafts Co.",
      ownerName: "John Doe",
      email: "john@africancrafts.com",
      status: "approved",
      productsCount: 25,
      joinDate: "2024-01-01",
      kycStatus: "verified",
    },
    {
      id: "2",
      businessName: "Nigerian Textiles",
      ownerName: "Jane Smith",
      email: "jane@nigeriantextiles.com",
      status: "pending",
      productsCount: 0,
      joinDate: "2024-01-15",
      kycStatus: "pending",
    },
    {
      id: "3",
      businessName: "Ghana Beads",
      ownerName: "Mike Johnson",
      email: "mike@ghanabeads.com",
      status: "suspended",
      productsCount: 12,
      joinDate: "2023-12-01",
      kycStatus: "verified",
    },
  ]);

  const products: Product[] = [
    {
      id: "1",
      name: "Handcrafted African Beaded Necklace",
      vendor: "African Crafts Co.",
      price: 2500,
      status: "active",
      category: "Jewelry",
      reportCount: 0,
    },
    {
      id: "2",
      name: "Traditional Nigerian Ankara Fabric",
      vendor: "Nigerian Textiles",
      price: 3500,
      status: "pending",
      category: "Textiles",
      reportCount: 0,
    },
    {
      id: "3",
      name: "Wooden African Mask",
      vendor: "Ghana Beads",
      price: 4500,
      status: "rejected",
      category: "Decor",
      reportCount: 2,
    },
  ];

  const orders: Order[] = [
    {
      id: "ORD001",
      customerName: "John Doe",
      vendorName: "African Crafts Co.",
      amount: 2500,
      status: "pending",
      date: "2024-01-15",
    },
    {
      id: "ORD002",
      customerName: "Jane Smith",
      vendorName: "Nigerian Textiles",
      amount: 7000,
      status: "processing",
      date: "2024-01-14",
    },
    {
      id: "ORD003",
      customerName: "Mike Johnson",
      vendorName: "Ghana Beads",
      amount: 4500,
      status: "shipped",
      date: "2024-01-13",
    },
    {
      id: "ORD004",
      customerName: "Sarah Wilson",
      vendorName: "African Crafts Co.",
      amount: 12000,
      status: "delivered",
      date: "2024-01-12",
    },
    {
      id: "ORD005",
      customerName: "David Brown",
      vendorName: "Nigerian Textiles",
      amount: 8500,
      status: "cancelled",
      date: "2024-01-11",
    },
  ];

  // Enhanced admin statistics
  const adminStats = {
    totalRevenue: 28500,
    monthlyRevenue: 28500,
    totalOrders: 5,
    pendingOrders: 1,
    totalVendors: 3,
    pendingVendors: 1,
    totalProducts: 37,
    pendingProducts: 1,
    activeUsers: 1247,
    systemUptime: 99.8,
    supportTickets: 23,
    criticalIssues: 2,
  };

  // Recent activities for overview
  const recentActivities = [
    {
      id: 1,
      type: "vendor_application",
      message: "New vendor application from 'Nigerian Textiles'",
      timestamp: "2 hours ago",
      priority: "high",
    },
    {
      id: 2,
      type: "order_placed",
      message: "Order ORD001 placed for ₦2,500",
      timestamp: "4 hours ago",
      priority: "medium",
    },
    {
      id: 3,
      type: "product_reported",
      message: "Product 'Wooden African Mask' reported by user",
      timestamp: "6 hours ago",
      priority: "high",
    },
    {
      id: 4,
      type: "kyc_approved",
      message: "KYC verification completed for 'African Crafts Co.'",
      timestamp: "1 day ago",
      priority: "low",
    },
    {
      id: 5,
      type: "system_alert",
      message: "High traffic detected on platform",
      timestamp: "2 days ago",
      priority: "medium",
    },
  ];

  // Platform health metrics
  const platformHealth = {
    serverLoad: 45,
    databasePerformance: 92,
    apiResponseTime: 180,
    errorRate: 0.2,
    activeSessions: 89,
    cacheHitRate: 87,
  };

  const stats = [
    {
      label: "Total Vendors",
      value: vendors.length,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-green-600",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-purple-600",
    },
    {
      label: "Monthly Revenue",
      value: "₦2.5M",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "suspended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleApproveVendor = (vendorId: string) => {
    // Get existing vendors from localStorage
    const existingVendors = JSON.parse(localStorage.getItem("vendors") || "[]");

    // Find and update the vendor status
    const vendorIndex = existingVendors.findIndex(
      (v: any) => v.id === vendorId
    );
    if (vendorIndex >= 0) {
      existingVendors[vendorIndex].status = "approved";
      existingVendors[vendorIndex].approved = true;
      existingVendors[vendorIndex].approvedDate = new Date().toISOString();
      localStorage.setItem("vendors", JSON.stringify(existingVendors));

      // Update the local state
      setVendors(existingVendors);
      alert("Vendor approved successfully!");
    }
  };

  const handleRejectVendor = (vendorId: string) => {
    // Get existing vendors from localStorage
    const existingVendors = JSON.parse(localStorage.getItem("vendors") || "[]");

    // Find and update the vendor status
    const vendorIndex = existingVendors.findIndex(
      (v: any) => v.id === vendorId
    );
    if (vendorIndex >= 0) {
      existingVendors[vendorIndex].status = "rejected";
      existingVendors[vendorIndex].approved = false;
      existingVendors[vendorIndex].rejectedDate = new Date().toISOString();
      localStorage.setItem("vendors", JSON.stringify(existingVendors));

      // Update the local state
      setVendors(existingVendors);
      alert("Vendor rejected successfully!");
    }
  };

  const handleSuspendVendor = (vendorId: string) => {
    // Get existing vendors from localStorage
    const existingVendors = JSON.parse(localStorage.getItem("vendors") || "[]");

    // Find and update the vendor status
    const vendorIndex = existingVendors.findIndex(
      (v: any) => v.id === vendorId
    );
    if (vendorIndex >= 0) {
      existingVendors[vendorIndex].status = "suspended";
      existingVendors[vendorIndex].approved = false;
      existingVendors[vendorIndex].suspendedDate = new Date().toISOString();
      localStorage.setItem("vendors", JSON.stringify(existingVendors));

      // Update the local state
      setVendors(existingVendors);
      alert("Vendor suspended successfully!");
    }
  };

  const handleVendorAction = (
    vendorId: string,
    action: "approved" | "rejected" | "suspended"
  ) => {
    if (action === "approved") {
      handleApproveVendor(vendorId);
    } else if (action === "rejected") {
      handleRejectVendor(vendorId);
    } else if (action === "suspended") {
      handleSuspendVendor(vendorId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage Kanyiji marketplace platform
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                <Settings className="w-5 h-5 inline mr-2" />
                Platform Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab content is now handled by the navbar navigation */}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">
                      Total Revenue
                    </p>
                    <p className="text-3xl font-bold">
                      ₦{adminStats.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-blue-200 text-sm">
                      +12% from last month
                    </p>
                  </div>
                  <div className="p-3 bg-blue-400 rounded-lg">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">
                      Active Users
                    </p>
                    <p className="text-3xl font-bold">
                      {adminStats.activeUsers.toLocaleString()}
                    </p>
                    <p className="text-green-200 text-sm">+8% from last week</p>
                  </div>
                  <div className="p-3 bg-green-400 rounded-lg">
                    <Users className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold">
                      {adminStats.totalOrders}
                    </p>
                    <p className="text-purple-200 text-sm">
                      {adminStats.pendingOrders} pending
                    </p>
                  </div>
                  <div className="p-3 bg-purple-400 rounded-lg">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">
                      System Health
                    </p>
                    <p className="text-3xl font-bold">
                      {adminStats.systemUptime}%
                    </p>
                    <p className="text-orange-200 text-sm">
                      {adminStats.criticalIssues} critical issues
                    </p>
                  </div>
                  <div className="p-3 bg-orange-400 rounded-lg">
                    <Settings className="w-8 h-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Activity & Health Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activities */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Activities
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            activity.priority === "high"
                              ? "bg-red-500"
                              : activity.priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Platform Health */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Platform Health
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Server Load</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${platformHealth.serverLoad}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {platformHealth.serverLoad}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${platformHealth.databasePerformance}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {platformHealth.databasePerformance}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        API Response
                      </span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: `${
                                platformHealth.apiResponseTime < 100
                                  ? 100 - platformHealth.apiResponseTime
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {platformHealth.apiResponseTime}ms
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              platformHealth.errorRate < 1
                                ? "bg-green-500"
                                : platformHealth.errorRate < 5
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                platformHealth.errorRate * 10,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {platformHealth.errorRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support & Issues */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Support & Issues
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Support Tickets
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {adminStats.supportTickets}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Critical Issues
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {adminStats.criticalIssues}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts and Notifications */}
            <div className="space-y-4">
              {adminStats.criticalIssues > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Critical Issues Detected
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          {adminStats.criticalIssues} issues require immediate
                          attention.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminStats.supportTickets > 20 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        High Support Volume
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>{adminStats.supportTickets} tickets in queue.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {adminStats.criticalIssues === 0 &&
                adminStats.supportTickets <= 20 &&
                platformHealth.serverLoad <= 80 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">
                          All Systems Operational
                        </h3>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            Platform is running smoothly with no critical
                            issues.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}

        {activeTab === "vendors" && (
          <div className="space-y-6">
            {/* Vendor Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Vendor Management
                </h2>
                <p className="text-gray-600">
                  Review, approve, and manage marketplace vendors
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                  <Users className="w-5 h-5 inline mr-2" />
                  Export Data
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                  <Check className="w-5 h-5 inline mr-2" />
                  Bulk Approve
                </button>
              </div>
            </div>

            {/* Vendor Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Vendors
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {vendors.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Approval
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {vendors.filter((v) => v.status === "pending").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Approved
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {vendors.filter((v) => v.status === "approved").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Suspended
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {vendors.filter((v) => v.status === "suspended").length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Vendor Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">All Vendors</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Business
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        KYC Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Join Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                      <tr key={vendor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vendor.businessName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.ownerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              vendor.status
                            )}`}
                          >
                            {vendor.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKYCStatusColor(
                              vendor.kycStatus
                            )}`}
                          >
                            {vendor.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.productsCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {vendor.status === "pending" && (
                              <>
                                <button
                                  className="text-green-600 hover:text-green-900"
                                  onClick={() =>
                                    handleVendorAction(vendor.id, "approved")
                                  }
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() =>
                                    handleVendorAction(vendor.id, "rejected")
                                  }
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {vendor.status === "approved" && (
                              <button
                                className="text-yellow-600 hover:text-yellow-900"
                                onClick={() =>
                                  handleVendorAction(vendor.id, "suspended")
                                }
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-6">
            {/* Product Management Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Product Management
                </h2>
                <p className="text-gray-600">
                  Review, approve, and manage marketplace products
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                  <Package className="w-5 h-5 inline mr-2" />
                  Export Data
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200">
                  <Check className="w-5 h-5 inline mr-2" />
                  Bulk Approve
                </button>
              </div>
            </div>

            {/* Product Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Products
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {products.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Review
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {products.filter((p) => p.status === "pending").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {products.filter((p) => p.status === "active").length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Ban className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Reported
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {products.filter((p) => p.reportCount > 0).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Product Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">All Products</h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reports
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.vendor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₦{product.price.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.reportCount > 0 ? (
                            <span className="text-red-600 font-medium">
                              {product.reportCount}
                            </span>
                          ) : (
                            <span className="text-gray-500">0</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            {product.status === "pending" && (
                              <>
                                <button className="text-green-600 hover:text-green-900">
                                  <Check className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-900">
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Order Management
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.vendorName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₦{order.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "kyc" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                KYC Verification Queue
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendors
                    .filter((v) => v.kycStatus === "pending")
                    .map((vendor) => (
                      <tr key={vendor.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vendor.businessName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {vendor.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.ownerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getKYCStatusColor(
                              vendor.kycStatus
                            )}`}
                          >
                            {vendor.kycStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button className="text-primary-600 hover:text-primary-900 font-medium">
                            View Documents
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {vendor.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-green-600 hover:text-green-900">
                              <Check className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Analytics Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {adminStats.totalRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {adminStats.activeUsers}
                  </div>
                  <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {adminStats.totalOrders}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                User Management
              </h3>
              <p className="text-gray-600">
                User management features coming soon...
              </p>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Platform Settings
              </h3>
              <p className="text-gray-600">
                Platform configuration options coming soon...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
