"use client";

import { useState, useEffect } from "react";
import { X, Truck, MapPin, Clock, CheckCircle, Package, AlertCircle } from "lucide-react";
import { OrderTracking, TrackingEvent } from "@/types/orders";

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackingNumber: string;
  orderId: string;
}

export default function OrderTrackingModal({ 
  isOpen, 
  onClose, 
  trackingNumber, 
  orderId 
}: OrderTrackingModalProps) {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Dummy tracking data - in real app, this would come from API
  const dummyTrackingData: OrderTracking = {
    trackingNumber,
    carrier: "Gig Logistics",
    status: "In Transit",
    currentLocation: "Lagos Distribution Center",
    estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    lastUpdate: new Date(),
    history: [
      {
        id: "1",
        status: "Order Confirmed",
        description: "Your order has been confirmed and is being processed",
        location: "Lagos",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: "2",
        status: "Processing",
        description: "Your order is being prepared for shipment",
        location: "Lagos",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      },
      {
        id: "3",
        status: "Shipped",
        description: "Your order has been shipped and is on its way",
        location: "Lagos",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      },
      {
        id: "4",
        status: "In Transit",
        description: "Your order is in transit to your location",
        location: "Lagos Distribution Center",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    ],
  };

  useEffect(() => {
    if (isOpen && trackingNumber) {
      fetchTrackingInfo();
    }
  }, [isOpen, trackingNumber]);

  const fetchTrackingInfo = async () => {
    setLoading(true);
    setError("");

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would be an API call
      // const response = await fetch(`/api/orders/${orderId}/tracking`);
      // const data = await response.json();
      
      setTracking(dummyTrackingData);
    } catch (err) {
      setError("Failed to fetch tracking information");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "in transit":
        return <Truck className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Package className="w-5 h-5 text-purple-500" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "order confirmed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      case "in transit":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "shipped":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "processing":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "order confirmed":
        return "text-green-600 bg-green-50 border-green-200";
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Truck className="w-6 h-6 text-primary-500" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Track Order
                  </h3>
                  <p className="text-sm text-gray-500">
                    Order #{orderId} • {trackingNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Fetching tracking information...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-red-600">{error}</p>
                <button
                  onClick={fetchTrackingInfo}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : tracking ? (
              <div className="space-y-6">
                {/* Current Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Current Status</h4>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border mt-2 ${getStatusColor(tracking.status)}`}>
                        {getStatusIcon(tracking.status)}
                        {tracking.status}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Estimated Delivery</p>
                      <p className="font-medium text-gray-900">
                        {tracking.estimatedDelivery ? formatDate(tracking.estimatedDelivery) : "TBD"}
                      </p>
                    </div>
                  </div>
                  
                  {tracking.currentLocation && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Current Location: {tracking.currentLocation}</span>
                    </div>
                  )}
                </div>

                {/* Tracking Timeline */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Tracking History</h4>
                  <div className="space-y-4">
                    {tracking.history.map((event, index) => (
                      <div key={event.id} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                          {index < tracking.history.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(event.status)}
                            <div>
                              <h5 className="font-medium text-gray-900">{event.status}</h5>
                              {event.location && (
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                          <p className="text-xs text-gray-500">
                            {formatDate(event.timestamp)} • {formatTimeAgo(event.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
                  <p className="text-sm text-blue-700 mb-3">
                    If you have any questions about your shipment, our customer support team is here to help.
                  </p>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      Contact Support
                    </button>
                    <button className="px-4 py-2 bg-white text-blue-600 text-sm rounded-md border border-blue-200 hover:bg-blue-50 transition-colors">
                      View Order Details
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
