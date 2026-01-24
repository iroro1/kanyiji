"use client";

import { X, Package, User, Calendar, DollarSign, MapPin, Phone, Mail, Truck, CreditCard, FileText, Hash } from "lucide-react";
import Image from "next/image";

interface OrderItem {
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
}

interface Address {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  address_line_1?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  postal_code?: string;
}

interface Order {
  id: string;
  order_number?: string;
  customer_id: string;
  vendor_id?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "confirmed" | "refunded";
  payment_status?: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  fulfillment_status?: "unfulfilled" | "fulfilled" | "partially_fulfilled" | "shipped" | "delivered";
  subtotal?: string | number;
  tax_amount?: string | number;
  shipping_amount?: string | number;
  discount_amount?: string | number;
  total_amount: string;
  currency?: string;
  notes?: string;
  customer_notes?: string;
  internal_notes?: string;
  billing_address?: Address | string;
  shipping_address?: Address | string;
  shipping_method?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  delivered_at?: string;
  created_at: string;
  updated_at?: string;
  payment_reference?: string;
  customer?: {
    id: string;
    email?: string;
    full_name?: string;
    phone?: string;
  };
  order_items?: OrderItem[];
}

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "processing":
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
    case "refunded":
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
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatAddress = (address: Address | string | undefined): string => {
  if (!address) return "";
  if (typeof address === "string") return address;
  
  const parts = [];
  if (address.address || address.address_line_1) {
    parts.push(address.address || address.address_line_1);
  }
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode || address.postal_code) {
    parts.push(address.zipCode || address.postal_code);
  }
  if (address.country) parts.push(address.country);
  
  return parts.join(", ");
};

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
}: OrderDetailModalProps) {
  if (!isOpen || !order) return null;

  const totalQuantity = order.order_items?.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  ) || 0;

  const shippingAddress = typeof order.shipping_address === "string" 
    ? order.shipping_address 
    : order.shipping_address;
  const billingAddress = typeof order.billing_address === "string"
    ? order.billing_address
    : order.billing_address;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
            <p className="text-sm text-gray-500 mt-1">
              {order.order_number ? `Order #${order.order_number}` : `Order #${order.id.slice(0, 8)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
              <Package className="w-4 h-4" />
              Order Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Order ID</label>
                <p className="text-sm text-gray-900 mt-1 font-mono break-all">{order.id}</p>
              </div>
              {order.order_number && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Order Number
                  </label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{order.order_number}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase">Order Status</label>
                <div className="mt-1">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              {order.payment_status && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Payment Status
                  </label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                      order.payment_status === "paid" ? "bg-green-100 text-green-800" :
                      order.payment_status === "failed" ? "bg-red-100 text-red-800" :
                      order.payment_status === "refunded" || order.payment_status === "partially_refunded" ? "bg-orange-100 text-orange-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              )}
              {order.fulfillment_status && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Fulfillment Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${
                      order.fulfillment_status === "delivered" ? "bg-green-100 text-green-800" :
                      order.fulfillment_status === "shipped" ? "bg-purple-100 text-purple-800" :
                      order.fulfillment_status === "fulfilled" ? "bg-blue-100 text-blue-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {order.fulfillment_status}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Order Date
                </label>
                <p className="text-sm text-gray-900 mt-1">{formatDate(order.created_at)}</p>
              </div>
              {order.updated_at && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Last Updated</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(order.updated_at)}</p>
                </div>
              )}
              {order.delivered_at && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Delivered At</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(order.delivered_at)}</p>
                </div>
              )}
              {order.estimated_delivery_date && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Estimated Delivery</label>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(order.estimated_delivery_date)}</p>
                </div>
              )}
              {order.payment_reference && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Payment Reference</label>
                  <p className="text-sm text-gray-900 mt-1 font-mono break-all">{order.payment_reference}</p>
                </div>
              )}
              {order.tracking_number && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Tracking Number
                  </label>
                  <p className="text-sm text-gray-900 mt-1 font-mono">{order.tracking_number}</p>
                </div>
              )}
              {order.shipping_method && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Shipping Method
                  </label>
                  <p className="text-sm text-gray-900 mt-1">{order.shipping_method}</p>
                </div>
              )}
              {order.currency && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase">Currency</label>
                  <p className="text-sm text-gray-900 mt-1">{order.currency}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          {order.customer && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" />
                Customer Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {order.customer.full_name && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">Full Name</label>
                    <p className="text-sm text-gray-900 mt-1">{order.customer.full_name}</p>
                  </div>
                )}
                {order.customer.email && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Email
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{order.customer.email}</p>
                  </div>
                )}
                {order.customer.phone && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Phone
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{order.customer.phone}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {shippingAddress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h4>
              {typeof shippingAddress === "string" ? (
                <p className="text-sm text-gray-900">{shippingAddress}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(shippingAddress.firstName || shippingAddress.first_name) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">First Name</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {shippingAddress.firstName || shippingAddress.first_name}
                      </p>
                    </div>
                  )}
                  {(shippingAddress.lastName || shippingAddress.last_name) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Last Name</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {shippingAddress.lastName || shippingAddress.last_name}
                      </p>
                    </div>
                  )}
                  {shippingAddress.phone && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Phone
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{shippingAddress.phone}</p>
                    </div>
                  )}
                  {shippingAddress.email && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{shippingAddress.email}</p>
                    </div>
                  )}
                  {(shippingAddress.address || shippingAddress.address_line_1) && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase">Street Address</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {shippingAddress.address || shippingAddress.address_line_1}
                      </p>
                    </div>
                  )}
                  {shippingAddress.city && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">City</label>
                      <p className="text-sm text-gray-900 mt-1">{shippingAddress.city}</p>
                    </div>
                  )}
                  {shippingAddress.state && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">State</label>
                      <p className="text-sm text-gray-900 mt-1">{shippingAddress.state}</p>
                    </div>
                  )}
                  {shippingAddress.country && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Country</label>
                      <p className="text-sm text-gray-900 mt-1">{shippingAddress.country}</p>
                    </div>
                  )}
                  {(shippingAddress.zipCode || shippingAddress.postal_code) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Postal Code</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {shippingAddress.zipCode || shippingAddress.postal_code}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Billing Address */}
          {billingAddress && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Billing Address
              </h4>
              {typeof billingAddress === "string" ? (
                <p className="text-sm text-gray-900">{billingAddress}</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(billingAddress.firstName || billingAddress.first_name) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">First Name</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {billingAddress.firstName || billingAddress.first_name}
                      </p>
                    </div>
                  )}
                  {(billingAddress.lastName || billingAddress.last_name) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Last Name</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {billingAddress.lastName || billingAddress.last_name}
                      </p>
                    </div>
                  )}
                  {billingAddress.phone && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Phone
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{billingAddress.phone}</p>
                    </div>
                  )}
                  {billingAddress.email && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        Email
                      </label>
                      <p className="text-sm text-gray-900 mt-1">{billingAddress.email}</p>
                    </div>
                  )}
                  {(billingAddress.address || billingAddress.address_line_1) && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-gray-500 uppercase">Street Address</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {billingAddress.address || billingAddress.address_line_1}
                      </p>
                    </div>
                  )}
                  {billingAddress.city && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">City</label>
                      <p className="text-sm text-gray-900 mt-1">{billingAddress.city}</p>
                    </div>
                  )}
                  {billingAddress.state && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">State</label>
                      <p className="text-sm text-gray-900 mt-1">{billingAddress.state}</p>
                    </div>
                  )}
                  {billingAddress.country && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Country</label>
                      <p className="text-sm text-gray-900 mt-1">{billingAddress.country}</p>
                    </div>
                  )}
                  {(billingAddress.zipCode || billingAddress.postal_code) && (
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Postal Code</label>
                      <p className="text-sm text-gray-900 mt-1">
                        {billingAddress.zipCode || billingAddress.postal_code}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Order Items */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
              Order Items ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
            </h4>
            <div className="space-y-4">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 flex items-start gap-4">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.products?.product_images?.[0]?.image_url ? (
                        <Image
                          src={item.products?.product_images?.[0]?.image_url || "/placeholder-image.jpg"}
                          alt={item.products.name || "Product"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-gray-900">
                        {item.products?.name || "Product"}
                      </h5>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Quantity: <strong>{item.quantity}</strong></span>
                          {item.size && <span>Size: <strong>{item.size}</strong></span>}
                          {item.color && <span>Color: <strong className="capitalize">{item.color}</strong></span>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Unit Price: <strong>{formatPrice(parseFloat(item.unit_price || "0"))}</strong></span>
                          <span>Total: <strong className="text-gray-900">{formatPrice(parseFloat(item.total_price || "0"))}</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No items found in this order</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Order Summary
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Items:</span>
                <span className="font-medium text-gray-900">{totalQuantity}</span>
              </div>
              {order.subtotal !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(parseFloat(String(order.subtotal || "0")))}
                  </span>
                </div>
              )}
              {order.shipping_amount !== undefined && parseFloat(String(order.shipping_amount || "0")) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(parseFloat(String(order.shipping_amount || "0")))}
                  </span>
                </div>
              )}
              {order.tax_amount !== undefined && parseFloat(String(order.tax_amount || "0")) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(parseFloat(String(order.tax_amount || "0")))}
                  </span>
                </div>
              )}
              {order.discount_amount !== undefined && parseFloat(String(order.discount_amount || "0")) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount:</span>
                  <span className="font-medium">
                    -{formatPrice(parseFloat(String(order.discount_amount || "0")))}
                  </span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(parseFloat(order.total_amount || "0"))}
                    {order.currency && order.currency !== "NGN" && ` ${order.currency}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(order.notes || order.customer_notes) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Order Notes
              </h4>
              {order.notes && (
                <div className="mb-2">
                  <label className="text-xs font-medium text-gray-700 uppercase">General Notes</label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{order.notes}</p>
                </div>
              )}
              {order.customer_notes && (
                <div>
                  <label className="text-xs font-medium text-gray-700 uppercase">Customer Notes</label>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{order.customer_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Internal Notes */}
          {order.internal_notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Internal Notes
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{order.internal_notes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
