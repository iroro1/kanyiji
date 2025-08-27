import { ShippingAddress, Package } from "@/types/shipping";

/**
 * Validates a shipping address
 */
export function validateShippingAddress(address: ShippingAddress): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!address.firstName.trim()) errors.push("First name is required");
  if (!address.lastName.trim()) errors.push("Last name is required");
  if (!address.email.trim()) errors.push("Email is required");
  if (!address.phone.trim()) errors.push("Phone number is required");
  if (!address.address.trim()) errors.push("Address is required");
  if (!address.city.trim()) errors.push("City is required");
  if (!address.state.trim()) errors.push("State is required");
  if (!address.country.trim()) errors.push("Country is required");
  if (!address.postalCode.trim()) errors.push("Postal code is required");

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (address.email && !emailRegex.test(address.email)) {
    errors.push("Invalid email format");
  }

  // Phone validation (basic)
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (address.phone && !phoneRegex.test(address.phone.replace(/\s/g, ""))) {
    errors.push("Invalid phone number format");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates package dimensions and weight
 */
export function validatePackage(pkg: Package): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (pkg.weight <= 0) errors.push("Weight must be greater than 0");
  if (pkg.length <= 0) errors.push("Length must be greater than 0");
  if (pkg.width <= 0) errors.push("Width must be greater than 0");
  if (pkg.height <= 0) errors.push("Height must be greater than 0");
  if (pkg.value < 0) errors.push("Value cannot be negative");
  if (pkg.quantity <= 0) errors.push("Quantity must be greater than 0");

  // Maximum dimensions (adjust based on carrier limits)
  if (pkg.weight > 100) errors.push("Weight cannot exceed 100kg");
  if (pkg.length > 200) errors.push("Length cannot exceed 200cm");
  if (pkg.width > 200) errors.push("Width cannot exceed 200cm");
  if (pkg.height > 200) errors.push("Height cannot exceed 200cm");

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates package volume in cubic centimeters
 */
export function calculatePackageVolume(pkg: Package): number {
  return pkg.length * pkg.width * pkg.height;
}

/**
 * Calculates volumetric weight (length × width × height ÷ volumetric factor)
 * Most carriers use 5000 as the volumetric factor
 */
export function calculateVolumetricWeight(pkg: Package, volumetricFactor: number = 5000): number {
  return calculatePackageVolume(pkg) / volumetricFactor;
}

/**
 * Gets the higher of actual weight and volumetric weight
 */
export function getChargeableWeight(pkg: Package, volumetricFactor: number = 5000): number {
  const actualWeight = pkg.weight;
  const volumetricWeight = calculateVolumetricWeight(pkg, volumetricFactor);
  return Math.max(actualWeight, volumetricWeight);
}

/**
 * Formats weight for display
 */
export function formatWeight(weight: number, unit: "kg" | "g" | "lb" = "kg"): string {
  if (unit === "kg") {
    return `${weight.toFixed(2)} kg`;
  } else if (unit === "g") {
    return `${(weight * 1000).toFixed(0)} g`;
  } else if (unit === "lb") {
    return `${(weight * 2.20462).toFixed(2)} lb`;
  }
  return `${weight.toFixed(2)} kg`;
}

/**
 * Formats dimensions for display
 */
export function formatDimensions(length: number, width: number, height: number, unit: "cm" | "in" = "cm"): string {
  if (unit === "in") {
    return `${(length / 2.54).toFixed(1)}" × ${(width / 2.54).toFixed(1)}" × ${(height / 2.54).toFixed(1)}"`;
  }
  return `${length} × ${width} × ${height} cm`;
}

/**
 * Calculates total weight of multiple packages
 */
export function calculateTotalWeight(packages: Package[]): number {
  return packages.reduce((total, pkg) => total + (pkg.weight * pkg.quantity), 0);
}

/**
 * Calculates total value of multiple packages
 */
export function calculateTotalValue(packages: Package[]): number {
  return packages.reduce((total, pkg) => total + (pkg.value * pkg.quantity), 0);
}

/**
 * Calculates total chargeable weight of multiple packages
 */
export function calculateTotalChargeableWeight(packages: Package[], volumetricFactor: number = 5000): number {
  return packages.reduce((total, pkg) => {
    const chargeableWeight = getChargeableWeight(pkg, volumetricFactor);
    return total + (chargeableWeight * pkg.quantity);
  }, 0);
}

/**
 * Generates a unique tracking number
 */
export function generateTrackingNumber(prefix: string = "GL"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

/**
 * Formats currency for display
 */
export function formatCurrency(amount: number, currency: string = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Estimates delivery date based on service type and distance
 */
export function estimateDeliveryDate(
  serviceType: string,
  originState: string,
  destinationState: string,
  baseDate: Date = new Date()
): Date {
  const isSameState = originState.toLowerCase() === destinationState.toLowerCase();
  const isSameRegion = getRegion(originState) === getRegion(destinationState);
  
  let estimatedDays = 1; // Base delivery time
  
  if (serviceType.toLowerCase().includes("express")) {
    estimatedDays = isSameState ? 1 : isSameRegion ? 2 : 3;
  } else if (serviceType.toLowerCase().includes("standard")) {
    estimatedDays = isSameState ? 2 : isSameRegion ? 3 : 5;
  } else if (serviceType.toLowerCase().includes("economy")) {
    estimatedDays = isSameState ? 3 : isSameRegion ? 5 : 7;
  }
  
  const deliveryDate = new Date(baseDate);
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);
  
  // Skip weekends
  while (deliveryDate.getDay() === 0 || deliveryDate.getDay() === 6) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);
  }
  
  return deliveryDate;
}

/**
 * Gets the region of a Nigerian state
 */
function getRegion(state: string): string {
  const regions: { [key: string]: string } = {
    // North Central
    "benue": "north_central", "kogi": "north_central", "kwara": "north_central",
    "nasarawa": "north_central", "niger": "north_central", "plateau": "north_central",
    "fct": "north_central",
    
    // North East
    "adamawa": "north_east", "bauchi": "north_east", "borno": "north_east",
    "gombe": "north_east", "taraba": "north_east", "yobe": "north_east",
    
    // North West
    "jigawa": "north_west", "kaduna": "north_west", "kano": "north_west",
    "katsina": "north_west", "kebbi": "north_west", "sokoto": "north_west",
    "zamfara": "north_west",
    
    // South East
    "abia": "south_east", "anambra": "south_east", "ebonyi": "south_east",
    "enugu": "south_east", "imo": "south_east",
    
    // South South
    "akwa ibom": "south_south", "bayelsa": "south_south", "cross river": "south_south",
    "delta": "south_south", "edo": "south_south", "rivers": "south_south",
    
    // South West
    "ekiti": "south_west", "lagos": "south_west", "ogun": "south_west",
    "ondo": "south_west", "osun": "south_west", "oyo": "south_west",
  };
  
  return regions[state.toLowerCase()] || "unknown";
}
