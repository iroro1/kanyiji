"use client";

import { useState } from "react";
import { Calculator, Package, MapPin, Clock, Truck } from "lucide-react";
import { ShippingAddress, Package as PackageType, ShippingRate } from "@/types/shipping";
import GigLogisticsService from "@/services/gigLogisticsService";

interface ShippingCalculatorProps {
  onRateSelect?: (rate: ShippingRate) => void;
  selectedRate?: ShippingRate;
}

export default function ShippingCalculator({ onRateSelect, selectedRate }: ShippingCalculatorProps) {
  const [origin, setOrigin] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });

  const [destination, setDestination] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    postalCode: "",
  });

  const [packages, setPackages] = useState<PackageType[]>([
    {
      id: "1",
      weight: 1,
      length: 20,
      width: 15,
      height: 10,
      description: "Product package",
      value: 1000,
      quantity: 1,
    },
  ]);

  const [rates, setRates] = useState<ShippingRate[]>([]);
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

  const handleAddressChange = (
    type: "origin" | "destination",
    field: keyof ShippingAddress,
    value: string
  ) => {
    if (type === "origin") {
      setOrigin(prev => ({ ...prev, [field]: value }));
    } else {
      setDestination(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePackageChange = (index: number, field: keyof PackageType, value: string | number) => {
    setPackages(prev => 
      prev.map((pkg, i) => 
        i === index ? { ...pkg, [field]: value } : pkg
      )
    );
  };

  const addPackage = () => {
    const newPackage: PackageType = {
      id: Date.now().toString(),
      weight: 1,
      length: 20,
      width: 15,
      height: 10,
      description: "Product package",
      value: 1000,
      quantity: 1,
    };
    setPackages(prev => [...prev, newPackage]);
  };

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateShipping = async () => {
    setLoading(true);
    setError("");
    setRates([]);

    try {
      const response = await gigLogisticsService.getShippingRates({
        origin,
        destination,
        packages,
      });

      if (response.success && response.rates) {
        setRates(response.rates);
      } else {
        setError(response.error || "Failed to get shipping rates");
      }
    } catch (err) {
      setError("An error occurred while calculating shipping");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight * pkg.quantity), 0);
  const totalValue = packages.reduce((sum, pkg) => sum + (pkg.value * pkg.quantity), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-semibold text-gray-900">Shipping Calculator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Origin Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-gray-900">Origin Address</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={origin.firstName}
              onChange={(e) => handleAddressChange("origin", "firstName", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={origin.lastName}
              onChange={(e) => handleAddressChange("origin", "lastName", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <input
            type="email"
            placeholder="Email"
            value={origin.email}
            onChange={(e) => handleAddressChange("origin", "email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <input
            type="tel"
            placeholder="Phone"
            value={origin.phone}
            onChange={(e) => handleAddressChange("origin", "phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <input
            type="text"
            placeholder="Address"
            value={origin.address}
            onChange={(e) => handleAddressChange("origin", "address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="City"
              value={origin.city}
              onChange={(e) => handleAddressChange("origin", "city", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="State"
              value={origin.state}
              onChange={(e) => handleAddressChange("origin", "state", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={origin.postalCode}
              onChange={(e) => handleAddressChange("origin", "postalCode", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Destination Address */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-500" />
            <h3 className="font-medium text-gray-900">Destination Address</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={destination.firstName}
              onChange={(e) => handleAddressChange("destination", "firstName", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={destination.lastName}
              onChange={(e) => handleAddressChange("destination", "lastName", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <input
            type="email"
            placeholder="Email"
            value={destination.email}
            onChange={(e) => handleAddressChange("destination", "email", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <input
            type="tel"
            placeholder="Phone"
            value={destination.phone}
            onChange={(e) => handleAddressChange("destination", "phone", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <input
            type="text"
            placeholder="Address"
            value={destination.address}
            onChange={(e) => handleAddressChange("destination", "address", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="City"
              value={destination.city}
              onChange={(e) => handleAddressChange("destination", "city", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="State"
              value={destination.state}
              onChange={(e) => handleAddressChange("destination", "state", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="text"
              placeholder="Postal Code"
              value={destination.postalCode}
              onChange={(e) => handleAddressChange("destination", "postalCode", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <h3 className="font-medium text-gray-900">Packages</h3>
          </div>
          <button
            onClick={addPackage}
            className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Add Package
          </button>
        </div>

        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <div key={pkg.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Package {index + 1}</h4>
                {packages.length > 1 && (
                  <button
                    onClick={() => removePackage(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <input
                  type="number"
                  placeholder="Weight (kg)"
                  value={pkg.weight}
                  onChange={(e) => handlePackageChange(index, "weight", parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Length (cm)"
                  value={pkg.length}
                  onChange={(e) => handlePackageChange(index, "length", parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Width (cm)"
                  value={pkg.width}
                  onChange={(e) => handlePackageChange(index, "width", parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Height (cm)"
                  value={pkg.height}
                  onChange={(e) => handlePackageChange(index, "height", parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <input
                  type="text"
                  placeholder="Description"
                  value={pkg.description}
                  onChange={(e) => handlePackageChange(index, "description", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  placeholder="Value (₦)"
                  value={pkg.value}
                  onChange={(e) => handlePackageChange(index, "value", parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Weight:</span>
              <span className="ml-2 font-medium">{totalWeight.toFixed(2)} kg</span>
            </div>
            <div>
              <span className="text-gray-600">Total Value:</span>
              <span className="ml-2 font-medium">₦{totalValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="text-center mb-6">
        <button
          onClick={calculateShipping}
          disabled={loading}
          className="px-8 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Calculating..." : "Calculate Shipping Rates"}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Shipping Rates */}
      {rates.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 mb-4">Available Shipping Rates</h3>
          
          <div className="grid gap-4">
            {rates.map((rate) => (
              <div
                key={rate.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedRate?.id === rate.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onRateSelect?.(rate)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary-500" />
                    <div>
                      <h4 className="font-medium text-gray-900">{rate.serviceName}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {rate.deliveryTime}
                        </span>
                        <span>{rate.estimatedDays} days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ₦{rate.price.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">{rate.currency}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
