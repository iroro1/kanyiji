"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Truck,
  Star,
  Settings,
  BarChart3,
  FileText,
  Download,
  Loader2,
  Wallet,
  CreditCard,
  ArrowUpRight,
  History,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import CustomError from "@/app/error";
import {
  useFetchVendorDetails,
  useDeleteVendorProduct,
  useFetchVendorOrders,
  useUpdateVendorOrderStatus,
} from "@/components/http/QueryHttp";
import DeleteConfirmationModal from "@/components/ui/DeleteModal";
import EditProductModal from "@/components/vendor/EditProductModal";
import DocumentViewerModal from "@/components/vendor/DocumentViewerModal";
import OrderDetailModal from "@/components/vendor/OrderDetailModal";
import { useFetchCurrentUser } from "@/components/http/QueryHttp";
import { useToast } from "@/components/ui/Toast";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  status: "active" | "inactive" | "pending";
  stock: number;
  sales: number;
  rating: number;
  image: string;
}

interface Order {
  id: string;
  customer_id: string;
  vendor_id?: string;
  customer?: {
    id: string;
    full_name?: string;
    email?: string;
    phone?: string;
  };
  order_items?: Array<{
    id: string;
    product_id: string;
    vendor_id: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    size?: string;
    color?: string;
    products?: {
      id: string;
      name: string;
      product_images?: Array<{ image_url: string }>;
    };
  }>;
  total_amount: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "confirmed" | "refunded";
  payment_status?: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  fulfillment_status?: "unfulfilled" | "fulfilled" | "partially_fulfilled" | "shipped" | "delivered";
  created_at: string;
  updated_at?: string;
  payment_reference?: string;
  shipping_address?: any;
  internal_notes?: string;
}

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  monthlyGrowth: number;
}

export default function VendorDashboard() {
  const { data: user } = useFetchCurrentUser();
  const { user: authUser } = useAuth();
  const { notify } = useToast();

  console.log("queryUser", user);

  console.log("authUser", authUser);
  const userId = user ? user.id : "";
  const { vendor, isPending } = useFetchVendorDetails(userId);
  const { deleteProduct, isDeleting } = useDeleteVendorProduct();
  const { orders, stats: orderStats, isLoading: ordersLoading, error: ordersError } = useFetchVendorOrders();
  
  // Debug: Log orders data
  useEffect(() => {
    if (orders) {
      console.log("Vendor Dashboard - Orders received:", {
        ordersCount: orders.length,
        orders: orders.map((o: any) => ({
          id: o.id,
          vendor_id: o.vendor_id,
          order_items_count: o.order_items?.length || 0,
        })),
      });
    }
    if (ordersError) {
      console.error("Vendor Dashboard - Orders error:", ordersError);
    }
  }, [orders, ordersError]);
  const { updateOrderStatus, isPending: isUpdatingOrder } = useUpdateVendorOrderStatus();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState("");
  const [vendorFormData, setVendorFormData] = useState<any>({});
  const [isSavingVendor, setIsSavingVendor] = useState(false);
  const [documentUrls, setDocumentUrls] = useState<Record<string, string>>({});
  const [loadingDocuments, setLoadingDocuments] = useState<Record<string, boolean>>({});
  const [isMounted, setIsMounted] = useState(true);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string; docKey: string } | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  
  // Payout state
  const [payoutData, setPayoutData] = useState<any>(null);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [showAddBankAccount, setShowAddBankAccount] = useState(false);
  const [showRequestPayout, setShowRequestPayout] = useState(false);
  const [editingBankAccount, setEditingBankAccount] = useState<any>(null);
  const [bankAccountForm, setBankAccountForm] = useState({
    account_name: "",
    account_number: "",
    bank_name: "",
    bank_code: "",
    account_type: "savings",
    is_primary: false,
  });
  const [payoutRequestForm, setPayoutRequestForm] = useState({
    amount: "",
    bankAccountId: "",
  });

  console.log(selectedProduct);
  const ProductToBeEdited = vendor?.products.find(
    (product: any) => product.id === editingProductId
  );

  // Debug: Log kyc_documents structure
  useEffect(() => {
    if (vendor?.kyc_documents) {
      console.log('KYC Documents structure:', vendor.kyc_documents);
      console.log('KYC Documents type:', typeof vendor.kyc_documents);
      console.log('KYC Documents is array:', Array.isArray(vendor.kyc_documents));
      if (Array.isArray(vendor.kyc_documents) && vendor.kyc_documents.length > 0) {
        console.log('First KYC document:', vendor.kyc_documents[0]);
      }
    }
  }, [vendor?.kyc_documents]);

  // Track component mount state
  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      // Cleanup loading states on unmount
      setLoadingDocuments({});
      setDocumentUrls({});
    };
  }, []);

  // Track if vendor data has been loaded at least once
  useEffect(() => {
    if (vendor && !hasInitiallyLoaded) {
      setHasInitiallyLoaded(true);
    }
  }, [vendor, hasInitiallyLoaded]);

  // Reset loading states when tab becomes visible or window regains focus
  // This prevents stuck loading states when user switches tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reset all loading states when user comes back to tab
        console.log('Tab became visible, resetting loading states');
        setLoadingDocuments({});
      }
    };

    const handleWindowFocus = () => {
      // Reset loading states when window regains focus (handles tab switching)
      console.log('Window regained focus, resetting loading states');
      setLoadingDocuments({});
    };

    const handleWindowBlur = () => {
      // Also reset when leaving tab to prevent stuck states
      console.log('Window lost focus, resetting loading states');
      setLoadingDocuments({});
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  // Initialize form data when vendor loads
  useEffect(() => {
    if (vendor && isMounted) {
      setVendorFormData({
        business_name: vendor.business_name || "",
        business_type: vendor.business_type || "",
        business_email: vendor.business_email || "",
        phone: vendor.phone || "",
        business_registration_number: vendor.business_registration_number || "",
        tax_id: vendor.tax_id || "",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        country: vendor.country || "Nigeria",
        postal_code: vendor.postal_code || "",
        website_url: vendor.website_url || "",
        business_description: vendor.business_description || "",
        social_media: vendor.social_media || {},
      });
    }
  }, [vendor, isMounted]);

  // Fetch signed URL for document viewing
  const getDocumentUrl = async (originalUrl: string, docKey: string): Promise<string | null> => {
    if (!originalUrl || !isMounted) return null;
    
    if (documentUrls[docKey]) {
      return documentUrls[docKey];
    }

    // Check if URL is already a signed URL (has token) - use it directly
    if (originalUrl.includes('/object/sign/') && originalUrl.includes('token=')) {
      console.log('URL is already signed, using directly:', originalUrl);
      if (isMounted) {
        setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      }
      return originalUrl;
    }

    // If file is in private folder, we MUST get a signed URL (cannot use public endpoint)
    const isPrivateFile = originalUrl.includes('/private/');
    
    // Only use public URL directly if:
    // 1. It's a public URL AND
    // 2. The file is NOT in a private folder
    const isPublicUrl = originalUrl.startsWith('http') && (
      originalUrl.includes('/public/') || 
      originalUrl.includes('/object/public/') ||
      originalUrl.includes('storage/v1/object/public')
    );
    
    if (isPublicUrl && !isPrivateFile) {
      console.log('Using public URL directly (not in private folder):', originalUrl);
      if (isMounted) {
        setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      }
      return originalUrl;
    }
    
    // For private files, we MUST call the API to get a signed URL
    // Even if the URL says /public/, if the file path contains /private/, we need a signed URL
    if (isPrivateFile) {
      console.log('File is in private folder - MUST get signed URL from API:', originalUrl);
    } else {
      console.log('Getting signed URL from API for:', originalUrl);
    }

    // Don't set loading state for viewing - fetch in background
    try {
      // Try vendor-specific endpoint first (only for private URLs)
      const response = await fetch(`/api/vendor/documents?url=${encodeURIComponent(originalUrl)}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.warn('Vendor document endpoint failed:', errorData);
        
        // If vendor endpoint fails, try admin endpoint as fallback
        const adminResponse = await fetch(`/api/admin/vendors/documents?url=${encodeURIComponent(originalUrl)}`, {
          credentials: 'include',
        });
        
        if (!adminResponse.ok) {
          console.warn('Admin document endpoint also failed, using original URL');
          // Try original URL as last resort
          if (isMounted) {
            setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
          }
          return originalUrl;
        }
        
        const adminData = await adminResponse.json();
        if (adminData.url) {
          if (isMounted) {
            setDocumentUrls((prev) => ({ ...prev, [docKey]: adminData.url }));
          }
          return adminData.url;
        }
        
        if (isMounted) {
          setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
        }
        return originalUrl;
      }

      const data = await response.json();
      console.log('API response data:', data);
      
      if (data.url) {
        console.log('Got signed URL from API:', data.url);
        if (isMounted) {
          setDocumentUrls((prev) => ({ ...prev, [docKey]: data.url }));
        }
        // Show warning if bucket issue
        if (data.warning) {
          console.warn('Document access warning:', data.warning);
        }
        return data.url;
      }
      
      // If error response, log it
      if (data.error) {
        console.error('Document access error:', data.error, data.details);
        notify(`Unable to access document: ${data.error}`, 'error');
        return null;
      }
      
      // If no URL in response, something went wrong
      console.error('No URL in API response:', data);
      notify('Failed to get document access URL', 'error');
      return null;
    } catch (error) {
      console.error('Error fetching document URL:', error);
      // Fallback to original URL
      if (isMounted) {
        setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      }
      return originalUrl;
    }
  };

  const handleViewDocument = async (originalUrl: string, docKey: string, documentName: string = 'Document') => {
    if (!originalUrl) {
      notify('Document URL is not available', 'error');
      return;
    }
    
    console.log('Viewing document:', { originalUrl, docKey });
    
    // Check if we already have a cached signed URL
    if (documentUrls[docKey]) {
      console.log('Using cached signed URL:', documentUrls[docKey]);
      setViewingDocument({ url: documentUrls[docKey], name: documentName, docKey });
      return;
    }
    
    // Check if URL is already a signed URL (has token) - use directly
    if (originalUrl.includes('/object/sign/') && originalUrl.includes('token=')) {
      console.log('Opening signed URL directly:', originalUrl);
      // Cache it for future use
      if (isMounted) {
        setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      }
      setViewingDocument({ url: originalUrl, name: documentName, docKey });
      return;
    }
    
    // Check if file is in private folder - if so, MUST get signed URL
    const isPrivateFile = originalUrl.includes('/private/');
    
    // Only open public URLs directly if file is NOT in private folder
    const isPublicUrl = originalUrl.startsWith('http') && (
      originalUrl.includes('/public/') || 
      originalUrl.includes('/object/public/') ||
      originalUrl.includes('storage/v1/object/public')
    );
    
    if (isPublicUrl && !isPrivateFile) {
      console.log('Opening public URL directly (not in private folder):', originalUrl);
      // Cache it for future use
      if (isMounted) {
        setDocumentUrls((prev) => ({ ...prev, [docKey]: originalUrl }));
      }
      setViewingDocument({ url: originalUrl, name: documentName, docKey });
      return;
    }
    
    // For private files, always get signed URL from API
    console.log('File is private or needs signed URL, fetching from API...');
    
    // Don't set loading state for viewing - just fetch in background
    try {
      const signedUrl = await getDocumentUrl(originalUrl, docKey);
      
      if (signedUrl) {
        console.log('Got signed URL, opening in modal:', signedUrl);
        setViewingDocument({ url: signedUrl, name: documentName, docKey });
      } else {
        console.error('Failed to get signed URL');
        notify('Unable to generate document access URL. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      notify('Unable to open document. Please try again or contact support.', 'error');
    }
  };

  const handleDownloadDocument = async (originalUrl: string, docKey: string, fileName: string) => {
    const signedUrl = await getDocumentUrl(originalUrl, docKey);
    if (signedUrl) {
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveVendor = async () => {
    if (!vendor) {
      notify('Vendor information not loaded. Please refresh the page.', 'error');
      return;
    }

    setIsSavingVendor(true);
    try {
      console.log('Saving vendor data:', vendorFormData);
      console.log('Current vendor ID:', vendor.id);
      console.log('Current user ID:', userId);
      console.log('Vendor user_id from loaded data:', vendor.user_id);

      // Include vendor ID in the request so API can use it directly
      const response = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies for authentication
        body: JSON.stringify({
          ...vendorFormData,
          _vendorId: vendor.id, // Pass vendor ID directly to avoid lookup issues
        }),
      });

      const data = await response.json();
      console.log('Save response:', { status: response.status, data });

      if (!response.ok) {
        // Show detailed error message
        const errorMessage = data.details 
          ? `${data.error}: ${data.details}${data.suggestion ? ` ${data.suggestion}` : ''}`
          : data.error || 'Failed to update vendor';
        console.error('Save failed:', errorMessage);
        notify(errorMessage, 'error');
        return;
      }

      // Show success message
      notify('Vendor profile updated successfully!', 'success');
      
      // Refresh vendor data after a short delay to show the success message
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving vendor:', error);
      const errorMsg = error.message || 'Failed to save changes. Please try again.';
      console.error('Full error:', error);
      notify(errorMsg, 'error');
    } finally {
      setIsSavingVendor(false);
    }
  };

  const router = useRouter();
  const pathname = usePathname();

  console.log("isDeleting", isDeleting);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  function handleConfirmDelete(productId: string, imageName: any[]) {
    console.log(imageName);
    const paths = imageName?.map(
      (image) => image.image_url.split("/vendor-product-images/")[1]
    );

    console.log(paths);

    deleteProduct({ productId, userId, imagePath: paths });
  }

  function EditProduct(productId: string) {
    router.push(`${pathname}/edit-product`);
  }

  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "orders" | "analytics" | "payouts" | "settings"
  >("overview");

  // Fetch payout data when payouts tab is active
  useEffect(() => {
    if (activeTab !== "payouts") return;
    
    setPayoutLoading(true);
    const fetchPayoutData = async () => {
      try {
        const response = await fetch("/api/vendor/payouts", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setPayoutData(data);
        } else {
          notify("Failed to load payout data", "error");
        }
      } catch (error) {
        console.error("Error fetching payout data:", error);
        notify("Error loading payout data", "error");
      } finally {
        setPayoutLoading(false);
      }
    };

    fetchPayoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Calculate stats from real data
  const stats: VendorStats = {
    totalProducts: vendor?.products?.length || 0,
    totalOrders: orderStats.totalOrders || 0,
    totalRevenue: orderStats.totalRevenue || 0,
    totalCustomers: orderStats.totalCustomers || 0,
    monthlyGrowth: 0, // Can be calculated from historical data if needed
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    updateOrderStatus({ orderId, status: newStatus });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (user?.role !== "vendor") {
    return (
      <CustomError
        statusCode={403}
        title="Access Denied"
        message="User must be a registered vendor to access the dashboard."
        retry={false}
      />
    );
  }

  // Loading spinners disabled - show content immediately
  // if (isDeleting) {
  //   return <LoadingSpinner />;
  // }

  // if (isPending && !vendor && !hasInitiallyLoaded && userId) {
  //   return <LoadingSpinner />;
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {vendor?.business_name}
              </h1>
              <p className="text-gray-600">Manage your products and orders</p>
            </div>
            <Link
              href="/profile"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {vendor?.products?.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <ShoppingBag className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(orderStats.totalRevenue || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {orderStats.totalCustomers || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "products", label: "Products", icon: Package },
              { id: "orders", label: "Orders", icon: ShoppingBag },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
              { id: "payouts", label: "Payouts", icon: Wallet },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {activeTab === "overview" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Dashboard Overview
              </h2>

              {/* Recent Orders */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Recent Orders
                </h3>
                <div className="space-y-3">
                  {ordersLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No orders yet</div>
                  ) : (
                    orders.slice(0, 5).map((order: Order) => {
                      const firstItem = order.order_items?.[0];
                      const productName = firstItem?.products?.name || "Multiple items";
                      const itemCount = order.order_items?.length || 0;
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {productName}{itemCount > 1 ? ` +${itemCount - 1} more` : ""}
                              </p>
                              <p className="text-sm text-gray-600">
                                Order #{order.id.slice(0, 8)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {formatPrice(parseFloat(order.total_amount || "0"))}
                            </p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {getStatusIcon(order.status)}
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Top Performing Products
                </h3>
                <div className="space-y-3">
                  {vendor?.products?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No products yet</div>
                  ) : (
                    vendor?.products?.slice(0, 3).map((product: any) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <Image
                            width={500}
                            height={300}
                            src={product.product_images?.[0]?.image_url || "/placeholder.png"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {product.category || "Uncategorized"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatPrice(parseFloat(product.price || "0"))}
                          </p>
                          <p className="text-sm text-gray-600">
                            {product.sales || 0} sales
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Products
                </h2>
                <Link
                  href={"dashboard/add-product"}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
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
                    {vendor?.products?.map((product: any) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Image
                              width={500}
                              height={300}
                              src={product.product_images?.[0]?.image_url}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-lg mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.sales} sales
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.category || "Uncategorized"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatPrice(parseFloat(product.price || "0"))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              product.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            className="text-primary-600 hover:text-primary-900"
                            onClick={() => {
                              setOpenEditModal(true);
                              setEditingProductId(product.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {vendor?.products?.length === 0 && (
                  <EmptyState
                    title="No products found"
                    message="Please add new products"
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "orders" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Orders
              </h2>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
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
                    {ordersLoading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Loading orders...
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          No orders found
                        </td>
                      </tr>
                    ) : (
                      orders.map((order: Order) => {
                        const firstItem = order.order_items?.[0];
                        const productName = firstItem?.products?.name || "Multiple items";
                        const totalQuantity = order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                        const orderDate = new Date(order.created_at).toLocaleDateString("en-NG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const hasSizeOrColor = firstItem?.size || firstItem?.color;
                        return (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id.slice(0, 8)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {orderDate}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.customer?.full_name || "N/A"}
                              </div>
                              {order.customer?.email && (
                              <div className="text-sm text-gray-500">
                                  {order.customer.email}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">
                                {productName}
                                {order.order_items && order.order_items.length > 1 && (
                                  <span className="text-gray-500"> +{order.order_items.length - 1} more</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Qty: {totalQuantity}
                                {hasSizeOrColor && (
                                  <span className="ml-2">
                                    {firstItem?.size && `Size: ${firstItem.size}`}
                                    {firstItem?.size && firstItem?.color && " • "}
                                    {firstItem?.color && `Color: ${firstItem.color}`}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatPrice(parseFloat(order.total_amount || "0"))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  order.status
                                )}`}
                              >
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setViewingOrder(order)}
                                  className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              <select
                                value={order.status}
                                onChange={(e) =>
                                  handleUpdateOrderStatus(
                                    order.id,
                                    e.target.value as Order["status"]
                                  )
                                }
                                disabled={isUpdatingOrder}
                                className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Analytics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Sales Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Revenue</span>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(orderStats.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Orders</span>
                      <span className="font-semibold text-gray-900">
                        {orderStats.totalOrders || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Product Performance
                  </h3>
                  <div className="space-y-4">
                    {vendor?.products?.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 text-sm">No products yet</div>
                    ) : (
                      vendor?.products?.slice(0, 3).map((product: any) => (
                        <div
                          key={product.id}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600">{product.name}</span>
                          <span className="font-semibold text-gray-900">
                            {product.sales || 0} sales
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payouts" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Payouts & Earnings
              </h2>

              {payoutLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                </div>
              ) : payoutData ? (
                <div className="space-y-6">
                  {/* Account Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Available Balance</span>
                        <Wallet className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{payoutData.accountSummary?.availableBalance?.toLocaleString() || "0.00"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Ready to withdraw</p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Pending Earnings</span>
                        <Clock className="w-5 h-5 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{payoutData.accountSummary?.pendingEarnings?.toLocaleString() || "0.00"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Awaiting clearance</p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Earnings</span>
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{payoutData.accountSummary?.totalEarnings?.toLocaleString() || "0.00"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">All time</p>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total Paid</span>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₦{payoutData.accountSummary?.paidEarnings?.toLocaleString() || "0.00"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Withdrawn</p>
                    </div>
                  </div>

                  {/* Request Payout Button */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          Request Payout
                        </h3>
                        <p className="text-sm text-gray-600">
                          Withdraw your available balance to your bank account
                        </p>
                      </div>
                      <button
                        onClick={() => setShowRequestPayout(true)}
                        disabled={!payoutData?.accountSummary?.availableBalance || (payoutData?.accountSummary?.availableBalance || 0) <= 0}
                        className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors"
                      >
                        <ArrowUpRight className="w-5 h-5" />
                        Request Payout
                      </button>
                    </div>
                  </div>

                  {/* Bank Accounts Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bank Accounts
                      </h3>
                      <button
                        onClick={() => {
                          setEditingBankAccount(null);
                          setBankAccountForm({
                            account_name: "",
                            account_number: "",
                            bank_name: "",
                            bank_code: "",
                            account_type: "savings",
                            is_primary: false,
                          });
                          setShowAddBankAccount(true);
                        }}
                        className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Bank Account
                      </button>
                    </div>

                    {payoutData.bankAccounts && payoutData.bankAccounts.length > 0 ? (
                      <div className="space-y-4">
                        {payoutData.bankAccounts.map((account: any) => (
                          <div
                            key={account.id}
                            className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-5 h-5 text-gray-400" />
                                <h4 className="font-medium text-gray-900">
                                  {account.account_name}
                                </h4>
                                {account.is_primary && (
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                    Primary
                                  </span>
                                )}
                                {account.is_verified && (
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Account Number:</span>
                                  <p className="font-mono font-medium">{account.account_number}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Bank:</span>
                                  <p className="font-medium">{account.bank_name}</p>
                                </div>
                                <div>
                                  <span className="text-gray-500">Type:</span>
                                  <p className="font-medium capitalize">{account.account_type}</p>
                                </div>
                                {account.bank_code && (
                                  <div>
                                    <span className="text-gray-500">Bank Code:</span>
                                    <p className="font-medium">{account.bank_code}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                onClick={() => {
                                  setEditingBankAccount(account);
                                  setBankAccountForm({
                                    account_name: account.account_name,
                                    account_number: account.account_number,
                                    bank_name: account.bank_name,
                                    bank_code: account.bank_code || "",
                                    account_type: account.account_type,
                                    is_primary: account.is_primary,
                                  });
                                  setShowAddBankAccount(true);
                                }}
                                className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("Are you sure you want to delete this bank account?")) {
                                    try {
                                      const response = await fetch(
                                        `/api/vendor/bank-accounts?id=${account.id}`,
                                        {
                                          method: "DELETE",
                                          credentials: "include",
                                        }
                                      );
                                      if (response.ok) {
                                        notify("Bank account deleted successfully", "success");
                                        // Refresh payout data
                                        const payoutResponse = await fetch("/api/vendor/payouts", {
                                          credentials: "include",
                                        });
                                        if (payoutResponse.ok) {
                                          const data = await payoutResponse.json();
                                          setPayoutData(data);
                                        }
                                      } else {
                                        notify("Failed to delete bank account", "error");
                                      }
                                    } catch (error) {
                                      console.error("Error deleting bank account:", error);
                                      notify("Error deleting bank account", "error");
                                    }
                                  }
                                }}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">No bank accounts added yet</p>
                        <button
                          onClick={() => {
                            setEditingBankAccount(null);
                            setBankAccountForm({
                              account_name: "",
                              account_number: "",
                              bank_name: "",
                              bank_code: "",
                              account_type: "savings",
                              is_primary: false,
                            });
                            setShowAddBankAccount(true);
                          }}
                          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Add Your First Bank Account
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Payout History */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payout History
                      </h3>
                      <History className="w-5 h-5 text-gray-400" />
                    </div>

                    {payoutData.payouts && payoutData.payouts.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Reference
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Amount
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Method
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {payoutData.payouts.map((payout: any) => (
                              <tr key={payout.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-mono">
                                  {payout.reference}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold">
                                  ₦{parseFloat(payout.amount || 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3">
                                  <span
                                    className={`px-2 py-1 text-xs font-medium rounded ${
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
                                <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                                  {payout.payment_method?.replace("_", " ") || "N/A"}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {new Date(payout.created_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No payout history yet</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyState
                  title="Unable to load payout data"
                  message="Please try refreshing the page"
                />
              )}

              {/* Add/Edit Bank Account Modal */}
              {showAddBankAccount && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingBankAccount ? "Edit Bank Account" : "Add Bank Account"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddBankAccount(false);
                          setEditingBankAccount(null);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          const url = "/api/vendor/bank-accounts";
                          const method = editingBankAccount ? "PATCH" : "POST";
                          const body = editingBankAccount
                            ? { id: editingBankAccount.id, ...bankAccountForm }
                            : bankAccountForm;

                          const response = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify(body),
                          });

                          if (response.ok) {
                            notify(
                              editingBankAccount
                                ? "Bank account updated successfully"
                                : "Bank account added successfully",
                              "success"
                            );
                            setShowAddBankAccount(false);
                            setEditingBankAccount(null);
                            // Refresh payout data
                            const payoutResponse = await fetch("/api/vendor/payouts", {
                              credentials: "include",
                            });
                            if (payoutResponse.ok) {
                              const data = await payoutResponse.json();
                              setPayoutData(data);
                            }
                          } else {
                            const error = await response.json();
                            notify(error.error || "Failed to save bank account", "error");
                          }
                        } catch (error) {
                          console.error("Error saving bank account:", error);
                          notify("Error saving bank account", "error");
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={bankAccountForm.account_name}
                          onChange={(e) =>
                            setBankAccountForm({ ...bankAccountForm, account_name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={bankAccountForm.account_number}
                          onChange={(e) =>
                            setBankAccountForm({
                              ...bankAccountForm,
                              account_number: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={bankAccountForm.bank_name}
                          onChange={(e) =>
                            setBankAccountForm({ ...bankAccountForm, bank_name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Bank Code
                        </label>
                        <input
                          type="text"
                          value={bankAccountForm.bank_code}
                          onChange={(e) =>
                            setBankAccountForm({ ...bankAccountForm, bank_code: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Type *
                        </label>
                        <select
                          required
                          value={bankAccountForm.account_type}
                          onChange={(e) =>
                            setBankAccountForm({ ...bankAccountForm, account_type: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="business">Business</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_primary"
                          checked={bankAccountForm.is_primary}
                          onChange={(e) =>
                            setBankAccountForm({ ...bankAccountForm, is_primary: e.target.checked })
                          }
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <label htmlFor="is_primary" className="ml-2 text-sm text-gray-700">
                          Set as primary account
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {editingBankAccount ? "Update" : "Add"} Bank Account
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddBankAccount(false);
                            setEditingBankAccount(null);
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Request Payout Modal */}
              {showRequestPayout && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Request Payout</h3>
                      <button
                        onClick={() => {
                          setShowRequestPayout(false);
                          setPayoutRequestForm({ amount: "", bankAccountId: "" });
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!payoutRequestForm.amount || parseFloat(payoutRequestForm.amount) <= 0) {
                          notify("Please enter a valid amount", "error");
                          return;
                        }

                        if (
                          parseFloat(payoutRequestForm.amount) >
                          (payoutData?.accountSummary?.availableBalance || 0)
                        ) {
                          notify("Amount exceeds available balance", "error");
                          return;
                        }

                        try {
                          const response = await fetch("/api/vendor/payouts", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              amount: parseFloat(payoutRequestForm.amount),
                              bankAccountId: payoutRequestForm.bankAccountId || null,
                            }),
                          });

                          if (response.ok) {
                            notify("Payout request submitted successfully", "success");
                            setShowRequestPayout(false);
                            setPayoutRequestForm({ amount: "", bankAccountId: "" });
                            // Refresh payout data
                            const payoutResponse = await fetch("/api/vendor/payouts", {
                              credentials: "include",
                            });
                            if (payoutResponse.ok) {
                              const data = await payoutResponse.json();
                              setPayoutData(data);
                            }
                          } else {
                            const error = await response.json();
                            notify(error.error || "Failed to submit payout request", "error");
                          }
                        } catch (error) {
                          console.error("Error requesting payout:", error);
                          notify("Error submitting payout request", "error");
                        }
                      }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Available Balance
                        </label>
                        <input
                          type="text"
                          value={`₦${payoutData?.accountSummary?.availableBalance?.toLocaleString() || "0.00"}`}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount to Withdraw *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={payoutData?.accountSummary?.availableBalance || 0}
                          step="0.01"
                          value={payoutRequestForm.amount}
                          onChange={(e) =>
                            setPayoutRequestForm({ ...payoutRequestForm, amount: e.target.value })
                          }
                          placeholder="Enter amount"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      {payoutData?.bankAccounts && payoutData.bankAccounts.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Account (Optional)
                          </label>
                          <select
                            value={payoutRequestForm.bankAccountId}
                            onChange={(e) =>
                              setPayoutRequestForm({
                                ...payoutRequestForm,
                                bankAccountId: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="">Select bank account (optional)</option>
                            {payoutData.bankAccounts.map((account: any) => (
                              <option key={account.id} value={account.id}>
                                {account.account_name} - {account.account_number} ({account.bank_name})
                                {account.is_primary && " (Primary)"}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          type="submit"
                          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Submit Request
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRequestPayout(false);
                            setPayoutRequestForm({ amount: "", bankAccountId: "" });
                          }}
                          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Vendor Settings
              </h2>

              {isPending && !hasInitiallyLoaded ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : vendor ? (
                <div className="space-y-6">
                  {/* Vendor ID Section */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vendor ID</label>
                        <input
                          type="text"
                          value={vendor.id || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                        <input
                          type="text"
                          value={vendor.user_id || ""}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Image Only (Logo removed) */}
                  {vendor.cover_image_url && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Image</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {vendor.cover_image_url && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                            <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                              <img
                                src={vendor.cover_image_url}
                                alt="Cover Image"
                                className="w-full h-32 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Business Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                        <input
                          type="text"
                          value={vendorFormData.business_name || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, business_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                        <select
                          value={vendorFormData.business_type || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, business_type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        >
                          <option value="individual">Individual</option>
                          <option value="company">Company</option>
                          <option value="cooperative">Cooperative</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                        <input
                          type="email"
                          value={vendorFormData.business_email || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, business_email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={vendorFormData.phone || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Registration Number</label>
                        <input
                          type="text"
                          value={vendorFormData.business_registration_number || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, business_registration_number: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                        <input
                          type="text"
                          value={vendorFormData.tax_id || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, tax_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                          type="text"
                          value={vendorFormData.address || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, address: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          value={vendorFormData.city || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                        <input
                          type="text"
                          value={vendorFormData.state || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, state: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <input
                          type="text"
                          value={vendorFormData.country || "Nigeria"}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, country: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                        <input
                          type="text"
                          value={vendorFormData.postal_code || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, postal_code: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                        <input
                          type="text"
                          value={vendorFormData.website_url || ""}
                          onChange={(e) => setVendorFormData({ ...vendorFormData, website_url: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            vendor.status === 'approved' ? 'bg-green-100 text-green-800' :
                            vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            vendor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {vendor.status ? vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            vendor.verification_status === 'verified' ? 'bg-green-100 text-green-800' :
                            vendor.verification_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            vendor.verification_status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {vendor.verification_status ? vendor.verification_status.charAt(0).toUpperCase() + vendor.verification_status.slice(1) : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
                      <textarea
                        value={vendorFormData.business_description || ""}
                        onChange={(e) => setVendorFormData({ ...vendorFormData, business_description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                      />
                    </div>
                  </div>

                  {/* Social Media */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                        <div key={platform}>
                          <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                            {platform}
                          </label>
                          <input
                            type="text"
                            value={vendorFormData.social_media?.[platform] || ""}
                            onChange={(e) => setVendorFormData({
                              ...vendorFormData,
                              social_media: {
                                ...vendorFormData.social_media,
                                [platform]: e.target.value
                              }
                            })}
                            placeholder={`https://${platform}.com/yourpage`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Statistics */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Products</label>
                        <input
                          type="text"
                          value={vendor.products ? vendor.products.length : 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <input
                          type="text"
                          value={vendor.rating ? `${parseFloat(vendor.rating).toFixed(2)} / 5.00` : '0.00 / 5.00'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Reviews</label>
                        <input
                          type="text"
                          value={vendor.total_reviews || 0}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Sales</label>
                        <input
                          type="text"
                          value={vendor.total_sales ? `₦${parseFloat(vendor.total_sales).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₦0.00'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate</label>
                        <input
                          type="text"
                          value={vendor.commission_rate ? `${parseFloat(vendor.commission_rate).toFixed(2)}%` : '5.00%'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payout Information */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payout Method</label>
                        <input
                          type="text"
                          value={vendor.payout_method ? vendor.payout_method.replace('_', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Bank Transfer'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      {vendor.payout_details && typeof vendor.payout_details === 'object' && Object.keys(vendor.payout_details).length > 0 && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Payout Details</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(vendor.payout_details as Record<string, any>).map(([key, value]) => (
                              <div key={key}>
                                <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                                  {key.replace(/_/g, ' ')}
                                </label>
                                <input
                                  type="text"
                                  value={value || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Accounts */}
                  {vendor.vendor_bank_accounts && Array.isArray(vendor.vendor_bank_accounts) && vendor.vendor_bank_accounts.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Accounts</h3>
                      <div className="space-y-4">
                        {vendor.vendor_bank_accounts.map((account: any, index: number) => (
                          <div key={account.id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                {account.is_primary ? 'Primary Account' : `Account ${index + 1}`}
                              </h4>
                              <div className="flex gap-2">
                                {account.is_primary && (
                                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Primary</span>
                                )}
                                {account.is_verified && (
                                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Verified</span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Account Name</label>
                                <input
                                  type="text"
                                  value={account.account_name || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Account Number</label>
                                <input
                                  type="text"
                                  value={account.account_number || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Bank Name</label>
                                <input
                                  type="text"
                                  value={account.bank_name || 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Account Type</label>
                                <input
                                  type="text"
                                  value={account.account_type ? account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1) : 'Not provided'}
                                  readOnly
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700"
                                />
                              </div>
                              {account.bank_code && (
                                <div>
                                  <label className="block text-xs font-medium text-gray-500 mb-1">Bank Code</label>
                                  <input
                                    type="text"
                                    value={account.bank_code}
                                    readOnly
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-mono"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Account Dates */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Created</label>
                        <input
                          type="text"
                          value={vendor.created_at ? new Date(vendor.created_at).toLocaleDateString('en-NG', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Not available'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                        <input
                          type="text"
                          value={vendor.updated_at ? new Date(vendor.updated_at).toLocaleDateString('en-NG', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Not available'}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  {vendor.kyc_documents && vendor.kyc_documents.length > 0 && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Documents</h3>
                      <div className="space-y-4">
                        {vendor.kyc_documents[0]?.business_license_url && (
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">Business License</h4>
                                <p className="text-sm text-gray-600">Business registration document</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewDocument(
                                    vendor.kyc_documents![0].business_license_url!,
                                    `business_license_${vendor.id}`,
                                    'Business License'
                                  )}
                                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(
                                    vendor.kyc_documents![0].business_license_url!,
                                    `business_license_${vendor.id}`,
                                    'business-license.pdf'
                                  )}
                                  disabled={loadingDocuments[`business_license_${vendor.id}`]}
                                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {loadingDocuments[`business_license_${vendor.id}`] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {vendor.kyc_documents[0]?.tax_certificate_url && (
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">Tax Certificate</h4>
                                <p className="text-sm text-gray-600">Tax identification document</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewDocument(
                                    vendor.kyc_documents![0].tax_certificate_url!,
                                    `tax_certificate_${vendor.id}`,
                                    'Tax Certificate'
                                  )}
                                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(
                                    vendor.kyc_documents![0].tax_certificate_url!,
                                    `tax_certificate_${vendor.id}`,
                                    'tax-certificate.pdf'
                                  )}
                                  disabled={loadingDocuments[`tax_certificate_${vendor.id}`]}
                                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {loadingDocuments[`tax_certificate_${vendor.id}`] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {vendor.kyc_documents[0]?.bank_statement_url && (
                          <div className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">Bank Statement</h4>
                                <p className="text-sm text-gray-600">Bank account verification document</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleViewDocument(
                                    vendor.kyc_documents![0].bank_statement_url!,
                                    `bank_statement_${vendor.id}`,
                                    'Bank Statement'
                                  )}
                                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center gap-2"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                                <button
                                  onClick={() => handleDownloadDocument(
                                    vendor.kyc_documents![0].bank_statement_url!,
                                    `bank_statement_${vendor.id}`,
                                    'bank-statement.pdf'
                                  )}
                                  disabled={loadingDocuments[`bank_statement_${vendor.id}`]}
                                  className="px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                  {loadingDocuments[`bank_statement_${vendor.id}`] ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {(!vendor.kyc_documents[0]?.business_license_url && 
                          !vendor.kyc_documents[0]?.tax_certificate_url && 
                          !vendor.kyc_documents[0]?.bank_statement_url) && (
                          <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                            <p>No documents uploaded yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notification Preferences */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-sm text-gray-700">Email notifications for new orders</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span className="text-sm text-gray-700">SMS notifications for urgent orders</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span className="text-sm text-gray-700">Weekly sales reports</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      onClick={handleSaveVendor}
                      disabled={isSavingVendor}
                      className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSavingVendor ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No vendor data found. Please complete your vendor registration.</p>
                </div>
              )}
            </div>
          )}

          <EditProductModal
            isOpen={openEditModal}
            onClose={() => setOpenEditModal(false)}
            productToEdit={ProductToBeEdited}
          />
        </div>

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
          }}
          onConfirm={() =>
            handleConfirmDelete(
              selectedProduct ? selectedProduct.id : "",
              selectedProduct?.product_images
            )
          }
          title="Confirm Delete"
          message="This action will permanently remove the item from your inventory."
          itemName={selectedProduct?.name || ""}
          itemType={"product"}
        />

        {/* Document Viewer Modal */}
        <DocumentViewerModal
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          documentUrl={viewingDocument?.url || null}
          documentName={viewingDocument?.name || 'Document'}
          onDownload={viewingDocument ? () => {
            const docKey = viewingDocument.docKey;
            const fileName = `${viewingDocument.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
            // Find the original URL from vendor data
            let originalUrl = '';
            if (docKey.includes('business_license')) {
              originalUrl = vendor?.kyc_documents?.[0]?.business_license_url || '';
            } else if (docKey.includes('tax_certificate')) {
              originalUrl = vendor?.kyc_documents?.[0]?.tax_certificate_url || '';
            } else if (docKey.includes('bank_statement')) {
              originalUrl = vendor?.kyc_documents?.[0]?.bank_statement_url || '';
            }
            if (originalUrl) {
              handleDownloadDocument(originalUrl, docKey, fileName);
            }
          } : undefined}
        />

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          order={viewingOrder}
        />
      </div>
    </div>
  );
}
