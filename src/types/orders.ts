export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
  vendorId: string;
  productId: string;
  sku: string;
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  size?: string | null;
  color?: string | null;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface OrderTracking {
  trackingNumber: string;
  carrier: string;
  status: string;
  currentLocation?: string;
  estimatedDelivery?: Date;
  lastUpdate?: Date;
  history: TrackingEvent[];
}

export interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}

export interface OrderReview {
  id: string;
  orderId: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  helpful: number;
  reported: boolean;
}

export interface OrderInvoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  date: Date;
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  currency: string;
  items: OrderItem[];
  billingAddress: OrderAddress;
  shippingAddress: OrderAddress;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  tracking?: OrderTracking;
  reviews?: OrderReview[];
  invoice?: OrderInvoice;
  notes?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "processing" 
  | "shipped" 
  | "out_for_delivery" 
  | "delivered" 
  | "cancelled" 
  | "returned" 
  | "refunded";

export interface OrderFilters {
  status?: OrderStatus[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  vendor?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderSearchParams {
  query?: string;
  filters?: OrderFilters;
  sortBy?: "date" | "total" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface OrderSummary {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  recentOrders: Order[];
  topVendors: Array<{
    vendor: string;
    orderCount: number;
    totalSpent: number;
  }>;
}

export interface OrderAction {
  id: string;
  type: "track" | "review" | "invoice" | "return" | "cancel" | "support";
  label: string;
  icon: string;
  available: boolean;
  action: () => void;
}
