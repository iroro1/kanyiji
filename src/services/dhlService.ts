/**
 * DHL Express (MyDHL API) integration for international shipping.
 * Used for addresses outside Nigeria.
 *
 * Set in .env (test keys from DHL; replace with live keys for production):
 *   DHL_APIKey=       (e.g. test key from MyDHL API - KANYIJI GLOBAL RESOURCES LTD - NG)
 *   DHL_APISecret=    (e.g. test secret)
 *   DHL_API_BASE_URL= (optional; defaults to https://express.api.dhl.com/mydhlapi)
 */

const DHL_API_KEY = process.env.DHL_APIKey;
const DHL_API_SECRET = process.env.DHL_APISecret;
const DHL_BASE_URL = process.env.DHL_API_BASE_URL || "https://express.api.dhl.com/mydhlapi";

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
 * Get DHL rates for international shipment.
 * Call DHL MyDHL API when destination is outside Nigeria.
 */
export async function getDHLRates(params: DHLRateRequest): Promise<DHLRateResponse | null> {
  if (!DHL_API_KEY || !DHL_API_SECRET) {
    console.warn("DHL API keys not configured; skipping international rate fetch.");
    return null;
  }

  try {
    // MyDHL API uses OAuth or API key auth - adjust per DHL docs
    const auth = Buffer.from(`${DHL_API_KEY}:${DHL_API_SECRET}`).toString("base64");
    const url = `${DHL_BASE_URL}/rates`;
    const body = {
      accountNumber: process.env.DHL_ACCOUNT_NUMBER,
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
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("DHL rates API error:", res.status, errText);
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
