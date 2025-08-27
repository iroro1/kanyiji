export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface ShippingRate {
  id: string;
  serviceName: string;
  deliveryTime: string;
  price: number;
  currency: string;
  estimatedDays: number;
  trackingAvailable: boolean;
}

export interface ShippingQuote {
  id: string;
  origin: ShippingAddress;
  destination: ShippingAddress;
  packages: Package[];
  rates: ShippingRate[];
  totalWeight: number;
  totalValue: number;
  createdAt: Date;
  expiresAt: Date;
}

export interface Package {
  id: string;
  weight: number; // in kg
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
  description: string;
  value: number;
  quantity: number;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: ShippingAddress;
  destination: ShippingAddress;
  packages: Package[];
  selectedRate: ShippingRate;
  totalCost: number;
  currency: string;
  estimatedDelivery: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentStatus {
  code: string;
  description: string;
  location?: string;
  timestamp: Date;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: ShipmentStatus;
  history: ShipmentStatus[];
  estimatedDelivery: Date;
  currentLocation?: string;
  lastUpdated: Date;
}

export interface GigLogisticsCredentials {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  merchantId: string;
}

export interface CreateShipmentRequest {
  origin: ShippingAddress;
  destination: ShippingAddress;
  packages: Package[];
  serviceType: string;
  insurance?: boolean;
  signature?: boolean;
  specialInstructions?: string;
}

export interface CreateShipmentResponse {
  success: boolean;
  shipment?: Shipment;
  error?: string;
  trackingNumber?: string;
}

export interface GetShippingRatesRequest {
  origin: ShippingAddress;
  destination: ShippingAddress;
  packages: Package[];
  serviceType?: string;
}

export interface GetShippingRatesResponse {
  success: boolean;
  rates?: ShippingRate[];
  error?: string;
}

export interface TrackShipmentRequest {
  trackingNumber: string;
}

export interface TrackShipmentResponse {
  success: boolean;
  trackingInfo?: TrackingInfo;
  error?: string;
}
