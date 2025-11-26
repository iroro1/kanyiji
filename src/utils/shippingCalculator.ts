/**
 * Kanyiji Standard Shipping Calculator
 * Calculates shipping fees based on weight (KG) and destination location
 */

export interface ShippingLocation {
  country?: string;
  state?: string;
  city?: string;
}

export interface ShippingCalculationResult {
  price: number;
  pricePerKg: number;
  weight: number;
  location: string;
}

/**
 * Shipping rates per KG for different locations
 */
const SHIPPING_RATES: Record<string, number> = {
  // International
  UK: 14500,
  US: 14500,
  Canada: 14500,
  
  // Nigerian States/Cities
  Lagos: 4000,
  Abuja: 3500,
  
  // South-South & South-West
  Anambra: 3000,
  Delta: 3000,
  Benin: 3000,
  
  // South-East
  Enugu: 3500,
  Imo: 3500,
  Abia: 3500,
  Ebonyi: 3500,
  
  // South-South
  "Port Harcourt": 4500,
  Uyo: 4500,
  Ogoja: 4500,
  
  // North
  Plateau: 6000,
  Kaduna: 6000,
  Kano: 6000,
  Taraba: 6000,
  Adamawa: 6000,
};

/**
 * Maps state names to their shipping rate category
 */
const STATE_TO_RATE_MAP: Record<string, string> = {
  // Anambra, Delta, Benin - 3,000
  Anambra: "Anambra",
  Delta: "Delta",
  "Edo": "Benin", // Benin is in Edo state
  
  // Enugu, Imo, Abia, Ebonyi - 3,500
  Enugu: "Enugu",
  Imo: "Imo",
  Abia: "Abia",
  Ebonyi: "Ebonyi",
  
  // Port Harcourt, Uyo, Ogoja - 4,500
  Rivers: "Port Harcourt", // Port Harcourt is in Rivers
  AkwaIbom: "Uyo", // Uyo is in Akwa Ibom
  CrossRiver: "Ogoja", // Ogoja is in Cross River
  
  // North - 6,000
  Plateau: "Plateau",
  Kaduna: "Kaduna",
  Kano: "Kano",
  Taraba: "Taraba",
  Adamawa: "Adamawa",
};

/**
 * Normalizes location string for matching
 */
function normalizeLocation(location: string): string {
  return location.trim().toLowerCase();
}

/**
 * Finds the shipping rate for a given location
 */
function findShippingRate(location: ShippingLocation): number | null {
  const { country, state, city } = location;
  
  // Check country first (for international)
  if (country) {
    const normalizedCountry = normalizeLocation(country);
    if (normalizedCountry === "uk" || normalizedCountry === "united kingdom") {
      return SHIPPING_RATES.UK;
    }
    if (normalizedCountry === "us" || normalizedCountry === "usa" || normalizedCountry === "united states") {
      return SHIPPING_RATES.US;
    }
    if (normalizedCountry === "canada") {
      return SHIPPING_RATES.Canada;
    }
    if (normalizedCountry !== "nigeria" && country) {
      // Default to UK rate for other international locations
      return SHIPPING_RATES.UK;
    }
  }
  
  // Check city (for specific Nigerian cities)
  if (city) {
    const normalizedCity = normalizeLocation(city);
    if (normalizedCity === "lagos") {
      return SHIPPING_RATES.Lagos;
    }
    if (normalizedCity === "abuja") {
      return SHIPPING_RATES.Abuja;
    }
    if (normalizedCity === "port harcourt" || normalizedCity === "portharcourt") {
      return SHIPPING_RATES["Port Harcourt"];
    }
    if (normalizedCity === "uyo") {
      return SHIPPING_RATES.Uyo;
    }
    if (normalizedCity === "ogoja") {
      return SHIPPING_RATES.Ogoja;
    }
    if (normalizedCity === "benin" || normalizedCity === "benin city") {
      return SHIPPING_RATES.Benin;
    }
  }
  
  // Check state (for Nigerian states)
  if (state) {
    const normalizedState = normalizeLocation(state);
    
    // Direct state matches
    for (const [stateKey, rateKey] of Object.entries(STATE_TO_RATE_MAP)) {
      if (normalizedState === normalizeLocation(stateKey)) {
        return SHIPPING_RATES[rateKey];
      }
    }
    
    // Check if state matches any rate key directly
    for (const rateKey of Object.keys(SHIPPING_RATES)) {
      if (normalizedState === normalizeLocation(rateKey)) {
        return SHIPPING_RATES[rateKey];
      }
    }
  }
  
  return null;
}

/**
 * Calculates shipping fee based on weight (in KG) and destination location
 * 
 * @param weight - Weight in kilograms
 * @param location - Destination location (country, state, city)
 * @returns Shipping calculation result or null if location not found
 */
export function calculateShippingFee(
  weight: number,
  location: ShippingLocation
): ShippingCalculationResult | null {
  if (weight <= 0) {
    return {
      price: 0,
      pricePerKg: 0,
      weight: 0,
      location: "Unknown",
    };
  }
  
  const pricePerKg = findShippingRate(location);
  
  if (pricePerKg === null) {
    return null; // Location not found
  }
  
  const totalPrice = pricePerKg * weight;
  
  // Build location string for display
  const locationParts = [
    location.city,
    location.state,
    location.country,
  ].filter(Boolean);
  const locationString = locationParts.join(", ") || "Unknown";
  
  return {
    price: totalPrice,
    pricePerKg,
    weight,
    location: locationString,
  };
}

/**
 * Gets all available shipping rates
 */
export function getShippingRates(): Record<string, number> {
  return { ...SHIPPING_RATES };
}

/**
 * Gets shipping rate for a specific location (per KG)
 */
export function getShippingRatePerKg(location: ShippingLocation): number | null {
  return findShippingRate(location);
}

