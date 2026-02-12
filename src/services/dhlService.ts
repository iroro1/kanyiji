/**
 * DHL Express (MyDHL API) integration for international shipping.
 * Used for addresses outside Nigeria.
 *
 * Set in .env:
 *   DHL_USERNAME=     (Authorization username from DHL)
 *   DHL_PASSWORD=     (Authorization password from DHL)
 *   DHL_ACCOUNT_NUMBER= (Your DHL account number)
 *   DHL_API_BASE_URL= (optional; defaults to https://express.api.dhl.com/mydhlapi)
 */

const DHL_USERNAME = process.env.DHL_USERNAME;
const DHL_PASSWORD = process.env.DHL_PASSWORD;
const DHL_ACCOUNT_NUMBER = process.env.DHL_ACCOUNT_NUMBER;
const DHL_BASE_URL = process.env.DHL_API_BASE_URL || "https://express.api.dhl.com/mydhlapi";

// Cache OAuth token to avoid requesting on every call
let cachedToken: { token: string; expiresAt: number } | null = null;

export interface DHLRateRequest {
  originCountryCode: string;
  originPostalCode: string;
  destinationCountryCode: string;
  destinationPostalCode: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  shipmentDate?: string; // ISO date
}

export interface DHLRateResponse {
  products?: Array<{
    productName: string;
    productCode: string;
    totalNet?: { amount: number; currency: string };
    totalGross?: { amount: number; currency: string };
    deliveryCapability?: { deliveryTimestamp: string };
  }>;
  exchangeRates?: Array<{ baseCurrency: string; targetCurrency: string; exchangeRate: number }>;
}

/**
 * Get OAuth access token from DHL MyDHL API
 * Uses username/password credentials to obtain access token
 */
async function getDHLAccessToken(): Promise<string | null> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  if (!DHL_USERNAME || !DHL_PASSWORD) {
    console.warn("DHL credentials not configured; skipping token fetch.");
    return null;
  }

  try {
    const authUrl = `${DHL_BASE_URL}/auth/accesstoken`;
    const auth = Buffer.from(`${DHL_USERNAME}:${DHL_PASSWORD}`).toString("base64");

    const res = await fetch(authUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DHL auth error:", res.status, errText);
      return null;
    }

    const data = await res.json();
    const accessToken = data.access_token || data.token;
    const expiresIn = data.expires_in || 3600; // Default to 1 hour if not provided

    if (accessToken) {
      cachedToken = {
        token: accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      return accessToken;
    }

    return null;
  } catch (err) {
    console.error("DHL token fetch error:", err);
    return null;
  }
}

/**
 * Get DHL rates for international shipment.
 * Call DHL MyDHL API when destination is outside Nigeria.
 */
export async function getDHLRates(params: DHLRateRequest): Promise<DHLRateResponse | null> {
  if (!DHL_USERNAME || !DHL_PASSWORD) {
    console.warn("DHL credentials not configured; skipping international rate fetch.");
    return null;
  }

  if (!DHL_ACCOUNT_NUMBER) {
    console.warn("DHL account number not configured; skipping rate fetch.");
    return null;
  }

  try {
    // Get OAuth access token
    const accessToken = await getDHLAccessToken();
    if (!accessToken) {
      console.error("Failed to obtain DHL access token");
      return null;
    }

    const url = `${DHL_BASE_URL}/rates`;
    const body = {
      accountNumber: DHL_ACCOUNT_NUMBER,
      originAddress: {
        countryCode: params.originCountryCode,
        postalCode: params.originPostalCode,
      },
      destinationAddress: {
        countryCode: params.destinationCountryCode,
        postalCode: params.destinationPostalCode,
      },
      weight: params.weightKg,
      ...(params.lengthCm && params.widthCm && params.heightCm && {
        dimensions: {
          length: params.lengthCm,
          width: params.widthCm,
          height: params.heightCm,
        },
      }),
      ...(params.shipmentDate && { plannedShippingDate: params.shipmentDate }),
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DHL rates API error:", res.status, errText);
      // Clear cached token on auth error to force refresh
      if (res.status === 401) {
        cachedToken = null;
      }
      return null;
    }

    const data = await res.json();
    return data as DHLRateResponse;
  } catch (err) {
    console.error("DHL rates fetch error:", err);
    return null;
  }
}

/**
 * Check if destination country is outside Nigeria (use DHL for international).
 */
export function isInternationalDestination(countryCode: string): boolean {
  const nigeriaCodes = ["NG", "NGA"];
  return !nigeriaCodes.includes((countryCode || "").toUpperCase());
}
