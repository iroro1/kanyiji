"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useFetchUserOrders } from "@/components/http/QueryHttp";
import OrderTrackingModal from "@/components/orders/OrderTrackingModal";
import InvoiceModal from "@/components/orders/InvoiceModal";

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    vendor: string;
  }>;
  shippingAddress: string;
  trackingNumber?: string;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { data: orders, isPending, isLoading, error, isError } = useFetchUserOrders(user ? user.id : "");
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to view your orders
          </h2>
          <Link href="/auth/login" className="btn-primary">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // REMOVED: Blocking loading state - show content immediately
  // Users can see their existing orders while new data loads in the background
  // This prevents UX blocking when switching tabs

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error loading orders
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message || "Something went wrong. Please try again."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "processing":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "shipped":
        return <Truck className="w-4 h-4 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled":
        return <Package className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="mt-2 text-gray-600">
            Track your orders and view order history
          </p>
            </div>
            {/* Non-blocking loading indicator - only shows when actually fetching */}
            {isPending && orders && orders.length > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500 mr-2"></div>
                <span>Updating...</span>
              </div>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders?.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Order #{order.order_number || order.id.slice(0, 8)}
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 text-sm text-gray-600">
                    {formatDate(order.created_at)}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.order_items?.map((item: any, itemIndex: number) => {
                    const productImage = item.products?.product_images?.[0]?.image_url || "/placeholder-product.png";
                    // Try to get vendor from order_item's vendor relationship, fallback to order's vendor
                    const vendorName = item.vendors?.business_name 
                      || (item.vendors && typeof item.vendors === 'object' && item.vendors.business_name)
                      || order.vendors?.business_name
                      || (order.vendors && typeof order.vendors === 'object' && order.vendors.business_name)
                      || "Unknown Vendor";
                    
                    // Parse size and color from internal_notes
                    let itemSize: string | null = null;
                    let itemColor: string | null = null;
                    
                    if (order.internal_notes) {
                      // Parse format: "Product Variants:\nItem 1 (Product Name): Size: L, Color: Red"
                      // Remove "Product Variants:" prefix if present
                      const notesText = order.internal_notes.replace(/^Product Variants:\s*/i, '');
                      const itemMatch = notesText.match(
                        new RegExp(`Item ${itemIndex + 1} \\([^)]+\\): (.+)`, 'i')
                      );
                      if (itemMatch) {
                        const variantText = itemMatch[1];
                        const sizeMatch = variantText.match(/Size:\s*([^,]+)/i);
                        const colorMatch = variantText.match(/Color:\s*([^,]+)/i);
                        if (sizeMatch) itemSize = sizeMatch[1].trim();
                        if (colorMatch) itemColor = colorMatch[1].trim();
                      }
                    }
                    
                    // Fallback to item.size and item.color if they exist (for backward compatibility)
                    const displaySize = itemSize || item.size || null;
                    const displayColor = itemColor || item.color || null;
                    
                    return (
                    <div key={item.id} className="flex items-center space-x-4">
                      <Image
                        width={500}
                        height={300}
                          src={productImage}
                          alt={item.product_name || "Product"}
                        className="w-16 h-16 object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-product.png";
                          }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.product_name || "Product"}
                        </h3>
                          {/* Display size and color if available from internal_notes or item */}
                          {(displaySize || displayColor) && (
                            <p className="text-sm text-gray-600 mt-1 font-medium">
                              {displaySize && displayColor 
                                ? `Size: ${displaySize} • Color: ${displayColor}`
                                : displaySize 
                                ? `Size: ${displaySize}`
                                : displayColor
                                ? `Color: ${displayColor}`
                                : ''}
                            </p>
                          )}
                        <p className="text-sm text-gray-500">
                            Vendor: {vendorName}
                        </p>
                        <p className="text-sm text-gray-500">
                            Qty: {item.quantity} × {formatPrice(parseFloat(item.unit_price || 0))}
                        </p>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                          {formatPrice(parseFloat(item.total_price || item.unit_price * item.quantity))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Details */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Shipping Address
                      </h4>
                      {order.shipping_address ? (
                        <div>
                          <p className="text-sm font-semibold">
                            {order.shipping_address.firstName || order.shipping_address.first_name} {order.shipping_address.lastName || order.shipping_address.last_name}
                          </p>
                          <p className="text-sm text-gray-600">{order.shipping_address.address || order.shipping_address.address_line_1}</p>
                          {order.shipping_address.address_line_2 && (
                            <p className="text-sm text-gray-600">{order.shipping_address.address_line_2}</p>
                          )}
                          <p className="text-sm text-gray-600">
                            {order.shipping_address.city}, {order.shipping_address.state}
                          </p>
                          <p className="text-sm text-gray-600">{order.shipping_address.country}</p>
                          {order.shipping_address.zipCode || order.shipping_address.postal_code ? (
                            <p className="text-sm text-gray-600">{order.shipping_address.zipCode || order.shipping_address.postal_code}</p>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No shipping address available</p>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Order Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-900">
                            {(() => {
                              // Calculate subtotal properly: total - shipping - tax + discount
                              const total = parseFloat(order.total_amount || 0);
                              const shipping = parseFloat(order.shipping_amount || 0);
                              const tax = parseFloat(order.tax_amount || 0);
                              const discount = parseFloat(order.discount_amount || 0);
                              
                              // If subtotal exists, use it; otherwise calculate from total
                              if (order.subtotal) {
                                return formatPrice(parseFloat(order.subtotal));
                              }
                              // Calculate: total = subtotal + shipping + tax - discount
                              // So: subtotal = total - shipping - tax + discount
                              return formatPrice(Math.max(0, total - shipping - tax + discount));
                            })()}
                          </span>
                        </div>
                        {order.shipping_amount && parseFloat(order.shipping_amount) > 0 ? (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span className="text-gray-900">
                              {formatPrice(parseFloat(order.shipping_amount))}
                            </span>
                          </div>
                        ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="text-gray-900">Free</span>
                        </div>
                        )}
                        {order.tax_amount && parseFloat(order.tax_amount) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span className="text-gray-900">
                              {formatPrice(parseFloat(order.tax_amount))}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-900">Total:</span>
                          <span className="text-gray-900">
                            {formatPrice(parseFloat(order.total_amount || 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Info */}
                  {order.tracking_number && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Tracking Information
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Tracking Number: {order.tracking_number}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-3">
                      {order.tracking_number ? (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setTrackingModalOpen(true);
                          }}
                          className="bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                        >
                          Track Order
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-300 text-gray-500 font-medium text-sm px-4 py-2 rounded-lg cursor-not-allowed"
                          title="Tracking number will be available when order is shipped"
                        >
                        Track Order
                      </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setInvoiceModalOpen(true);
                        }}
                        className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                      >
                        View Invoice
                      </button>
                      {order.status === "delivered" && (
                        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
                          Leave Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {orders?.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No orders yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your orders here
            </p>
            <Link href="/products" className="btn-primary px-6 py-3">
              Start Shopping
            </Link>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {selectedOrder && (
        <OrderTrackingModal
          isOpen={trackingModalOpen}
          onClose={() => {
            setTrackingModalOpen(false);
            setSelectedOrder(null);
          }}
          trackingNumber={selectedOrder.tracking_number || ""}
          orderId={selectedOrder.order_number || selectedOrder.id}
        />
      )}

      {/* Invoice Modal */}
      {selectedOrder && (
        <InvoiceModal
          isOpen={invoiceModalOpen}
          onClose={() => {
            setInvoiceModalOpen(false);
            setSelectedOrder(null);
          }}
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.order_number || selectedOrder.id}
          items={selectedOrder.order_items?.map((item: any, itemIndex: number) => {
            // Try to get vendor from order_item's vendor relationship, fallback to order's vendor, then unknown
            const vendorName = item.vendors?.business_name 
              || (item.vendors && typeof item.vendors === 'object' && item.vendors.business_name)
              || selectedOrder.vendors?.business_name
              || (selectedOrder.vendors && typeof selectedOrder.vendors === 'object' && selectedOrder.vendors.business_name)
              || "Unknown Vendor";
            
            // Parse size and color from internal_notes
            let itemSize: string | null = null;
            let itemColor: string | null = null;
            
            if (selectedOrder.internal_notes) {
              // Parse format: "Product Variants:\nItem 1 (Product Name): Size: L, Color: Red"
              // Remove "Product Variants:" prefix if present
              const notesText = selectedOrder.internal_notes.replace(/^Product Variants:\s*/i, '');
              const itemMatch = notesText.match(
                new RegExp(`Item ${itemIndex + 1} \\([^)]+\\): (.+)`, 'i')
              );
              if (itemMatch) {
                const variantText = itemMatch[1];
                const sizeMatch = variantText.match(/Size:\s*([^,]+)/i);
                const colorMatch = variantText.match(/Color:\s*([^,]+)/i);
                if (sizeMatch) itemSize = sizeMatch[1].trim();
                if (colorMatch) itemColor = colorMatch[1].trim();
              }
            }
            
            // Fallback to item.size and item.color if they exist (for backward compatibility)
            const displaySize = itemSize || item.size || null;
            const displayColor = itemColor || item.color || null;
            
            return {
              id: item.id,
              name: item.product_name,
              sku: item.product_sku || "",
              price: parseFloat(item.unit_price || 0),
              quantity: item.quantity,
              image: item.products?.product_images?.[0]?.image_url || "/placeholder-product.png",
              vendor: vendorName,
              size: displaySize,
              color: displayColor,
            };
          }) || []}
          total={parseFloat(selectedOrder.total_amount || 0)}
          subtotal={(() => {
            // Calculate subtotal properly: total - shipping - tax + discount
            const total = parseFloat(selectedOrder.total_amount || 0);
            const shipping = parseFloat(selectedOrder.shipping_amount || 0);
            const tax = parseFloat(selectedOrder.tax_amount || 0);
            const discount = parseFloat(selectedOrder.discount_amount || 0);
            
            // If subtotal exists, use it; otherwise calculate from total
            if (selectedOrder.subtotal) {
              return parseFloat(selectedOrder.subtotal);
            }
            // Calculate: total = subtotal + shipping + tax - discount
            // So: subtotal = total - shipping - tax + discount
            return Math.max(0, total - shipping - tax + discount);
          })()}
          tax={parseFloat(selectedOrder.tax_amount || 0)}
          shipping={parseFloat(selectedOrder.shipping_amount || 0)}
          discount={parseFloat(selectedOrder.discount_amount || 0)}
        />
      )}
    </div>
  );
}
