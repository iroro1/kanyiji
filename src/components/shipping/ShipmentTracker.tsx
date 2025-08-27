"use client";

import { useState } from "react";
import { Search, Truck, MapPin, Clock, CheckCircle, AlertCircle, Package } from "lucide-react";
import { TrackingInfo, ShipmentStatus } from "@/types/shipping";
import GigLogisticsService from "@/services/gigLogisticsService";

export default function ShipmentTracker() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Mock credentials - in production, these should come from environment variables
  const mockCredentials = {
    apiKey: "your_api_key_here",
    apiSecret: "your_api_secret_here",
    baseUrl: "https://api.giglogistics.com/v1",
    merchantId: "your_merchant_id_here",
  };

  const gigLogisticsService = new GigLogisticsService(mockCredentials);

  const trackShipment = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingInfo(null);

    try {
      const response = await gigLogisticsService.trackShipment({
        trackingNumber: trackingNumber.trim(),
      });

      if (response.success && response.trackingInfo) {
        setTrackingInfo(response.trackingInfo);
      } else {
        setError(response.error || "Failed to track shipment");
      }
    } catch (err) {
      setError("An error occurred while tracking the shipment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusCode: string) => {
    switch (statusCode.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in_transit":
      case "out_for_delivery":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "exception":
      case "failed":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (statusCode: string) => {
    switch (statusCode.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "in_transit":
      case "out_for_delivery":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending":
      case "processing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "exception":
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Truck className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-semibold text-gray-900">Track Shipment</h2>
      </div>

      {/* Tracking Input */}
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && trackShipment()}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={trackShipment}
            disabled={loading}
            className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {loading ? "Tracking..." : "Track"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Tracking Results */}
      {trackingInfo && (
        <div className="space-y-6">
          {/* Shipment Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Tracking Number</h3>
                <p className="text-lg font-semibold text-gray-900">{trackingInfo.trackingNumber}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Current Status</h3>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(trackingInfo.status.code)}`}>
                  {getStatusIcon(trackingInfo.status.code)}
                  {trackingInfo.status.description}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">Estimated Delivery</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(trackingInfo.estimatedDelivery)}
                </p>
              </div>
            </div>

            {trackingInfo.currentLocation && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Current Location:</span>
                  <span className="text-sm font-medium text-gray-900">{trackingInfo.currentLocation}</span>
                </div>
              </div>
            )}
          </div>

          {/* Tracking Timeline */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking History</h3>
            <div className="space-y-4">
              {trackingInfo.history.map((status, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                    {index < trackingInfo.history.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(status.code)}
                      <div>
                        <h4 className="font-medium text-gray-900">{status.description}</h4>
                        {status.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {status.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{formatDate(status.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center text-sm text-gray-500">
            Last updated: {formatDate(trackingInfo.lastUpdated)}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!trackingInfo && !loading && (
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Track Your Shipment
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Enter your tracking number above to get real-time updates on your shipment status, 
            delivery timeline, and current location.
          </p>
        </div>
      )}
    </div>
  );
}
