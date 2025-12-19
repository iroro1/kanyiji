"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Package,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  Globe,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import { calculateShippingFee, getShippingRates, type ShippingLocation } from "@/utils/shippingCalculator";

export default function ShippingDeliveryPolicyPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const effectiveDate = "November 2025";
  const lastUpdated = "November 2025";

  // Calculate shipping rates for common destinations (using 1kg as example)
  const exampleWeight = 1; // 1kg product + 1kg packaging = 2kg total
  const totalWeight = exampleWeight + 1; // Add 1kg for packaging

  const shippingExamples = useMemo(() => {
    const destinations: Array<{ name: string; location: ShippingLocation; type: string }> = [
      { name: "Lagos", location: { country: "Nigeria", state: "Lagos", city: "Lagos" }, type: "Standard" },
      { name: "Abuja", location: { country: "Nigeria", state: "FCT", city: "Abuja" }, type: "Standard" },
      { name: "Port Harcourt", location: { country: "Nigeria", state: "Rivers", city: "Port Harcourt" }, type: "Standard" },
      { name: "Kano", location: { country: "Nigeria", state: "Kano", city: "Kano" }, type: "Express" },
      { name: "Enugu", location: { country: "Nigeria", state: "Enugu", city: "Enugu" }, type: "Standard" },
      { name: "UK", location: { country: "UK" }, type: "International" },
      { name: "US", location: { country: "US" }, type: "International" },
    ];

    return destinations
      .map(dest => {
        const result = calculateShippingFee(totalWeight, dest.location);
        if (result) {
          return {
            ...dest,
            price: result.price,
            pricePerKg: result.pricePerKg,
          };
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [totalWeight]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/help"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Shipping & Delivery Policy
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Effective Date: {effectiveDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Last Updated: {lastUpdated}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to Kanyiji. This Shipping and Delivery Policy explains how we
            process, ship, and deliver your orders. Please review this policy
            carefully before making a purchase.
          </p>
        </div>

        {/* Section 1: Order Processing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("processing")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  1. Order Processing
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How we process your orders
                </p>
              </div>
            </div>
            {expandedSection === "processing" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "processing" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Orders are processed within <strong>1–3 business days</strong>{" "}
                    after payment confirmation.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Orders placed on weekends or public holidays will be processed
                    on the next working day.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Once your order has been processed, you will receive a
                    confirmation email containing tracking details.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: Shipping Options and Rates */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("shipping-options")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  2. Shipping Options and Rates
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Available delivery options and pricing
                </p>
              </div>
            </div>
            {expandedSection === "shipping-options" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "shipping-options" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                We offer multiple delivery options based on your location and
                preference:
              </p>
              <div className="space-y-3 ml-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Truck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Standard Delivery
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">3–7 business days</p>
                    <p className="text-xs text-gray-600">
                      Available for all Nigerian destinations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Express Delivery
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">2-4 business days</p>
                    <p className="text-xs text-gray-600">
                      Available for major cities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Package className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      International Delivery
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">7-14 business days</p>
                    <p className="text-xs text-gray-600">
                      Available for UK, US, Canada, and other international destinations
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Rate Examples */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Shipping Rate Examples (for {exampleWeight}kg product + packaging):
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {shippingExamples.map((example) => (
                    <div
                      key={example.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{example.name}</p>
                        <p className="text-xs text-gray-600">
                          {example.type === "International" ? "International" : "Domestic"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₦{example.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600">
                          ₦{example.pricePerKg.toLocaleString()}/kg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Rate Table */}
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Shipping Rates by Location (per kg):
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900">
                          Location
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                          Rate per kg
                        </th>
                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">
                          Example ({totalWeight}kg)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {shippingExamples.map((example) => (
                        <tr key={example.name} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-3 py-2 text-gray-700">
                            {example.name}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-gray-700">
                            ₦{example.pricePerKg.toLocaleString()}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right font-medium text-gray-900">
                            ₦{example.price.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Note:</strong> Shipping costs are calculated based on:
                </p>
                <ul className="text-sm text-gray-700 ml-4 space-y-1">
                  <li>• Product weight + 1kg packaging</li>
                  <li>• Destination location (city, state, country)</li>
                  <li>• Shipping method selected</li>
                </ul>
                <p className="text-sm text-gray-700 mt-3">
                  Exact rates are displayed at checkout before payment. Final shipping cost may vary based on actual product weight and your specific delivery address.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Delivery Coverage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("coverage")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  3. Delivery Coverage
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Where we deliver
                </p>
              </div>
            </div>
            {expandedSection === "coverage" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "coverage" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                We currently ship to all major cities and regions across:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span>North America</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span>South America</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span>Europe</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span>Africa</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span>Asia</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="w-4 h-4 text-primary-600" />
                  <span>Australia</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  Some remote areas may experience longer delivery times or limited
                  service.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Tracking Your Order */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("tracking")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  4. Tracking Your Order
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How to track your shipment
                </p>
              </div>
            </div>
            {expandedSection === "tracking" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "tracking" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Once your order is shipped, you will receive an email or SMS
                    with a tracking number and link.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    You can track your order directly from your Kanyiji account or
                    through the courier's website.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 5: Delivery Attempts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("attempts")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  5. Delivery Attempts
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What happens if delivery fails
                </p>
              </div>
            </div>
            {expandedSection === "attempts" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "attempts" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Our courier partners will make up to{" "}
                    <strong>two delivery attempts</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    If delivery fails after the final attempt, your order will be
                    returned to the vendor, and you may be charged for re-delivery.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Please ensure your delivery address and phone number are correct
                    to avoid delays or failed deliveries.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 6: Delivery Delays */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("delays")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  6. Delivery Delays
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Understanding potential delays
                </p>
              </div>
            </div>
            {expandedSection === "delays" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "delays" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                While we aim to deliver within the stated timeframes, delays may
                occur due to:
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    High order volumes during holidays or promotions.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Courier delays, weather conditions, or public restrictions.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Incorrect or incomplete shipping details provided by the
                    customer.
                  </span>
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  We will keep you informed of any significant delays.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 7: International Shipping */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("international")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  7. International Shipping
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Important information for international orders
                </p>
              </div>
            </div>
            {expandedSection === "international" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "international" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>
                    International orders may be subject to customs duties, import
                    taxes, or clearance fees, which are the{" "}
                    <strong>customer's responsibility</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>
                    Delivery timelines for international shipping vary based on
                    destination and customs processing times.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 8: Damaged or Missing Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("damaged")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  8. Damaged or Missing Items
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What to do if your order has issues
                </p>
              </div>
            </div>
            {expandedSection === "damaged" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "damaged" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                If your order arrives damaged or incomplete:
              </p>
              <ol className="space-y-3 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>
                    Notify our customer service team within{" "}
                    <strong>24 hours of delivery</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Provide clear photos or videos of the damaged package/item.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-red-100 text-red-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    We will verify and arrange a replacement or refund where
                    applicable.
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Section 9: Failed or Returned Deliveries */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("failed")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  9. Failed or Returned Deliveries
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What happens when delivery fails
                </p>
              </div>
            </div>
            {expandedSection === "failed" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "failed" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                If your order is returned due to an incorrect address or repeated
                failed delivery attempts:
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    You may be responsible for <strong>reshipping fees</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Refunds (if applicable) will exclude the original shipping
                    costs.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 10: Contact Information */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            10. Contact Information
          </h3>
          <p className="text-primary-50 mb-4">
            For delivery-related inquiries, please contact:
          </p>
          <div className="space-y-3 text-primary-50">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5" />
              <span>
                <strong>Kanyiji Logistics Support Team</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:support@kanyiji.ng"
                  className="underline hover:text-white"
                >
                  support@kanyiji.ng
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>
                <strong>Phone:</strong>{" "}
                <a href="tel:+2348177928061" className="underline hover:text-white">
                  +234 817 792 8061
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5" />
              <span>
                <strong>Website:</strong>{" "}
                <a
                  href="https://kanyiji.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-white"
                >
                  www.kanyiji.com
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

