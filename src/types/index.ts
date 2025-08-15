// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'vendor' | 'customer';
  created_at: string;
  updated_at: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  logo_url: string;
  status: 'pending' | 'approved' | 'suspended';
  created_at: string;
  updated_at: string;
}

// Product Types
export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  images: string[];
  stock_quantity: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_count: number;
}

// Order Types
export interface Order {
  id: string;
  customer_id: string;
  vendor_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  created_at: string;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product_id: string;
  product: Product;
  quantity: number;
  price: number;
}

// Payment Types
export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: string;
}

// Shipping Types
export interface Shipping {
  id: string;
  order_id: string;
  tracking_number: string;
  carrier: string;
  status: 'pending' | 'shipped' | 'delivered';
  estimated_delivery: string;
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

// Search Types
export interface SearchFilters {
  category?: string;
  price_min?: number;
  price_max?: number;
  rating?: number;
  vendor?: string;
  location?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
