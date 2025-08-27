import {
  GigLogisticsCredentials,
  CreateShipmentRequest,
  CreateShipmentResponse,
  GetShippingRatesRequest,
  GetShippingRatesResponse,
  TrackShipmentRequest,
  TrackShipmentResponse,
  ShippingRate,
  Shipment,
  TrackingInfo,
  ShipmentStatus,
} from "@/types/shipping";

class GigLogisticsService {
  private credentials: GigLogisticsCredentials;
  private baseUrl: string;

  constructor(credentials: GigLogisticsCredentials) {
    this.credentials = credentials;
    this.baseUrl = credentials.baseUrl;
  }

  private async makeRequest(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.credentials.apiKey}`,
      "X-API-Secret": this.credentials.apiSecret,
      "X-Merchant-ID": this.credentials.merchantId,
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && method !== "GET") {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Gig Logistics API request failed:", error);
      throw error;
    }
  }

  async getShippingRates(
    request: GetShippingRatesRequest
  ): Promise<GetShippingRatesResponse> {
    try {
      const response = await this.makeRequest(
        "/shipping/rates",
        "POST",
        request
      );

      if (response.success) {
        // Transform the response to match our interface
        const rates: ShippingRate[] = response.rates.map((rate: any) => ({
          id: rate.id || rate.service_id,
          serviceName: rate.service_name || rate.name,
          deliveryTime: rate.delivery_time || rate.estimated_delivery,
          price: parseFloat(rate.price) || 0,
          currency: rate.currency || "NGN",
          estimatedDays: parseInt(rate.estimated_days) || 0,
          trackingAvailable: rate.tracking_available || false,
        }));

        return {
          success: true,
          rates,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to get shipping rates",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async createShipment(
    request: CreateShipmentRequest
  ): Promise<CreateShipmentResponse> {
    try {
      const response = await this.makeRequest(
        "/shipping/shipments",
        "POST",
        request
      );

      if (response.success) {
        const shipment: Shipment = {
          id: response.shipment.id || response.shipment.shipment_id,
          trackingNumber:
            response.tracking_number || response.shipment.tracking_number,
          status: {
            code: response.shipment.status?.code || "CREATED",
            description:
              response.shipment.status?.description || "Shipment created",
            timestamp: new Date(),
          },
          origin: request.origin,
          destination: request.destination,
          packages: request.packages,
          selectedRate:
            response.shipment.selected_rate || response.shipment.rate,
          totalCost: parseFloat(response.shipment.total_cost) || 0,
          currency: response.shipment.currency || "NGN",
          estimatedDelivery: new Date(response.shipment.estimated_delivery),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        return {
          success: true,
          shipment,
          trackingNumber: shipment.trackingNumber,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to create shipment",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async trackShipment(
    request: TrackShipmentRequest
  ): Promise<TrackShipmentResponse> {
    try {
      const response = await this.makeRequest(
        `/shipping/track/${request.trackingNumber}`,
        "GET"
      );

      if (response.success) {
        const trackingInfo: TrackingInfo = {
          trackingNumber: request.trackingNumber,
          status: {
            code: response.status?.code || "UNKNOWN",
            description: response.status?.description || "Status unknown",
            location: response.status?.location,
            timestamp: new Date(response.status?.timestamp || Date.now()),
          },
          history: (response.history || []).map((status: any) => ({
            code: status.code || status.status_code,
            description: status.description || status.status_description,
            location: status.location,
            timestamp: new Date(status.timestamp || status.status_timestamp),
          })),
          estimatedDelivery: new Date(response.estimated_delivery),
          currentLocation: response.current_location,
          lastUpdated: new Date(response.last_updated || Date.now()),
        };

        return {
          success: true,
          trackingInfo,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to track shipment",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async cancelShipment(
    shipmentId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await this.makeRequest(
        `/shipping/shipments/${shipmentId}/cancel`,
        "POST"
      );

      return {
        success: response.success || false,
        error: response.error,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getShipmentHistory(
    merchantId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ success: boolean; shipments?: Shipment[]; error?: string }> {
    try {
      const response = await this.makeRequest(
        `/shipping/shipments?merchant_id=${merchantId}&page=${page}&limit=${limit}`,
        "GET"
      );

      if (response.success) {
        const shipments: Shipment[] = (response.shipments || []).map(
          (shipment: any) => ({
            id: shipment.id || shipment.shipment_id,
            trackingNumber: shipment.tracking_number,
            status: {
              code: shipment.status?.code || "UNKNOWN",
              description: shipment.status?.description || "Status unknown",
              timestamp: new Date(shipment.status?.timestamp || Date.now()),
            },
            origin: shipment.origin,
            destination: shipment.destination,
            packages: shipment.packages,
            selectedRate: shipment.selected_rate || shipment.rate,
            totalCost: parseFloat(shipment.total_cost) || 0,
            currency: shipment.currency || "NGN",
            estimatedDelivery: new Date(shipment.estimated_delivery),
            createdAt: new Date(shipment.created_at),
            updatedAt: new Date(shipment.updated_at),
          })
        );

        return {
          success: true,
          shipments,
        };
      }

      return {
        success: false,
        error: response.error || "Failed to get shipment history",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

export default GigLogisticsService;
