"use client";

import { useState } from "react";
import { MapPin, User, Mail, Phone, Home, Building, Globe, Hash } from "lucide-react";
import { ShippingAddress } from "@/types/shipping";
import { validateShippingAddress } from "@/lib/shipping";

interface AddressFormProps {
  address: ShippingAddress;
  onAddressChange: (address: ShippingAddress) => void;
  title: string;
  type: "origin" | "destination";
  errors?: string[];
}

export default function AddressForm({ 
  address, 
  onAddressChange, 
  title, 
  type,
  errors = []
}: AddressFormProps) {
  const [localErrors, setLocalErrors] = useState<string[]>([]);

  const handleFieldChange = (field: keyof ShippingAddress, value: string) => {
    const updatedAddress = { ...address, [field]: value };
    onAddressChange(updatedAddress);
    
    // Clear field-specific errors
    if (localErrors.length > 0) {
      setLocalErrors([]);
    }
  };

  const validateField = (field: keyof ShippingAddress) => {
    const validation = validateShippingAddress(address);
    const fieldErrors = validation.errors.filter(error => 
      error.toLowerCase().includes(field.toLowerCase())
    );
    setLocalErrors(fieldErrors);
  };

  const getFieldError = (field: keyof ShippingAddress): string | undefined => {
    const allErrors = [...errors, ...localErrors];
    return allErrors.find(error => 
      error.toLowerCase().includes(field.toLowerCase())
    );
  };

  const getIconColor = () => {
    return type === "origin" ? "text-green-500" : "text-red-500";
  };

  const getBorderColor = (field: keyof ShippingAddress) => {
    const hasError = getFieldError(field);
    return hasError ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-primary-500 focus:ring-primary-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MapPin className={`w-5 h-5 ${getIconColor()}`} />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={address.firstName}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              onBlur={() => validateField("firstName")}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("firstName")}`}
              placeholder="First Name"
            />
          </div>
          {getFieldError("firstName") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("firstName")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={address.lastName}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              onBlur={() => validateField("lastName")}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("lastName")}`}
              placeholder="Last Name"
            />
          </div>
          {getFieldError("lastName") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("lastName")}</p>
          )}
        </div>
      </div>

      {/* Contact Fields */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={address.email}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              onBlur={() => validateField("email")}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("email")}`}
              placeholder="email@example.com"
            />
          </div>
          {getFieldError("email") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("email")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={address.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              onBlur={() => validateField("phone")}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("phone")}`}
              placeholder="+234 801 234 5678"
            />
          </div>
          {getFieldError("phone") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("phone")}</p>
          )}
        </div>
      </div>

      {/* Address Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Street Address *
        </label>
        <div className="relative">
          <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={address.address}
            onChange={(e) => handleFieldChange("address", e.target.value)}
            onBlur={() => validateField("address")}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("address")}`}
            placeholder="123 Main Street, Apartment 4B"
          />
        </div>
        {getFieldError("address") && (
          <p className="mt-1 text-sm text-red-600">{getFieldError("address")}</p>
        )}
      </div>

      {/* City, State, Postal Code */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={address.city}
              onChange={(e) => handleFieldChange("city", e.target.value)}
              onBlur={() => validateField("city")}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("city")}`}
              placeholder="City"
            />
          </div>
          {getFieldError("city") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("city")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={address.state}
              onChange={(e) => handleFieldChange("state", e.target.value)}
              onBlur={() => validateField("state")}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("state")}`}
            >
              <option value="">Select State</option>
              <option value="Abia">Abia</option>
              <option value="Adamawa">Adamawa</option>
              <option value="Akwa Ibom">Akwa Ibom</option>
              <option value="Anambra">Anambra</option>
              <option value="Bauchi">Bauchi</option>
              <option value="Bayelsa">Bayelsa</option>
              <option value="Benue">Benue</option>
              <option value="Borno">Borno</option>
              <option value="Cross River">Cross River</option>
              <option value="Delta">Delta</option>
              <option value="Ebonyi">Ebonyi</option>
              <option value="Edo">Edo</option>
              <option value="Ekiti">Ekiti</option>
              <option value="Enugu">Enugu</option>
              <option value="FCT">Federal Capital Territory</option>
              <option value="Gombe">Gombe</option>
              <option value="Imo">Imo</option>
              <option value="Jigawa">Jigawa</option>
              <option value="Kaduna">Kaduna</option>
              <option value="Kano">Kano</option>
              <option value="Katsina">Katsina</option>
              <option value="Kebbi">Kebbi</option>
              <option value="Kogi">Kogi</option>
              <option value="Kwara">Kwara</option>
              <option value="Lagos">Lagos</option>
              <option value="Nasarawa">Nasarawa</option>
              <option value="Niger">Niger</option>
              <option value="Ogun">Ogun</option>
              <option value="Ondo">Ondo</option>
              <option value="Osun">Osun</option>
              <option value="Oyo">Oyo</option>
              <option value="Plateau">Plateau</option>
              <option value="Rivers">Rivers</option>
              <option value="Sokoto">Sokoto</option>
              <option value="Taraba">Taraba</option>
              <option value="Yobe">Yobe</option>
              <option value="Zamfara">Zamfara</option>
            </select>
          </div>
          {getFieldError("state") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("state")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code *
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={address.postalCode}
              onChange={(e) => handleFieldChange("postalCode", e.target.value)}
              onBlur={() => validateField("postalCode")}
              className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("postalCode")}`}
              placeholder="123456"
            />
          </div>
          {getFieldError("postalCode") && (
            <p className="mt-1 text-sm text-red-600">{getFieldError("postalCode")}</p>
          )}
        </div>
      </div>

      {/* Country Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Country *
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={address.country}
            onChange={(e) => handleFieldChange("country", e.target.value)}
            onBlur={() => validateField("country")}
            className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 ${getBorderColor("country")}`}
            placeholder="Nigeria"
          />
        </div>
        {getFieldError("country") && (
          <p className="mt-1 text-sm text-red-600">{getFieldError("country")}</p>
        )}
      </div>
    </div>
  );
}
