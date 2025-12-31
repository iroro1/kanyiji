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
  Loader2,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Bell,
  FileText,
  Wallet,
  DollarSign,
  ArrowRight,
  History,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  fetchAdminStats,
  fetchVendors,
  updateVendor,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  type AdminStats,
} from "@/lib/adminApi";
import { getCategoryById, CATEGORIES } from "@/data/categories";

interface Vendor {
  id: string;
  business_name: string;
  user_id?: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
  status: "pending" | "approved" | "suspended" | "rejected";
  verification_status: "unverified" | "pending" | "verified" | "rejected";
  created_at: string;
  productsCount?: number;
  kyc_documents?: Array<{
    business_license_url?: string;
    tax_certificate_url?: string;
    bank_statement_url?: string;
  }>;
  business_type?: string;
  business_description?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website_url?: string;
}

interface Product {
  id: string;
  name: string;
  price: string;
  status: "draft" | "active" | "inactive" | "archived";
  vendor_id?: string;
  category_id?: string;
  description?: string;
  vendors?: {
    id?: string;
    business_name?: string;
  };
  categories?: {
    id?: string;
    name?: string;
  };
  created_at: string;
}

interface Order {
  id: string;
  total_amount: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  customer?: {
    full_name?: string;
    email?: string;
  };
  vendor?: {
    business_name?: string;
  };
  created_at: string;
}

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: "admin" | "vendor" | "customer";
  is_active: boolean;
  created_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<
    | "overview"
    | "vendors"
    | "products"
    | "orders"
    | "notifications"
    | "kyc"
    | "analytics"
    | "users"
    | "payouts"
    | "settings"
  >("overview");

  // Stats state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Vendors state
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [vendorsPage, setVendorsPage] = useState(1);
  const [vendorsTotal, setVendorsTotal] = useState(0);
  const [vendorsStatusFilter, setVendorsStatusFilter] = useState<string>("");
  const [vendorActionLoading, setVendorActionLoading] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productsStatusFilter, setProductsStatusFilter] = useState<string>("");

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<string>("");

  // Users state
  const [adminUsers, setAdminUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [usersPage, setUsersPage] = useState(1);

  // Payouts state
  const [payouts, setPayouts] = useState<any[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [payoutsError, setPayoutsError] = useState<string | null>(null);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [payoutsTotal, setPayoutsTotal] = useState(0);
  const [payoutsStatusFilter, setPayoutsStatusFilter] = useState<string>("");
  const [processingPayout, setProcessingPayout] = useState<string | null>(null);
  const [payoutActionModal, setPayoutActionModal] = useState<{ payout: any; action: string } | null>(null);
  const [payoutFailureReason, setPayoutFailureReason] = useState("");
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersRoleFilter, setUsersRoleFilter] = useState<string>("");

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [notificationsPage, setNotificationsPage] = useState(1);
  const [notificationsTotal, setNotificationsTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsFilter, setNotificationsFilter] = useState<string>(""); // "all" | "unread" | "read"
  const [createNotificationModal, setCreateNotificationModal] = useState(false);
  const [createNotificationLoading, setCreateNotificationLoading] = useState(false);
  const [notificationUsers, setNotificationUsers] = useState<User[]>([]);
  const [notificationUsersLoading, setNotificationUsersLoading] = useState(false);

  // Modal states
  const [vendorDetailsModal, setVendorDetailsModal] = useState<Vendor | null>(null);
  const [productDetailsModal, setProductDetailsModal] = useState<Product | null>(null);
  const [orderDetailsModal, setOrderDetailsModal] = useState<Order | null>(null);
  const [userDetailsModal, setUserDetailsModal] = useState<User | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [allVendors, setAllVendors] = useState<Array<{ id: string; business_name: string }>>([]);
  const [vendorsLoadingForModal, setVendorsLoadingForModal] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({});

  // Get active tab from URL
  useEffect(() => {
    const updateActiveTab = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tab =
        (urlParams.get("tab") as
          | "overview"
          | "vendors"
          | "products"
          | "orders"
          | "notifications"
          | "kyc"
          | "analytics"
          | "users"
          | "settings") || "overview";
      setActiveTab(tab);
    };

    updateActiveTab();
    window.addEventListener("popstate", updateActiveTab);
    const handleTabChange = () => updateActiveTab();
    window.addEventListener("tabChange", handleTabChange);
    const intervalId = setInterval(updateActiveTab, 100);

    return () => {
      window.removeEventListener("popstate", updateActiveTab);
      window.removeEventListener("tabChange", handleTabChange);
      clearInterval(intervalId);
    };
  }, []);

  // Fetch admin stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);
        const stats = await fetchAdminStats();
        setAdminStats(stats);
      } catch (error: any) {
        setStatsError(error.message || "Failed to load stats");
        toast.error("Failed to load dashboard statistics");
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  // Fetch vendors
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setVendorsLoading(true);
        setVendorsError(null);
        const data = await fetchVendors(
          vendorsPage,
          10,
          vendorsStatusFilter || undefined
        );
        setVendors(data.vendors || []);
        setVendorsTotal(data.pagination?.total || 0);
      } catch (error: any) {
        setVendorsError(error.message || "Failed to load vendors");
        toast.error("Failed to load vendors");
      } finally {
        setVendorsLoading(false);
      }
    };

    if (activeTab === "vendors" || activeTab === "kyc") {
      loadVendors();
    }
  }, [activeTab, vendorsPage, vendorsStatusFilter]);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProductsLoading(true);
        setProductsError(null);
        const data = await fetchProducts(
          productsPage,
          10,
          productsStatusFilter || undefined
        );
        setProducts(data.products || []);
        setProductsTotal(data.pagination?.total || 0);
      } catch (error: any) {
        const errorMessage = error.message || "Failed to load products";
        console.error("Products fetch error:", error);
        setProductsError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setProductsLoading(false);
      }
    };

    if (activeTab === "products") {
      loadProducts();
    }
  }, [activeTab, productsPage, productsStatusFilter]);

  // Fetch orders
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setOrdersLoading(true);
        setOrdersError(null);
        const data = await fetchOrders(
          ordersPage,
          10,
          ordersStatusFilter || undefined
        );
        setOrders(data.orders || []);
        setOrdersTotal(data.pagination?.total || 0);
      } catch (error: any) {
        setOrdersError(error.message || "Failed to load orders");
        toast.error("Failed to load orders");
      } finally {
        setOrdersLoading(false);
      }
    };

    if (activeTab === "orders") {
      loadOrders();
    }
  }, [activeTab, ordersPage, ordersStatusFilter]);

  // Fetch users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        // Pass the role filter if it's set
        const roleFilter = usersRoleFilter || undefined;
        const data = await fetchUsers(usersPage, 10, roleFilter);
        setAdminUsers(data.users || []);
        setUsersTotal(data.pagination?.total || 0);
      } catch (error: any) {
        setUsersError(error.message || "Failed to load users");
        toast.error("Failed to load users");
      } finally {
        setUsersLoading(false);
      }
    };

    if (activeTab === "users") {
      loadUsers();
    }

    if (activeTab === "payouts") {
      loadPayouts();
    }
  }, [activeTab, usersPage, usersRoleFilter, payoutsPage, payoutsStatusFilter]);

  const loadPayouts = async () => {
    try {
      setPayoutsLoading(true);
      setPayoutsError(null);
      const statusFilter = payoutsStatusFilter || undefined;
      const response = await fetch(
        `/api/admin/payouts?page=${payoutsPage}&limit=20${statusFilter ? `&status=${statusFilter}` : ""}`,
        {
          credentials: "include",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPayouts(data.payouts || []);
        setPayoutsTotal(data.total || 0);
      } else {
        setPayoutsError("Failed to load payouts");
        toast.error("Failed to load payouts");
      }
    } catch (error: any) {
      setPayoutsError(error.message || "Failed to load payouts");
      toast.error("Failed to load payouts");
    } finally {
      setPayoutsLoading(false);
    }
  };

  const handleProcessPayout = async (payoutId: string, status: string, failureReason?: string) => {
    try {
      setProcessingPayout(payoutId);
      const response = await fetch("/api/admin/payouts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          payoutId,
          status,
          failureReason,
        }),
      });

      if (response.ok) {
        toast.success(`Payout ${status} successfully`);
        setPayoutActionModal(null);
        setPayoutFailureReason("");
        loadPayouts();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to process payout");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process payout");
    } finally {
      setProcessingPayout(null);
    }
  };

  // Fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        setNotificationsError(null);
        const unreadOnly = notificationsFilter === "unread";
        const response = await fetch(
          `/api/admin/notifications?page=${notificationsPage}&limit=20&unread_only=${unreadOnly}`,
          {
            credentials: "include",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications || []);
          setNotificationsTotal(data.pagination?.total || 0);
          setUnreadCount(data.unreadCount || 0);
        } else {
          throw new Error("Failed to load notifications");
        }
      } catch (error: any) {
        setNotificationsError(error.message || "Failed to load notifications");
        toast.error("Failed to load notifications");
      } finally {
        setNotificationsLoading(false);
      }
    };

    if (activeTab === "notifications") {
      loadNotifications();
    }
  }, [activeTab, notificationsPage, notificationsFilter]);

  // Fetch categories and vendors when product modal opens
  useEffect(() => {
    const loadData = async () => {
      if (productModalOpen) {
        try {
          // Load categories from hardcoded list
          setCategoriesLoading(true);
          try {
            const { getCategoriesForSelect } = await import("@/data/categories");
            const cats = getCategoriesForSelect();
            setCategories(cats || []);
          } catch (catError: any) {
            console.error("Failed to load categories:", catError);
            setCategories([]);
          } finally {
            setCategoriesLoading(false);
          }

          // Load vendors for dropdown
          setVendorsLoadingForModal(true);
          try {
            const vendorsData = await fetchVendors(1, 1000); // Get all vendors
            const approvedVendors = (vendorsData.vendors || []).filter(
              (v: Vendor) => v.status === "approved"
            );
            setAllVendors(approvedVendors.map((v: Vendor) => ({ id: v.id, business_name: v.business_name })));
          } catch (vendorError: any) {
            console.error("Failed to load vendors:", vendorError);
            toast.error("Failed to load vendors: " + (vendorError.message || "Unknown error"));
            setAllVendors([]);
          } finally {
            setVendorsLoadingForModal(false);
          }

          // Load existing product images if editing
          if (editingProduct) {
            // Assuming product images are stored in product_images table
            // For now, we'll handle images separately if they exist
            setProductImages([]);
          } else {
            setProductImages([]);
          }
        } catch (error: any) {
          console.error("Failed to load data:", error);
          toast.error("Failed to load form data");
          setCategoriesLoading(false);
          setVendorsLoadingForModal(false);
        }
      } else {
        // Reset state when modal closes
        setProductImages([]);
      }
    };
    loadData();
  }, [productModalOpen, editingProduct]);

  // Fetch signed URL for document viewing
  const getDocumentUrl = async (originalUrl: string, docKey: string): Promise<string | null> => {
    // Check if we already have a cached signed URL
    if (documentUrls[docKey]) {
      return documentUrls[docKey];
    }

    // Set loading state
    setLoadingDocuments((prev) => ({ ...prev, [docKey]: true }));

    try {
      // First, try to use the original URL directly (in case it's already accessible)
      // If it fails, we'll get a signed URL
      const response = await fetch(`/api/admin/vendors/documents?url=${encodeURIComponent(originalUrl)}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        // If API fails, try the original URL as fallback
        console.warn('Failed to get signed URL, trying original URL');
        setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
        return originalUrl;
      }

      const data = await response.json();
      
      // Cache the signed URL
      setDocumentUrls((prev) => ({ ...prev, [docKey]: data.url }));
      
      return data.url;
    } catch (error: any) {
      console.error('Error fetching document URL:', error);
      // Fallback to original URL
      setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      return originalUrl;
    } finally {
      setLoadingDocuments((prev => ({ ...prev, [docKey]: false })));
    }
  };

  // Handle document view click
  const handleViewDocument = async (originalUrl: string, docKey: string) => {
    const signedUrl = await getDocumentUrl(originalUrl, docKey);
    if (signedUrl) {
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error('Unable to open document');
    }
  };

  // Vendor actions
  const handleVendorAction = async (
    vendorId: string,
    action: "approve" | "reject" | "suspend" | "reinstated" | "enable"
  ) => {
    // Set loading state for this specific vendor action
    setVendorActionLoading(vendorId);
    try {
      if (action === "reinstated") {
        // Reinstated means changing from suspended back to approved
        await updateVendor(vendorId, "approve");
        toast.success("Vendor reinstated successfully");
      } else if (action === "enable") {
        // Enable means changing from rejected back to pending
        await updateVendor(vendorId, "update", { status: "pending" });
        toast.success("Vendor enabled and set to pending status");
      } else {
        await updateVendor(vendorId, action);
        toast.success(`Vendor ${action}d successfully`);
      }
      
      // Reload vendors
      const data = await fetchVendors(
        vendorsPage,
        10,
        vendorsStatusFilter || undefined
      );
      setVendors(data.vendors || []);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
      
      // Close modal if open
      setVendorDetailsModal(null);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} vendor`);
    } finally {
      // Always clear loading state, even on error
      setVendorActionLoading(null);
    }
  };

  // Product actions
  const handleProductAction = async (
    productId: string,
    action: "approve" | "reject" | "feature" | "unfeature" | "disable"
  ) => {
    try {
      if (action === "disable") {
        // Disable means setting status to inactive
        await updateProduct(productId, "update", { status: "inactive" });
        toast.success("Product disabled successfully");
      } else {
        await updateProduct(productId, action);
        toast.success(`Product ${action}d successfully`);
      }
      
      // Reload products
      const data = await fetchProducts(
        productsPage,
        10,
        productsStatusFilter || undefined
      );
      setProducts(data.products || []);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} product`);
    }
  };

  const handleCreateProduct = async (productData: any) => {
    try {
      await createProduct(productData);
      toast.success("Product created successfully");
      setProductModalOpen(false);
      setEditingProduct(null);
      setProductImages([]); // Reset images
      
      // Reload products
      const data = await fetchProducts(
        productsPage,
        10,
        productsStatusFilter || undefined
      );
      setProducts(data.products || []);
      setProductsTotal(data.pagination?.total || 0);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      console.error("Create product error:", error);
      toast.error(error.message || "Failed to create product");
    }
  };

  const handleUpdateProduct = async (productId: string, updates: any) => {
    try {
      await updateProduct(productId, "update", updates);
      toast.success("Product updated successfully");
      setProductModalOpen(false);
      setEditingProduct(null);
      setProductImages([]);
      
      // Reload products to show updated category
      const data = await fetchProducts(
        productsPage,
        10,
        productsStatusFilter || undefined
      );
      setProducts(data.products || []);
      setProductsTotal(data.pagination?.total || 0);
      
      // Also update product details modal if it's open for this product
      if (productDetailsModal && productDetailsModal.id === productId) {
        const updatedProduct = data.products?.find((p: Product) => p.id === productId);
        if (updatedProduct) {
          setProductDetailsModal(updatedProduct);
        }
      }
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      console.error("Update product error:", error);
      toast.error(error.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      setDeleteConfirm(null);
      
      // Reload products
      const data = await fetchProducts(
        productsPage,
        10,
        productsStatusFilter || undefined
      );
      setProducts(data.products || []);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    }
  };

  // Order actions
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      await updateOrder(orderId, status);
      toast.success(`Order status updated to ${status}`);
      
      // Reload orders
      const data = await fetchOrders(
        ordersPage,
        10,
        ordersStatusFilter || undefined
      );
      setOrders(data.orders || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status");
    }
  };

  const handleCreateOrder = async (orderData: any) => {
    try {
      await createOrder(orderData);
      toast.success("Order created successfully");
      setOrderModalOpen(false);
      setEditingOrder(null);
      
      // Reload orders
      const data = await fetchOrders(
        ordersPage,
        10,
        ordersStatusFilter || undefined
      );
      setOrders(data.orders || []);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to create order");
    }
  };

  const handleUpdateOrder = async (orderId: string, updates: any) => {
    try {
      await updateOrder(orderId, updates.status, updates);
      toast.success("Order updated successfully");
      setOrderModalOpen(false);
      setEditingOrder(null);
      
      // Reload orders
      const data = await fetchOrders(
        ordersPage,
        10,
        ordersStatusFilter || undefined
      );
      setOrders(data.orders || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      toast.success("Order deleted successfully");
      setDeleteConfirm(null);
      
      // Reload orders
      const data = await fetchOrders(
        ordersPage,
        10,
        ordersStatusFilter || undefined
      );
      setOrders(data.orders || []);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete order");
    }
  };

  const handleCreateUser = async (userData: any) => {
    try {
      await createUser(userData);
      toast.success("User created successfully");
      setUserModalOpen(false);
      setEditingUser(null);
      
      // Reload users
      const data = await fetchUsers(
        usersPage,
        10,
        usersRoleFilter || undefined
      );
      setAdminUsers(data.users || []);
      setUsersTotal(data.pagination?.total || 0);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    try {
      // Find the user to check if it's the protected admin user
      const user = adminUsers.find((u) => u.id === userId);
      if (user && user.email === "kanyiji.dev+admin@gmail.com") {
        toast.error("Cannot modify the admin user's role or status");
        return;
      }

      await updateUser(userId, "update", updates);
      toast.success("User updated successfully");
      setUserModalOpen(false);
      setEditingUser(null);
      
      // Reload users
      const data = await fetchUsers(
        usersPage,
        10,
        usersRoleFilter || undefined
      );
      setAdminUsers(data.users || []);
      setUsersTotal(data.pagination?.total || 0);
      
      // Update user details modal if it's open
      if (userDetailsModal && userDetailsModal.id === userId) {
        const updatedUser = data.users?.find((u: User) => u.id === userId);
        if (updatedUser) {
          setUserDetailsModal(updatedUser);
        }
      }
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const user = adminUsers.find((u) => u.id === userId);
      if (user && user.email === "kanyiji.dev+admin@gmail.com") {
        toast.error("Cannot suspend the admin user");
        return;
      }

      await updateUser(userId, "suspend");
      toast.success("User suspended successfully");
      
      // Reload users
      const data = await fetchUsers(
        usersPage,
        10,
        usersRoleFilter || undefined
      );
      setAdminUsers(data.users || []);
      setUsersTotal(data.pagination?.total || 0);
      
      // Update user details modal if it's open
      if (userDetailsModal && userDetailsModal.id === userId) {
        const updatedUser = data.users?.find((u: User) => u.id === userId);
        if (updatedUser) {
          setUserDetailsModal(updatedUser);
        }
      }
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to suspend user");
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      const user = adminUsers.find((u) => u.id === userId);
      if (user && user.email === "kanyiji.dev+admin@gmail.com") {
        toast.error("Cannot modify the admin user's status");
        return;
      }

      await updateUser(userId, "activate");
      toast.success("User activated successfully");
      
      // Reload users
      const data = await fetchUsers(
        usersPage,
        10,
        usersRoleFilter || undefined
      );
      setAdminUsers(data.users || []);
      setUsersTotal(data.pagination?.total || 0);
      
      // Update user details modal if it's open
      if (userDetailsModal && userDetailsModal.id === userId) {
        const updatedUser = data.users?.find((u: User) => u.id === userId);
        if (updatedUser) {
          setUserDetailsModal(updatedUser);
        }
      }
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to activate user");
    }
  };

  // Load users when notification modal opens
  useEffect(() => {
    const loadUsersForNotification = async () => {
      if (createNotificationModal && notificationUsers.length === 0) {
        try {
          setNotificationUsersLoading(true);
          // Fetch all users (using a high limit to get all users)
          const data = await fetchUsers(1, 1000);
          setNotificationUsers(data.users || []);
        } catch (error: any) {
          console.error("Error loading users for notification:", error);
          toast.error("Failed to load users");
        } finally {
          setNotificationUsersLoading(false);
        }
      }
    };

    loadUsersForNotification();
  }, [createNotificationModal]);

  const handleCreateNotification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setCreateNotificationLoading(true);
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const message = formData.get("message") as string;
      const type = formData.get("type") as string;
      const recipientType = formData.get("recipient_type") as string;
      const userId = formData.get("user_id") as string;

      if (!title || !message) {
        toast.error("Title and message are required");
        return;
      }

      if (recipientType === "user" && !userId) {
        toast.error("Please select a user");
        return;
      }

      const response = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "create",
          title,
          message,
          type: type || "system",
          recipient_type: recipientType || (userId ? "user" : "all"),
          user_id: userId || null,
        }),
      });

      if (response.ok) {
        toast.success("Notification created successfully");
        setCreateNotificationModal(false);
        // Reset form
        (e.currentTarget as HTMLFormElement).reset();
        // Reset user selection container visibility
        const userIdContainer = document.getElementById("user_id_container");
        if (userIdContainer) {
          userIdContainer.classList.add("hidden");
        }
        // Reload notifications
        const unreadOnly = notificationsFilter === "unread";
        const response2 = await fetch(
          `/api/admin/notifications?page=${notificationsPage}&limit=20&unread_only=${unreadOnly}`,
          {
            credentials: "include",
          }
        );
        if (response2.ok) {
          const data = await response2.json();
          setNotifications(data.notifications || []);
          setNotificationsTotal(data.pagination?.total || 0);
          setUnreadCount(data.unreadCount || 0);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create notification");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create notification");
    } finally {
      setCreateNotificationLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast.success("User deleted successfully");
      setDeleteConfirm(null);
      
      // Reload users
      const data = await fetchUsers(
        usersPage,
        10,
        usersRoleFilter || undefined
      );
      setAdminUsers(data.users || []);
      setUsersTotal(data.pagination?.total || 0);
      
      // Reload stats
      const stats = await fetchAdminStats();
      setAdminStats(stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "verified":
      case "active":
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "suspended":
      case "inactive":
      case "archived":
        return "bg-gray-100 text-gray-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₦${numAmount.toLocaleString("en-NG")}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12 sm:py-16">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-5 flex items-start space-x-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm sm:text-base text-red-700">{message}</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4 sm:space-y-6">
            {statsLoading ? (
              <LoadingSpinner />
            ) : statsError ? (
              <ErrorMessage message={statsError} />
            ) : adminStats ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-blue-100 text-xs sm:text-sm font-medium">
                          Total Revenue
                        </p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                          {formatCurrency(adminStats.totalRevenue)}
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-blue-400 rounded-lg flex-shrink-0">
                        <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      window.location.href = "/admin?tab=users";
                    }}
                    className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer text-left w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-green-100 text-xs sm:text-sm font-medium">
                          Total Users
                        </p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                          {adminStats.totalUsers.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-green-400 rounded-lg flex-shrink-0">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      window.location.href = "/admin?tab=orders";
                    }}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer text-left w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-purple-100 text-xs sm:text-sm font-medium">
                          Total Orders
                        </p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                          {adminStats.totalOrders}
                        </p>
                        <p className="text-purple-200 text-xs sm:text-sm mt-1">
                          {adminStats.pendingOrders} pending
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-purple-400 rounded-lg flex-shrink-0">
                        <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      window.location.href = "/admin?tab=vendors";
                    }}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 sm:p-6 text-white hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer text-left w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-orange-100 text-xs sm:text-sm font-medium">
                          Total Vendors
                        </p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">
                          {adminStats.totalVendors}
                        </p>
                        <p className="text-orange-200 text-xs sm:text-sm mt-1">
                          {adminStats.pendingVendors} pending
                        </p>
                      </div>
                      <div className="p-2 sm:p-3 bg-orange-400 rounded-lg flex-shrink-0">
                        <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                  </button>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Total Products
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-900">
                          {adminStats.totalProducts}
                        </p>
                        <p className="text-xs text-gray-500">
                          {adminStats.pendingProducts} pending review
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Pending Vendors
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                          {adminStats.pendingVendors}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-red-100 rounded-lg flex-shrink-0">
                        <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      </div>
                      <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-600">
                          Pending Orders
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600">
                          {adminStats.pendingOrders}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === "vendors" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Vendor Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Review, approve, suspend, and reinstate marketplace vendors
              </p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <select
                value={vendorsStatusFilter}
                onChange={(e) => {
                  setVendorsStatusFilter(e.target.value);
                  setVendorsPage(1);
                }}
                className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            {vendorsLoading ? (
              <LoadingSpinner />
            ) : vendorsError ? (
              <ErrorMessage message={vendorsError} />
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {vendors.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                      <p className="text-sm">No vendors found</p>
                    </div>
                  ) : (
                    vendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900">
                              {vendor.business_name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {vendor.profiles?.full_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 break-all">
                              {vendor.profiles?.email || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              vendor.status
                            )}`}
                          >
                            {vendor.status}
                          </span>
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              vendor.verification_status
                            )}`}
                          >
                            {vendor.verification_status}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">{vendor.productsCount || 0}</span> products
                            <span className="hidden sm:inline"> • </span>
                            <span className="block sm:inline mt-1 sm:mt-0">{formatDate(vendor.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                              <Eye className="w-5 h-5" />
                            </button>
                            {vendor.status === "pending" && (
                              <>
                                <button
                                  className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                  onClick={() => setVendorDetailsModal(vendor)}
                                  title="View Details & Approve"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {vendor.status === "approved" && (
                              <button
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                onClick={() =>
                                  handleVendorAction(vendor.id, "suspend")
                                }
                                title="Suspend"
                              >
                                <Ban className="w-5 h-5" />
                              </button>
                            )}
                            {vendor.status === "suspended" && (
                              <button
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                onClick={() =>
                                  handleVendorAction(vendor.id, "reinstated")
                                }
                                title="Reinstate"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                            {vendor.status === "rejected" && (
                              <button
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() =>
                                  handleVendorAction(vendor.id, "enable")
                                }
                                title="Enable (Set to Pending)"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Owner
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Email
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          KYC Status
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Products
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                          Join Date
                        </th>
                        <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vendors.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-4 lg:px-6 py-4 text-center text-gray-500"
                          >
                            No vendors found
                          </td>
                        </tr>
                      ) : (
                        vendors.map((vendor) => (
                          <tr key={vendor.id} className="hover:bg-gray-50">
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {vendor.business_name}
                              </div>
                              <div className="text-xs text-gray-500 lg:hidden mt-1">
                                {vendor.profiles?.email || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vendor.profiles?.full_name || "N/A"}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                              {vendor.profiles?.email || "N/A"}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                    vendor.status
                                  )}`}
                                >
                                  {vendor.status}
                                </span>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full lg:hidden ${getStatusColor(
                                    vendor.verification_status
                                  )}`}
                                >
                                  {vendor.verification_status}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  vendor.verification_status
                                )}`}
                              >
                                {vendor.verification_status}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {vendor.productsCount || 0}
                              <div className="text-xs text-gray-500 xl:hidden mt-1">
                                {formatDate(vendor.created_at)}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden xl:table-cell">
                              {formatDate(vendor.created_at)}
                            </td>
                            <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-1 lg:space-x-2">
                                <button
                                  className="text-primary-600 hover:text-primary-900 p-1"
                                  onClick={() => setVendorDetailsModal(vendor)}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {vendor.status === "pending" && (
                                  <button
                                    className="text-primary-600 hover:text-primary-900 p-1"
                                    onClick={() => setVendorDetailsModal(vendor)}
                                    title="View Details & Approve"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                {vendor.status === "approved" && (
                                  <button
                                    className="text-yellow-600 hover:text-yellow-900 p-1"
                                    onClick={() =>
                                      handleVendorAction(vendor.id, "suspend")
                                    }
                                    title="Suspend"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                                {vendor.status === "suspended" && (
                                  <button
                                    className="text-green-600 hover:text-green-900 p-1"
                                    onClick={() =>
                                      handleVendorAction(vendor.id, "reinstated")
                                    }
                                    title="Reinstate"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {vendor.status === "rejected" && (
                                  <button
                                    className="text-blue-600 hover:text-blue-900 p-1"
                                    onClick={() =>
                                      handleVendorAction(vendor.id, "enable")
                                    }
                                    title="Enable (Set to Pending)"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {vendorsTotal > 10 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Showing {(vendorsPage - 1) * 10 + 1} to{" "}
                      {Math.min(vendorsPage * 10, vendorsTotal)} of{" "}
                      {vendorsTotal} vendors
                    </p>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => setVendorsPage((p) => Math.max(1, p - 1))}
                        disabled={vendorsPage === 1}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setVendorsPage((p) =>
                            p < Math.ceil(vendorsTotal / 10) ? p + 1 : p
                          )
                        }
                        disabled={vendorsPage >= Math.ceil(vendorsTotal / 10)}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Product Management
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Create, view, approve, and disable marketplace products
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Product
              </button>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <select
                value={productsStatusFilter}
                onChange={(e) => {
                  setProductsStatusFilter(e.target.value);
                  setProductsPage(1);
                }}
                className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {productsLoading ? (
              <LoadingSpinner />
            ) : productsError ? (
              <ErrorMessage message={productsError} />
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {products.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                      <p className="text-sm">No products found</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {product.vendors?.business_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {product.category_id 
                                ? getCategoryById(product.category_id)?.name || "N/A"
                                : product.categories?.name || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          <div className="flex-1">
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(product.price)}
                            </p>
                            <span
                              className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(
                                product.status
                              )}`}
                            >
                              {product.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 flex-wrap">
                            <button
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              onClick={() => setProductDetailsModal(product)}
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              onClick={() => {
                                setEditingProduct(product);
                                setProductModalOpen(true);
                              }}
                              title="Edit"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() =>
                                setDeleteConfirm({
                                  type: "product",
                                  id: product.id,
                                  name: product.name,
                                })
                              }
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            {(product.status === "draft" || product.status === "inactive") && (
                              <button
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                onClick={() =>
                                  handleProductAction(product.id, "approve")
                                }
                                title="Approve"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                            )}
                            {product.status === "active" && (
                              <button
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                onClick={() =>
                                  handleProductAction(product.id, "disable")
                                }
                                title="Disable"
                              >
                                <Ban className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
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
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No products found
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.vendors?.business_name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {product.category_id 
                                ? getCategoryById(product.category_id)?.name || "N/A"
                                : product.categories?.name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(product.price)}
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
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  className="text-primary-600 hover:text-primary-900"
                                  onClick={() => setProductDetailsModal(product)}
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-blue-600 hover:text-blue-900"
                                  onClick={() => {
                                    setEditingProduct(product);
                                    setProductModalOpen(true);
                                  }}
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: "product",
                                      id: product.id,
                                      name: product.name,
                                    })
                                  }
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                {(product.status === "draft" || product.status === "inactive") && (
                                  <button
                                    className="text-green-600 hover:text-green-900"
                                    onClick={() =>
                                      handleProductAction(product.id, "approve")
                                    }
                                    title="Approve"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                {product.status === "active" && (
                                  <button
                                    className="text-yellow-600 hover:text-yellow-900"
                                    onClick={() =>
                                      handleProductAction(product.id, "disable")
                                    }
                                    title="Disable"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {productsTotal > 10 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Showing {(productsPage - 1) * 10 + 1} to{" "}
                      {Math.min(productsPage * 10, productsTotal)} of{" "}
                      {productsTotal} products
                    </p>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() =>
                          setProductsPage((p) => Math.max(1, p - 1))
                        }
                        disabled={productsPage === 1}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setProductsPage((p) =>
                            p < Math.ceil(productsTotal / 10) ? p + 1 : p
                          )
                        }
                        disabled={productsPage >= Math.ceil(productsTotal / 10)}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Order Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage marketplace orders
              </p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <select
                value={ordersStatusFilter}
                onChange={(e) => {
                  setOrdersStatusFilter(e.target.value);
                  setOrdersPage(1);
                }}
                className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {ordersLoading ? (
              <LoadingSpinner />
            ) : ordersError ? (
              <ErrorMessage message={ordersError} />
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                      <p className="text-sm">No orders found</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 font-mono">
                              {order.id.slice(0, 8)}...
                            </p>
                            <h3 className="text-base font-semibold text-gray-900 mt-1">
                              {order.customer?.full_name || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {order.vendor?.business_name || "N/A"}
                            </p>
                          </div>
                          <span
                            className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          <div>
                            <p className="text-lg font-bold text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => setOrderDetailsModal(order)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                              className="flex-1 sm:flex-none px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
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
                      {orders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No orders found
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order.id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.customer?.full_name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {order.vendor?.business_name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(order.total_amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(order.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setOrderDetailsModal(order)}
                                  className="text-primary-600 hover:text-primary-900 transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <select
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="processing">Processing</option>
                                  <option value="shipped">Shipped</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {ordersTotal > 10 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Showing {(ordersPage - 1) * 10 + 1} to{" "}
                      {Math.min(ordersPage * 10, ordersTotal)} of{" "}
                      {ordersTotal} orders
                    </p>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                        disabled={ordersPage === 1}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setOrdersPage((p) =>
                            p < Math.ceil(ordersTotal / 10) ? p + 1 : p
                          )
                        }
                        disabled={ordersPage >= Math.ceil(ordersTotal / 10)}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === "kyc" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                KYC Verification Queue
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                KYC verification is managed through the Vendors tab. Use the
                filter to view pending KYC verifications.
              </p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                Analytics Overview
              </h3>
              {adminStats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                        {formatCurrency(adminStats.totalRevenue)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-2">Total Revenue</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="text-2xl sm:text-3xl font-bold text-green-600">
                        {adminStats.totalUsers}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-2">Total Users</div>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                      <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                        {adminStats.totalOrders}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-2">Total Orders</div>
                    </div>
                  </div>
              ) : (
                <LoadingSpinner />
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                User Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage platform users
              </p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <select
                value={usersRoleFilter}
                onChange={(e) => {
                  setUsersRoleFilter(e.target.value);
                  setUsersPage(1);
                }}
                className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="vendor">Vendor</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            {usersLoading ? (
              <LoadingSpinner />
            ) : usersError ? (
              <ErrorMessage message={usersError} />
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {adminUsers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                      <p className="text-sm">No users found</p>
                    </div>
                  ) : (
                    adminUsers.map((user) => (
                      <div
                        key={user.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900">
                              {user.full_name || "N/A"}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 break-all">
                              {user.email}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <span
                              className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                            <span
                              className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                user.is_active === true || user.is_active === undefined || user.is_active === null ? "active" : "inactive"
                              )}`}
                            >
                              {user.is_active === true || user.is_active === undefined || user.is_active === null ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              Joined {formatDate(user.created_at)}
                            </p>
                            <button
                              onClick={() => setUserDetailsModal(user)}
                              className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="View details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                              disabled={user.email === "kanyiji.dev+admin@gmail.com"}
                              className={`flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                                user.email === "kanyiji.dev+admin@gmail.com" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                              }`}
                              onClick={(e) => e.stopPropagation()}
                              title={user.email === "kanyiji.dev+admin@gmail.com" ? "Admin user cannot be modified" : ""}
                            >
                              <option value="customer">Customer</option>
                              <option value="vendor">Vendor</option>
                              <option value="admin">Admin</option>
                            </select>
                            <select
                              value={user.is_active === true || user.is_active === undefined || user.is_active === null ? "active" : "inactive"}
                              onChange={(e) => handleUpdateUser(user.id, { is_active: e.target.value === "active" })}
                              disabled={user.email === "kanyiji.dev+admin@gmail.com"}
                              className={`flex-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                                user.email === "kanyiji.dev+admin@gmail.com" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                              }`}
                              onClick={(e) => e.stopPropagation()}
                              title={user.email === "kanyiji.dev+admin@gmail.com" ? "Admin user cannot be modified" : ""}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                          </div>
                          {user.email !== "kanyiji.dev+admin@gmail.com" && (
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                              {user.is_active === true || user.is_active === undefined || user.is_active === null ? (
                                <button
                                  onClick={() => handleSuspendUser(user.id)}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                                >
                                  <Ban className="w-3 h-3 inline mr-1" />
                                  Suspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleActivateUser(user.id)}
                                  className="flex-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                  <Check className="w-3 h-3 inline mr-1" />
                                  Activate
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                      {adminUsers.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-gray-500"
                          >
                            No users found
                          </td>
                        </tr>
                      ) : (
                        adminUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {user.full_name || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.role}
                                onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                                disabled={user.email === "kanyiji.dev+admin@gmail.com"}
                                className={`px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                                  user.email === "kanyiji.dev+admin@gmail.com" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                                }`}
                                onClick={(e) => e.stopPropagation()}
                                title={user.email === "kanyiji.dev+admin@gmail.com" ? "Admin user cannot be modified" : ""}
                              >
                                <option value="customer">Customer</option>
                                <option value="vendor">Vendor</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.is_active === true || user.is_active === undefined || user.is_active === null ? "active" : "inactive"}
                                onChange={(e) => handleUpdateUser(user.id, { is_active: e.target.value === "active" })}
                                disabled={user.email === "kanyiji.dev+admin@gmail.com"}
                                className={`px-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                                  user.email === "kanyiji.dev+admin@gmail.com" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                                }`}
                                onClick={(e) => e.stopPropagation()}
                                title={user.email === "kanyiji.dev+admin@gmail.com" ? "Admin user cannot be modified" : ""}
                              >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(user.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setUserDetailsModal(user)}
                                  className="text-primary-600 hover:text-primary-900 transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {user.email !== "kanyiji.dev+admin@gmail.com" && (
                                  <>
                                    {user.is_active === true || user.is_active === undefined || user.is_active === null ? (
                                      <button
                                        onClick={() => handleSuspendUser(user.id)}
                                        className="text-yellow-600 hover:text-yellow-900 transition-colors"
                                        title="Suspend user"
                                      >
                                        <Ban className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleActivateUser(user.id)}
                                        className="text-green-600 hover:text-green-900 transition-colors"
                                        title="Activate user"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersTotal > 10 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Showing {(usersPage - 1) * 10 + 1} to{" "}
                      {Math.min(usersPage * 10, usersTotal)} of {usersTotal}{" "}
                      users
                    </p>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                        disabled={usersPage === 1}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setUsersPage((p) =>
                            p < Math.ceil(usersTotal / 10) ? p + 1 : p
                          )
                        }
                        disabled={usersPage >= Math.ceil(usersTotal / 10)}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Notifications
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                View and manage system notifications
              </p>
            </div>

            {/* Filter and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <select
                  value={notificationsFilter}
                  onChange={(e) => {
                    setNotificationsFilter(e.target.value);
                    setNotificationsPage(1);
                  }}
                  className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Notifications</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreateNotificationModal(true)}
                    className="text-sm text-white bg-blue-600 hover:bg-blue-700 font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Notification
                  </button>
                  {unreadCount > 0 && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch("/api/admin/notifications", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ action: "mark_all_read" }),
                          });
                          if (response.ok) {
                            toast.success("All notifications marked as read");
                            setUnreadCount(0);
                            setNotifications((prev) =>
                              prev.map((n) => ({ ...n, is_read: true }))
                            );
                          }
                        } catch (error: any) {
                          toast.error(error.message || "Failed to mark all as read");
                        }
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      Mark All as Read
                    </button>
                  )}
                </div>
              </div>
            </div>

            {notificationsLoading ? (
              <LoadingSpinner />
            ) : notificationsError ? (
              <ErrorMessage message={notificationsError} />
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {notifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No notifications found</p>
                    </div>
                  ) : (
                    notifications.map((notification: any) => (
                      <div
                        key={notification.id}
                        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3 ${
                          !notification.is_read ? "bg-blue-50/50 border-blue-200" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                              )}
                              <h3 className={`text-base font-semibold ${!notification.is_read ? "text-gray-900" : "text-gray-700"}`}>
                                {notification.title || "Notification"}
                              </h3>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message || "No message"}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch("/api/admin/notifications", {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  credentials: "include",
                                  body: JSON.stringify({
                                    notificationId: notification.id,
                                    is_read: true,
                                  }),
                                });
                                if (response.ok) {
                                  setNotifications((prev) =>
                                    prev.map((n: any) =>
                                      n.id === notification.id ? { ...n, is_read: true } : n
                                    )
                                  );
                                  setUnreadCount((prev) => Math.max(0, prev - 1));
                                  toast.success("Marked as read");
                                }
                              } catch (error: any) {
                                toast.error("Failed to mark as read");
                              }
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
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
                      {notifications.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>No notifications found</p>
                          </td>
                        </tr>
                      ) : (
                        notifications.map((notification: any) => (
                          <tr
                            key={notification.id}
                            className={!notification.is_read ? "bg-blue-50/50" : ""}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              {!notification.is_read ? (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                  Unread
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                  Read
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {notification.title || "Notification"}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                              {notification.message || "No message"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                                {notification.type || "system"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(notification.created_at).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {!notification.is_read && (
                                <button
                                  onClick={async () => {
                                    try {
                                      const response = await fetch("/api/admin/notifications", {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        credentials: "include",
                                        body: JSON.stringify({
                                          notificationId: notification.id,
                                          is_read: true,
                                        }),
                                      });
                                      if (response.ok) {
                                        setNotifications((prev) =>
                                          prev.map((n: any) =>
                                            n.id === notification.id ? { ...n, is_read: true } : n
                                          )
                                        );
                                        setUnreadCount((prev) => Math.max(0, prev - 1));
                                        toast.success("Marked as read");
                                      }
                                    } catch (error: any) {
                                      toast.error("Failed to mark as read");
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-900 transition-colors text-xs font-medium"
                                >
                                  Mark Read
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {notificationsTotal > 20 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                      Showing {(notificationsPage - 1) * 20 + 1} to{" "}
                      {Math.min(notificationsPage * 20, notificationsTotal)} of{" "}
                      {notificationsTotal} notifications
                    </p>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => setNotificationsPage((p) => Math.max(1, p - 1))}
                        disabled={notificationsPage === 1}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setNotificationsPage((p) =>
                            p < Math.ceil(notificationsTotal / 20) ? p + 1 : p
                          )
                        }
                        disabled={notificationsPage >= Math.ceil(notificationsTotal / 20)}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === "payouts" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Payout Management
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Review and process vendor payout requests
              </p>
            </div>

            {/* Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <select
                value={payoutsStatusFilter}
                onChange={(e) => {
                  setPayoutsStatusFilter(e.target.value);
                  setPayoutsPage(1);
                }}
                className="w-full sm:w-auto min-w-[200px] px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {payoutsLoading ? (
              <LoadingSpinner />
            ) : payoutsError ? (
              <ErrorMessage message={payoutsError} />
            ) : (
              <>
                {/* Payouts Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reference
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendor
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                            Method
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                            Date
                          </th>
                          <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {payouts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-4 lg:px-6 py-12 text-center text-gray-500">
                              No payouts found
                            </td>
                          </tr>
                        ) : (
                          payouts.map((payout: any) => (
                            <tr key={payout.id} className="hover:bg-gray-50">
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                {payout.reference}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {payout.vendors?.business_name || "N/A"}
                                </div>
                                {payout.vendors?.profiles?.email && (
                                  <div className="text-xs text-gray-500">
                                    {payout.vendors.profiles.email}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {formatCurrency(payout.amount)}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    payout.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : payout.status === "processing"
                                      ? "bg-blue-100 text-blue-800"
                                      : payout.status === "failed"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize hidden lg:table-cell">
                                {payout.payment_method?.replace("_", " ") || "N/A"}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden xl:table-cell">
                                {formatDate(payout.created_at)}
                              </td>
                              <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {payout.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => setPayoutActionModal({ payout, action: "processing" })}
                                        disabled={processingPayout === payout.id}
                                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                        title="Mark as Processing"
                                      >
                                        <Clock className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setPayoutActionModal({ payout, action: "completed" })}
                                        disabled={processingPayout === payout.id}
                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                        title="Mark as Completed"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setPayoutActionModal({ payout, action: "failed" })}
                                        disabled={processingPayout === payout.id}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        title="Mark as Failed"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  {payout.status === "processing" && (
                                    <>
                                      <button
                                        onClick={() => setPayoutActionModal({ payout, action: "completed" })}
                                        disabled={processingPayout === payout.id}
                                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                        title="Mark as Completed"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => setPayoutActionModal({ payout, action: "failed" })}
                                        disabled={processingPayout === payout.id}
                                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                        title="Mark as Failed"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => {
                                      // Show payout details modal
                                      setPayoutActionModal({ payout, action: "view" });
                                    }}
                                    className="text-gray-600 hover:text-gray-900"
                                    title="View Details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {payoutsTotal > 20 && (
                    <div className="bg-gray-50 px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200">
                      <div className="text-sm text-gray-700 mb-2 sm:mb-0">
                        Showing {((payoutsPage - 1) * 20) + 1} to {Math.min(payoutsPage * 20, payoutsTotal)} of {payoutsTotal} payouts
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setPayoutsPage((p) => Math.max(1, p - 1))}
                          disabled={payoutsPage === 1}
                          className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setPayoutsPage((p) => p + 1)}
                          disabled={payoutsPage >= Math.ceil(payoutsTotal / 20)}
                          className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Payout Action Modal */}
            {payoutActionModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {payoutActionModal.action === "view"
                        ? "Payout Details"
                        : payoutActionModal.action === "completed"
                        ? "Complete Payout"
                        : payoutActionModal.action === "failed"
                        ? "Mark as Failed"
                        : "Process Payout"}
                    </h3>
                    <button
                      onClick={() => {
                        setPayoutActionModal(null);
                        setPayoutFailureReason("");
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {payoutActionModal.action === "view" ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                        <p className="text-sm text-gray-900 font-mono">{payoutActionModal.payout.reference}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <p className="text-sm text-gray-900">
                          {payoutActionModal.payout.vendors?.business_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <p className="text-sm text-gray-900 font-semibold">
                          {formatCurrency(payoutActionModal.payout.amount)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payoutActionModal.payout.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : payoutActionModal.payout.status === "processing"
                              ? "bg-blue-100 text-blue-800"
                              : payoutActionModal.payout.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payoutActionModal.payout.status.charAt(0).toUpperCase() +
                            payoutActionModal.payout.status.slice(1)}
                        </span>
                      </div>
                      {payoutActionModal.payout.payment_details &&
                        typeof payoutActionModal.payout.payment_details === "object" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Payment Details
                            </label>
                            <div className="bg-gray-50 rounded-lg p-3 text-sm">
                              {Object.entries(payoutActionModal.payout.payment_details).map(([key, value]) => (
                                <div key={key} className="flex justify-between mb-1">
                                  <span className="text-gray-600 capitalize">{key.replace(/_/g, " ")}:</span>
                                  <span className="text-gray-900 font-medium">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      {payoutActionModal.payout.failure_reason && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Failure Reason</label>
                          <p className="text-sm text-red-600">{payoutActionModal.payout.failure_reason}</p>
                        </div>
                      )}
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => {
                            setPayoutActionModal(null);
                            setPayoutFailureReason("");
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        await handleProcessPayout(
                          payoutActionModal.payout.id,
                          payoutActionModal.action === "processing"
                            ? "processing"
                            : payoutActionModal.action === "completed"
                            ? "completed"
                            : "failed",
                          payoutActionModal.action === "failed" ? payoutFailureReason : undefined
                        );
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <p className="text-sm text-gray-600 mb-4">
                          {payoutActionModal.action === "completed"
                            ? "Are you sure you want to mark this payout as completed? This will update the vendor's earnings."
                            : payoutActionModal.action === "failed"
                            ? "Please provide a reason for marking this payout as failed."
                            : "Are you sure you want to mark this payout as processing?"}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <div className="text-sm">
                            <span className="text-gray-600">Amount: </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(payoutActionModal.payout.amount)}
                            </span>
                          </div>
                          <div className="text-sm mt-1">
                            <span className="text-gray-600">Vendor: </span>
                            <span className="font-semibold text-gray-900">
                              {payoutActionModal.payout.vendors?.business_name || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {payoutActionModal.action === "failed" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Failure Reason *
                          </label>
                          <textarea
                            required
                            value={payoutFailureReason}
                            onChange={(e) => setPayoutFailureReason(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Enter reason for failure..."
                          />
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          disabled={processingPayout === payoutActionModal.payout.id}
                          className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {processingPayout === payoutActionModal.payout.id ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Processing...
                            </span>
                          ) : (
                            "Confirm"
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPayoutActionModal(null);
                            setPayoutFailureReason("");
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
                Platform Settings
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Platform configuration options coming soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {productDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
              <button
                onClick={() => setProductDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Product Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Product Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Product Name</label>
                    <p className="text-sm text-gray-900 mt-1">{productDetailsModal.name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Price</label>
                    <p className="text-sm text-gray-900 mt-1">{formatCurrency(productDetailsModal.price)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(productDetailsModal.status)}`}>
                        {productDetailsModal.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Vendor</label>
                    <p className="text-sm text-gray-900 mt-1">{productDetailsModal.vendors?.business_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Category</label>
                    <p className="text-sm text-gray-900 mt-1">
                      {productDetailsModal.category_id
                        ? getCategoryById(productDetailsModal.category_id)?.name || "N/A"
                        : productDetailsModal.categories?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Created At</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(productDetailsModal.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setProductDetailsModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {(productDetailsModal.status === "draft" || productDetailsModal.status === "inactive") && (
                  <button
                    onClick={() => {
                      handleProductAction(productDetailsModal.id, "approve");
                      setProductDetailsModal(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                )}
                {productDetailsModal.status === "active" && (
                  <button
                    onClick={() => {
                      handleProductAction(productDetailsModal.id, "disable");
                      setProductDetailsModal(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    Disable
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Create/Edit Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingProduct ? "Edit Product" : "Create Product"}
              </h3>
              <button
                onClick={() => {
                  setProductModalOpen(false);
                  setEditingProduct(null);
                  setProductImages([]);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData(e.target as HTMLFormElement);
                  const categoryId = formData.get("category_id") as string;
                  const vendorId = formData.get("vendor_id") as string;
                  
                  if (!editingProduct && !vendorId) {
                    toast.error("Please select a vendor");
                    return;
                  }

                  const productData = {
                    vendor_id: editingProduct 
                      ? (editingProduct as any).vendor_id || (editingProduct as any).vendors?.id || vendorId
                      : vendorId,
                    category_id: categoryId && categoryId !== "" ? categoryId : null,
                    name: formData.get("name") as string,
                    description: formData.get("description") as string || "",
                    short_description: formData.get("short_description") as string || "",
                    price: formData.get("price") as string,
                    original_price: formData.get("original_price") as string || null,
                    sku: formData.get("sku") as string || null,
                    stock_quantity: parseInt(formData.get("stock_quantity") as string || "0"),
                    weight: formData.get("weight") as string || null,
                    status: formData.get("status") as string || "draft",
                    images: productImages.length > 0 ? productImages : null,
                  };

                  if (editingProduct) {
                    await handleUpdateProduct(editingProduct.id, productData);
                  } else {
                    await handleCreateProduct(productData);
                  }
                } catch (error: any) {
                  toast.error(error.message || "Failed to save product");
                }
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingProduct?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={(editingProduct as any)?.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    step="0.01"
                    min="0"
                    defaultValue={editingProduct?.price || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingProduct?.status || "draft"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vendor <span className="text-red-500">*</span>
                </label>
                {editingProduct ? (
                  <input
                    type="hidden"
                    name="vendor_id"
                    value={(editingProduct as any)?.vendor_id || (editingProduct as any)?.vendors?.id || ""}
                  />
                ) : null}
                {editingProduct ? (
                  <input
                    type="text"
                    disabled
                    value={allVendors.find(v => v.id === ((editingProduct as any)?.vendor_id || (editingProduct as any)?.vendors?.id))?.business_name || "Unknown Vendor"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                ) : vendorsLoadingForModal ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                    Loading vendors...
                  </div>
                ) : (
                  <select
                    name="vendor_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a vendor</option>
                    {allVendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.business_name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {editingProduct 
                    ? "Vendor cannot be changed after product creation" 
                    : "Select the vendor who owns this product"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Images
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length === 0) return;

                          const vendorId = editingProduct 
                            ? ((editingProduct as any)?.vendor_id || (editingProduct as any)?.vendors?.id)
                            : (document.querySelector('select[name="vendor_id"]') as HTMLSelectElement)?.value;

                          if (!vendorId) {
                            toast.error("Please select a vendor first");
                            e.target.value = "";
                            return;
                          }

                          if (!vendorId) {
                            toast.error("Vendor ID is required for image upload");
                            e.target.value = "";
                            return;
                          }

                          setUploadingImages(true);
                          try {
                            const uploadPromises = files.map(async (file) => {
                              const uploadFormData = new FormData();
                              uploadFormData.append("file", file);
                              uploadFormData.append("vendorId", vendorId);

                              const response = await fetch("/api/admin/products/upload", {
                                method: "POST",
                                credentials: "include",
                                body: uploadFormData,
                              });

                              if (!response.ok) {
                                const error = await response.json();
                                throw new Error(error.error || "Upload failed");
                              }

                              const data = await response.json();
                              return data.url;
                            });

                            const uploadedUrls = await Promise.all(uploadPromises);
                            setProductImages([...productImages, ...uploadedUrls]);
                            toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
                          } catch (error: any) {
                            toast.error(error.message || "Failed to upload images");
                          } finally {
                            setUploadingImages(false);
                            e.target.value = "";
                          }
                        }}
                        disabled={uploadingImages}
                      />
                      <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors cursor-pointer">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {uploadingImages ? "Uploading..." : "Upload Images"}
                        </span>
                      </div>
                    </label>
                  </div>
                  {productImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {productImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setProductImages(productImages.filter((_, i) => i !== index));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload product images (max 10 images)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description
                </label>
                <textarea
                  name="short_description"
                  rows={2}
                  maxLength={160}
                  defaultValue={(editingProduct as any)?.short_description || ""}
                  placeholder="Brief description (max 160 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Brief summary for product listings</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    defaultValue={(editingProduct as any)?.sku || ""}
                    placeholder="Product SKU (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock_quantity"
                    min="0"
                    defaultValue={(editingProduct as any)?.stock_quantity || 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price (₦)
                  </label>
                  <input
                    type="number"
                    name="original_price"
                    step="0.01"
                    min="0"
                    defaultValue={(editingProduct as any)?.original_price || ""}
                    placeholder="Original price before discount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    step="0.01"
                    min="0"
                    defaultValue={(editingProduct as any)?.weight || ""}
                    placeholder="Product weight"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                {categoriesLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm">
                    Loading categories...
                  </div>
                ) : categories.length === 0 ? (
                  <div className="w-full px-3 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
                    No categories available. Please add categories in the database first.
                  </div>
                ) : (
                  <select
                    name="category_id"
                    defaultValue={
                      editingProduct 
                        ? (editingProduct as any)?.category_id || (editingProduct as any)?.categories?.id || ""
                        : ""
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {categories.length === 0 && !categoriesLoading 
                    ? "No categories found. Run seed-categories.sql in Supabase to add categories."
                    : `Select a category for this product (${categories.length} available)`}
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {userDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setUserDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* User Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">User ID</label>
                    <p className="text-sm text-gray-900 mt-1 font-mono">{userDetailsModal.id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{userDetailsModal.email}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                    <p className="text-sm text-gray-900 mt-1">{userDetailsModal.full_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Role</label>
                    <div className="mt-1">
                      <select
                        value={userDetailsModal.role}
                        onChange={(e) => {
                          handleUpdateUser(userDetailsModal.id, { role: e.target.value });
                          setUserDetailsModal({ ...userDetailsModal, role: e.target.value as any });
                        }}
                        disabled={userDetailsModal.email === "kanyiji.dev+admin@gmail.com"}
                        className={`px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                          userDetailsModal.email === "kanyiji.dev+admin@gmail.com" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                        }`}
                        title={userDetailsModal.email === "kanyiji.dev+admin@gmail.com" ? "Admin user cannot be modified" : ""}
                      >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <div className="mt-1">
                      <select
                        value={userDetailsModal.is_active === true || userDetailsModal.is_active === undefined || userDetailsModal.is_active === null ? "active" : "inactive"}
                        onChange={(e) => {
                          const newStatus = e.target.value === "active";
                          handleUpdateUser(userDetailsModal.id, { is_active: newStatus });
                          setUserDetailsModal({ ...userDetailsModal, is_active: newStatus });
                        }}
                        disabled={userDetailsModal.email === "kanyiji.dev+admin@gmail.com"}
                        className={`px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white ${
                          userDetailsModal.email === "kanyiji.dev+admin@gmail.com" ? "bg-gray-100 cursor-not-allowed opacity-60" : ""
                        }`}
                        title={userDetailsModal.email === "kanyiji.dev+admin@gmail.com" ? "Admin user cannot be modified" : ""}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Join Date</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(userDetailsModal.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setUserDetailsModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {userDetailsModal.email !== "kanyiji.dev+admin@gmail.com" && (
                  <>
                    {userDetailsModal.is_active === true || userDetailsModal.is_active === undefined || userDetailsModal.is_active === null ? (
                      <button
                        onClick={() => {
                          handleSuspendUser(userDetailsModal.id);
                          setUserDetailsModal({ ...userDetailsModal, is_active: false });
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                      >
                        <Ban className="w-4 h-4" />
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          handleActivateUser(userDetailsModal.id);
                          setUserDetailsModal({ ...userDetailsModal, is_active: true });
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDeleteConfirm({ type: "user", id: userDetailsModal.id, name: userDetailsModal.full_name || userDetailsModal.email });
                        setUserDetailsModal(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {orderDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
              <button
                onClick={() => setOrderDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Order Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Order Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Order ID</label>
                    <p className="text-sm text-gray-900 mt-1 font-mono">{orderDetailsModal.id}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(orderDetailsModal.status)}`}>
                        {orderDetailsModal.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Total Amount</label>
                    <p className="text-sm text-gray-900 mt-1 font-semibold">{formatCurrency(orderDetailsModal.total_amount)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Order Date</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(orderDetailsModal.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Customer</label>
                    <p className="text-sm text-gray-900 mt-1">{orderDetailsModal.customer?.full_name || "N/A"}</p>
                    {orderDetailsModal.customer?.email && (
                      <p className="text-xs text-gray-600 mt-1">{orderDetailsModal.customer.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Vendor</label>
                    <p className="text-sm text-gray-900 mt-1">{orderDetailsModal.vendor?.business_name || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setOrderDetailsModal(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                <select
                  value={orderDetailsModal.status}
                  onChange={(e) => {
                    handleOrderStatusUpdate(orderDetailsModal.id, e.target.value);
                    setOrderDetailsModal({ ...orderDetailsModal, status: e.target.value as any });
                  }}
                  className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => {
                    setDeleteConfirm({ type: "order", id: orderDetailsModal.id, name: `Order ${orderDetailsModal.id.slice(0, 8)}` });
                    setOrderDetailsModal(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Details Modal */}
      {vendorDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Vendor Details</h3>
              <button
                onClick={() => {
                  setVendorDetailsModal(null);
                  // Clear document URLs cache when modal closes
                  setDocumentUrls({});
                  setLoadingDocuments({});
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Business Name</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.business_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Business Type</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.business_type || "N/A"}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-500 uppercase">Business Description</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.business_description || "N/A"}</p>
                  </div>
                  {vendorDetailsModal.website_url && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase">Website</label>
                      <p className="text-sm text-gray-900 mt-1">
                        <a 
                          href={
                            vendorDetailsModal.website_url.startsWith('http://') || vendorDetailsModal.website_url.startsWith('https://')
                              ? vendorDetailsModal.website_url
                              : `https://${vendorDetailsModal.website_url}`
                          } 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary-600 hover:underline"
                        >
                          {vendorDetailsModal.website_url}
                        </a>
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(vendorDetailsModal.status)}`}>
                        {vendorDetailsModal.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Verification Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(vendorDetailsModal.verification_status)}`}>
                        {vendorDetailsModal.verification_status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Products Count</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.productsCount || 0} products</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              {(vendorDetailsModal.address || vendorDetailsModal.city || vendorDetailsModal.state) && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Address Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vendorDetailsModal.address && (
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase">Address</label>
                        <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.address}</p>
                      </div>
                    )}
                    {vendorDetailsModal.city && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">City</label>
                        <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.city}</p>
                      </div>
                    )}
                    {vendorDetailsModal.state && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">State</label>
                        <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.state}</p>
                      </div>
                    )}
                    {vendorDetailsModal.postal_code && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Postal Code</label>
                        <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.postal_code}</p>
                      </div>
                    )}
                    {vendorDetailsModal.country && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Country</label>
                        <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.country}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* KYC Documents */}
              {vendorDetailsModal.kyc_documents && vendorDetailsModal.kyc_documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">KYC Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {vendorDetailsModal.kyc_documents[0]?.business_license_url && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Business License</label>
                        <button
                          onClick={() => handleViewDocument(
                            vendorDetailsModal.kyc_documents![0].business_license_url!,
                            `business_license_${vendorDetailsModal.id}`
                          )}
                          disabled={loadingDocuments[`business_license_${vendorDetailsModal.id}`]}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingDocuments[`business_license_${vendorDetailsModal.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          {loadingDocuments[`business_license_${vendorDetailsModal.id}`] ? 'Loading...' : 'View Document'}
                        </button>
                      </div>
                    )}
                    {vendorDetailsModal.kyc_documents[0]?.tax_certificate_url && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Tax Certificate</label>
                        <button
                          onClick={() => handleViewDocument(
                            vendorDetailsModal.kyc_documents![0].tax_certificate_url!,
                            `tax_certificate_${vendorDetailsModal.id}`
                          )}
                          disabled={loadingDocuments[`tax_certificate_${vendorDetailsModal.id}`]}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingDocuments[`tax_certificate_${vendorDetailsModal.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          {loadingDocuments[`tax_certificate_${vendorDetailsModal.id}`] ? 'Loading...' : 'View Document'}
                        </button>
                      </div>
                    )}
                    {vendorDetailsModal.kyc_documents[0]?.bank_statement_url && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Bank Statement</label>
                        <button
                          onClick={() => handleViewDocument(
                            vendorDetailsModal.kyc_documents![0].bank_statement_url!,
                            `bank_statement_${vendorDetailsModal.id}`
                          )}
                          disabled={loadingDocuments[`bank_statement_${vendorDetailsModal.id}`]}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingDocuments[`bank_statement_${vendorDetailsModal.id}`] ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                          {loadingDocuments[`bank_statement_${vendorDetailsModal.id}`] ? 'Loading...' : 'View Document'}
                        </button>
                      </div>
                    )}
                  </div>
                  {(!vendorDetailsModal.kyc_documents[0]?.business_license_url && 
                    !vendorDetailsModal.kyc_documents[0]?.tax_certificate_url && 
                    !vendorDetailsModal.kyc_documents[0]?.bank_statement_url) && (
                    <p className="text-sm text-gray-500 mt-2">No documents uploaded</p>
                  )}
                </div>
              )}

              {/* Owner Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Owner Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.profiles?.full_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Email</label>
                    <p className="text-sm text-gray-900 mt-1">{vendorDetailsModal.profiles?.email || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Registration</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Join Date</label>
                    <p className="text-sm text-gray-900 mt-1">{formatDate(vendorDetailsModal.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setVendorDetailsModal(null);
                    // Clear document URLs cache when modal closes
                    setDocumentUrls({});
                    setLoadingDocuments({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
                {vendorDetailsModal.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleVendorAction(vendorDetailsModal.id, "approve");
                      }}
                      disabled={vendorActionLoading === vendorDetailsModal.id}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {vendorActionLoading === vendorDetailsModal.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleVendorAction(vendorDetailsModal.id, "reject");
                      }}
                      disabled={vendorActionLoading === vendorDetailsModal.id}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {vendorActionLoading === vendorDetailsModal.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Reject
                    </button>
                  </>
                )}
                {vendorDetailsModal.status === "approved" && (
                  <button
                    onClick={() => {
                      handleVendorAction(vendorDetailsModal.id, "suspend");
                    }}
                    disabled={vendorActionLoading === vendorDetailsModal.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vendorActionLoading === vendorDetailsModal.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    Suspend
                  </button>
                )}
                {vendorDetailsModal.status === "suspended" && (
                  <button
                    onClick={() => {
                      handleVendorAction(vendorDetailsModal.id, "reinstated");
                    }}
                    disabled={vendorActionLoading === vendorDetailsModal.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vendorActionLoading === vendorDetailsModal.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Reinstate
                  </button>
                )}
                {vendorDetailsModal.status === "rejected" && (
                  <button
                    onClick={() => {
                      handleVendorAction(vendorDetailsModal.id, "enable");
                    }}
                    disabled={vendorActionLoading === vendorDetailsModal.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vendorActionLoading === vendorDetailsModal.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Enable (Set to Pending)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {createNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">Create Notification</h3>
              <button
                onClick={() => setCreateNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={handleCreateNotification}
              className="p-6 space-y-4"
              onChange={(e) => {
                const target = e.target as HTMLSelectElement;
                if (target.name === "recipient_type") {
                  const userIdContainer = document.getElementById("user_id_container");
                  if (userIdContainer) {
                    userIdContainer.classList.toggle("hidden", target.value !== "user");
                  }
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Notification title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Notification message"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    name="type"
                    defaultValue="system"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="system">System</option>
                    <option value="order">Order</option>
                    <option value="product">Product</option>
                    <option value="vendor">Vendor</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Type
                  </label>
                  <select
                    name="recipient_type"
                    id="recipient_type"
                    defaultValue="all"
                    onChange={(e) => {
                      const userIdContainer = document.getElementById("user_id_container");
                      if (userIdContainer) {
                        userIdContainer.classList.toggle("hidden", e.target.value !== "user");
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Users</option>
                    <option value="user">Specific User</option>
                  </select>
                </div>
              </div>
              <div id="user_id_container" className="hidden">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email <span className="text-red-500">*</span>
                </label>
                {notificationUsersLoading ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading users...
                  </div>
                ) : (
                  <select
                    name="user_id"
                    id="user_id"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a user</option>
                    {notificationUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email} {user.full_name ? `(${user.full_name})` : ""}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Select a specific user to send this notification to
                </p>
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setCreateNotificationModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNotificationLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {createNotificationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Create Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Are you sure you want to delete this <strong className="capitalize">{deleteConfirm.type}</strong>?
            </p>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {deleteConfirm.name}
            </p>
            <p className="text-sm text-red-600 mb-6 font-medium">
              ⚠️ This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm.type === "product") {
                    handleDeleteProduct(deleteConfirm.id);
                  } else if (deleteConfirm.type === "order") {
                    handleDeleteOrder(deleteConfirm.id);
                  } else if (deleteConfirm.type === "user") {
                    handleDeleteUser(deleteConfirm.id);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
