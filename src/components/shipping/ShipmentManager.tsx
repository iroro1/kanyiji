"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Package,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  ShippingAddress,
  Package as PackageType,
  ShippingRate,
  Shipment,
  CreateShipmentRequest,
} from "@/types/shipping";
import GigLogisticsService from "@/services/gigLogisticsService";
import ShippingCalculator from "./ShippingCalculator";

interface ShipmentManagerProps {
  merchantId?: string;
}

export default function ShipmentManager({
  merchantId = "default",
}: ShipmentManagerProps) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [showCalculator, setShowCalculator] = useState(false);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Mock credentials - in production, these should come from environment variables
  const mockCredentials = {
    apiKey: "your_api_key_here",
    apiSecret: "your_api_secret_here",
    baseUrl: "https://api.giglogistics.com/v1",
    merchantId: merchantId,
  };

  const gigLogisticsService = new GigLogisticsService(mockCredentials);

  useEffect(() => {
    loadShipments();
  }, [merchantId]);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const response = await gigLogisticsService.getShipmentHistory(merchantId);
      if (response.success && response.shipments) {
        setShipments(response.shipments);
      }
    } catch (err) {
      console.error("Failed to load shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRateSelect = (rate: ShippingRate) => {
    setSelectedRate(rate);
  };

  const createShipment = async (request: CreateShipmentRequest) => {
    if (!selectedRate) {
      setError("Please select a shipping rate first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await gigLogisticsService.createShipment({
        ...request,
        serviceType: selectedRate.serviceName,
      });

      if (response.success && response.shipment) {
        setShipments((prev) => [response.shipment!, ...prev]);
        setShowCalculator(false);
        setSelectedRate(undefined);
        setError("");
      } else {
        setError(response.error || "Failed to create shipment");
      }
    } catch (err) {
      setError("An error occurred while creating the shipment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelShipment = async (shipmentId: string) => {
    if (!confirm("Are you sure you want to cancel this shipment?")) {
      return;
    }

    try {
      const response = await gigLogisticsService.cancelShipment(shipmentId);
      if (response.success) {
        setShipments((prev) =>
          prev.map((shipment) =>
            shipment.id === shipmentId
              ? {
                  ...shipment,
                  status: {
                    ...shipment.status,
                    code: "CANCELLED",
                    description: "Cancelled",
                  },
                }
              : shipment
          )
        );
      } else {
        setError(response.error || "Failed to cancel shipment");
      }
    } catch (err) {
      setError("An error occurred while cancelling the shipment");
      console.error(err);
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
      case "cancelled":
        return "text-red-600 bg-red-50 border-red-200";
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
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shipment Manager</h2>
          <p className="text-gray-600">Create and manage your shipments</p>
        </div>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {showCalculator ? "Hide Calculator" : "New Shipment"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Shipping Calculator */}
      {showCalculator && (
        <div className="mb-8">
          <ShippingCalculator
            onRateSelect={handleRateSelect}
            selectedRate={selectedRate}
          />

          {selectedRate && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">
                    Selected Shipping Rate
                  </h3>
                  <p className="text-sm text-blue-700">
                    {selectedRate.serviceName} - {selectedRate.deliveryTime}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-blue-900">
                    {formatCurrency(selectedRate.price, selectedRate.currency)}
                  </p>
                  <p className="text-sm text-blue-700">
                    Estimated {selectedRate.estimatedDays} days
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shipments List */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Shipments
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading shipments...</p>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No shipments yet
            </h3>
            <p className="text-gray-500">
              Create your first shipment using the calculator above
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {shipments.map((shipment) => (
              <div key={shipment.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                          shipment.status.code
                        )}`}
                      >
                        <Truck className="w-4 h-4" />
                        {shipment.status.description}
                      </div>
                      <span className="text-sm text-gray-500">
                        Created {formatDate(shipment.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">
                          Tracking Number
                        </h4>
                        <p className="text-sm font-medium text-gray-900">
                          {shipment.trackingNumber}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">
                          Service
                        </h4>
                        <p className="text-sm text-gray-900">
                          {shipment.selectedRate.serviceName}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-1">
                          Total Cost
                        </h4>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(
                            shipment.totalCost,
                            shipment.currency
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                          Origin
                        </h4>
                        <div className="text-sm text-gray-900">
                          <p>
                            {shipment.origin.firstName}{" "}
                            {shipment.origin.lastName}
                          </p>
                          <p>{shipment.origin.address}</p>
                          <p>
                            {shipment.origin.city}, {shipment.origin.state}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                          Destination
                        </h4>
                        <div className="text-sm text-gray-900">
                          <p>
                            {shipment.destination.firstName}{" "}
                            {shipment.destination.lastName}
                          </p>
                          <p>{shipment.destination.address}</p>
                          <p>
                            {shipment.destination.city},{" "}
                            {shipment.destination.state}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">
                        Packages
                      </h4>
                      <div className="space-y-2">
                        {shipment.packages.map((pkg, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 text-sm text-gray-900"
                          >
                            <Package className="w-4 h-4 text-gray-500" />
                            <span>{pkg.description}</span>
                            <span className="text-gray-500">
                              {pkg.weight}kg, {pkg.length}x{pkg.width}x
                              {pkg.height}cm
                            </span>
                            <span className="text-gray-500">
                              {formatCurrency(pkg.value, shipment.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="ml-6 flex flex-col gap-2">
                    {shipment.status.code !== "delivered" &&
                      shipment.status.code !== "cancelled" && (
                        <button
                          onClick={() => cancelShipment(shipment.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    <button className="px-3 py-1 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
