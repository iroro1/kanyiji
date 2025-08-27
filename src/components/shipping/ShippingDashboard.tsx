"use client";

import { useState } from "react";
import { Truck, Calculator, Search, BarChart3, Package, MapPin } from "lucide-react";
import ShippingCalculator from "./ShippingCalculator";
import ShipmentTracker from "./ShipmentTracker";
import ShipmentManager from "./ShipmentManager";

type ShippingTab = "calculator" | "tracker" | "manager";

export default function ShippingDashboard() {
  const [activeTab, setActiveTab] = useState<ShippingTab>("calculator");

  const tabs = [
    {
      id: "calculator" as ShippingTab,
      label: "Shipping Calculator",
      icon: Calculator,
      description: "Calculate shipping costs and rates",
    },
    {
      id: "tracker" as ShippingTab,
      label: "Track Shipment",
      icon: Search,
      description: "Track your shipments in real-time",
    },
    {
      id: "manager" as ShippingTab,
      label: "Shipment Manager",
      icon: Package,
      description: "Create and manage shipments",
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "calculator":
        return <ShippingCalculator />;
      case "tracker":
        return <ShipmentTracker />;
      case "manager":
        return <ShipmentManager />;
      default:
        return <ShippingCalculator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 py-6">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Truck className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipping Dashboard</h1>
              <p className="text-gray-600">Powered by Gig Logistics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? "border-primary-500 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            {(() => {
              const Icon = tabs.find(tab => tab.id === activeTab)?.icon || Calculator;
              return <Icon className="w-6 h-6 text-primary-500" />;
            })()}
            <h2 className="text-2xl font-semibold text-gray-900">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {renderTabContent()}
      </div>

      {/* Quick Stats */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Shipments</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">In Transit</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600">0</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-purple-100 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delivered</h3>
              <p className="text-3xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
