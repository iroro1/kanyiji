"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  Truck,
  DollarSign,
  FileText,
  Shield,
  Ban,
  ClipboardCheck,
  TrendingUp,
  HelpCircle,
  ExternalLink,
  CheckSquare,
  Clock,
  MapPin,
} from "lucide-react";

export default function VendorOnboardingPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/vendor/dashboard"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vendor Onboarding Guide
              </h1>
              <p className="text-gray-600 mt-1">
                Everything you need to know to succeed on Kanyiji
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-3">Welcome to Kanyiji!</h2>
          <p className="text-primary-50 text-lg">
            This guide is designed to help you understand our platform policies,
            operational procedures, and expectations to ensure a successful
            partnership. Please read each section carefully to maintain compliance
            and maximize your store's performance.
          </p>
        </div>

        {/* Section 1: Authenticity & Counterfeit Policy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("authenticity")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Section 1: Authenticity & Counterfeit Policy
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Understanding what you must know about selling authentic products
                </p>
              </div>
            </div>
            {expandedSection === "authenticity" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "authenticity" && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  What You Must Know
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• All products sold on Kanyiji must be 100% genuine.</li>
                  <li>
                    • Fake, imitation, pirated, or bootleg items are strictly
                    prohibited.
                  </li>
                  <li>
                    • Even slight variations of logos, trademarks, or brand
                    identifiers without approval violate our policy.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-600" />
                  Prohibited Items Include
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Counterfeit goods</li>
                  <li>• Imitation brands</li>
                  <li>• Pirated media</li>
                  <li>• Unauthorized branded items</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Your Responsibility
                </h4>
                <p className="text-gray-700 ml-7">
                  Vendors must ensure all items listed are authentic and do not
                  infringe on any intellectual property rights. Being authentic also
                  refers to having the required licenses for your products (if any).
                  <a
                    href="https://nafdac.gov.ng/our-services/micro-small-medium-enterprises-msme1/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 ml-1 inline-flex items-center gap-1"
                  >
                    Click here
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  to see a list of products that require NAFDAC registration.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Violations Result In
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Product listing removal</li>
                  <li>• Suspension of product upload privileges</li>
                  <li>• Return or destruction of inventory (at your cost)</li>
                  <li>• Account suspension or termination</li>
                  <li>• Legal action (civil or criminal)</li>
                  <li>• Withheld payments</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  💸 Counterfeit Product Penalty System
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-yellow-200">
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">
                          Offense
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">
                          Action
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-900">
                          Penalty
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-yellow-100">
                        <td className="py-2 px-3 text-gray-700">First</td>
                        <td className="py-2 px-3 text-gray-700">
                          Product removed
                        </td>
                        <td className="py-2 px-3 text-gray-700">
                          ₦50,000 fine if no authenticity proof within 7 business
                          days
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-gray-700">Second</td>
                        <td className="py-2 px-3 text-gray-700">
                          Product removed + Store permanently delisted
                        </td>
                        <td className="py-2 px-3 text-gray-700">
                          ₦50,000 fine if no authenticity proof within 7 business
                          days
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  These penalties apply to all vendors (new or existing).
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>🆘 Need help?</strong>{" "}
                  <Link
                    href="/help"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Raise a Support Ticket
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Prohibited Product Policy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("prohibited")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Section 2: Prohibited Product Policy
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Strict no-sale items and compliance requirements
                </p>
              </div>
            </div>
            {expandedSection === "prohibited" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "prohibited" && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-600" />
                  Strict No-Sale Items
                </h4>
                <p className="text-gray-700 ml-7 mb-3">
                  The sale of illegal, unsafe, or non-compliant products is not
                  allowed. This includes:
                </p>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Banned substances or equipment</li>
                  <li>• Unsafe or defective items</li>
                  <li>• Anything prohibited under Nigerian law or Kanyiji policy</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Policy Requirements
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>
                    • All products must comply with local and international laws
                  </li>
                  <li>
                    • Vendors are responsible for staying updated with regulations
                  </li>
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Violations May Lead To
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Listing removal</li>
                  <li>• Product returns or destruction</li>
                  <li>• Account suspension</li>
                  <li>• Withheld payments</li>
                  <li>• Legal consequences</li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  Kanyiji reserves the right to determine product eligibility at its
                  discretion.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Quality Check Policy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("quality")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Section 3: Quality Check Policy
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What we check when products are dropped off
                </p>
              </div>
            </div>
            {expandedSection === "quality" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "quality" && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <p className="text-gray-700">
                Kanyiji conducts a quality inspection when products are dropped off.
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                  We Check
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Product packaging condition</li>
                  <li>• Product details (brand, size, model, color, specs)</li>
                  <li>• Authenticity and match with your online listing</li>
                  <li>• Proper labeling</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Common Reasons for Failing Quality Check
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• Counterfeit or used items</li>
                  <li>• Incorrect listings</li>
                  <li>• Damaged or incomplete packaging</li>
                  <li>• Missing product codes or labels</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  If your product fails quality control and you disagree,{" "}
                  <Link
                    href="/help"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Raise a Ticket
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Penalties */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("penalties")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Section 4: Penalties
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Understanding how penalties work and why they exist
                </p>
              </div>
            </div>
            {expandedSection === "penalties" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "penalties" && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Why Penalties Exist
                </h4>
                <p className="text-gray-700 ml-7">
                  To protect both:
                </p>
                <ul className="space-y-2 text-gray-700 ml-7 mt-2">
                  <li>• Customers – from low-quality or fake products</li>
                  <li>
                    • Vendors – from poor reviews, lost sales, and account
                    restrictions
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  How Penalties Work
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>
                    • Automatically deducted from your Vendor Stall account balance
                  </li>
                  <li>• No cash payment required</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  🔁 Repeat Offenders
                </h4>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    • <strong>1st offense:</strong> ₦50,000 fine + product removal
                  </li>
                  <li>
                    • <strong>2nd offense:</strong> ₦50,000 fine + store delisted
                    permanently
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Shipping & Delivery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("shipping")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Section 5: Shipping & Delivery
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How the shipping process works
                </p>
              </div>
            </div>
            {expandedSection === "shipping" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "shipping" && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  How It Works
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>• You store your own products</li>
                  <li>
                    • After receiving an order, you pack and deliver the item to
                    the nearest Kanyiji Drop-Off Station
                  </li>
                  <li>• Kanyiji delivers to the customer</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Packaging
                </h4>
                <p className="text-gray-700 ml-7">
                  Use either Kanyiji's or your own packaging (must be neat &
                  secure)
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Timeline
                </h4>
                <p className="text-gray-700 ml-7">
                  Orders must be delivered to the drop-off point within{" "}
                  <strong>48 hours</strong>
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Drop-Off Location
                </h4>
                <p className="text-gray-700 font-medium">
                  Plot 61, 11 Road, Festac Town, Lagos
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Operating Hours: Mon – Fri, 9 AM – 5 PM
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 6: Order Limits & Inventory Management */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("orders")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Section 6: Order Limits & Inventory Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Understanding OOS, DOL, and PSOL
                </p>
              </div>
            </div>
            {expandedSection === "orders" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "orders" && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  What is Out of Stock (OOS)?
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>
                    • If an order isn't delivered within 48 hours, it's marked as
                    OOS.
                  </li>
                  <li>
                    • Repeated OOS status affects your Daily Order Limit (DOL).
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Order Controls
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b">
                          Term
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 border-b">
                          Definition
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-3 px-4 text-gray-700 border-b font-medium">
                          DOL (Daily Order Limit)
                        </td>
                        <td className="py-3 px-4 text-gray-700 border-b">
                          Max number of orders you can receive daily
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          PSOL (Pending-to-Ship Order Limit)
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          Max number of orders allowed to remain in 'pending'
                          status
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Once these limits are reached, your products are hidden from the
                  website until you fulfill outstanding orders.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Inventory & Fulfillment Best Practices
                </h4>
                <div className="space-y-4 ml-7">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      1. Check Orders Frequently
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Log in to Vendor Stall 2x/day</li>
                      <li>• Go to: Orders &gt; Manage Orders &gt; Pending</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      2. Update Your Inventory Daily
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Don't list products you don't have</li>
                      <li>
                        • Only include incoming stock if it will arrive within 24
                        hours
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      3. Use FIFO Fulfillment (First In, First Out)
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Fulfill the oldest orders first</li>
                      <li>• Print and pack orders in sequence</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      4. Plan Your Fulfillment Schedule
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Know drop-off locations and hours</li>
                      <li>
                        • Allocate team members to process and pack orders
                        efficiently
                      </li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">
                      5. Going on Break? Use Holiday Mode
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>• Activate 2 working days before the break</li>
                      <li>• Complete all orders before enabling Holiday Mode</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 7: Vendor Earnings & Account Statement */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("earnings")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Section 7: Vendor Earnings & Account Statement
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Understanding your Vendor Dashboard
                </p>
              </div>
            </div>
            {expandedSection === "earnings" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "earnings" && (
            <div className="px-6 pb-6 space-y-6 border-t border-gray-200">
              <p className="text-gray-700">
                Track your sales, revenue, and deductions through your Vendor
                Stall account.
              </p>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Statement Breakdown
                </h4>
                <ul className="space-y-2 text-gray-700 ml-7">
                  <li>
                    • <strong>Due and Unpaid:</strong> Payments ready to be
                    transferred
                  </li>
                  <li>
                    • <strong>Open Statement:</strong> Current week's earnings
                    (paid the following week)
                  </li>
                  <li>
                    • <strong>360 Dashboard:</strong> Track delivery status of each
                    order
                  </li>
                  <li>
                    • <strong>Past Earnings:</strong> View last 3 months of payment
                    history
                  </li>
                </ul>
                <p className="text-sm text-gray-600 mt-3">
                  Access via: Vendor Stall &gt; Account Statements
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Final Checklist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-primary-600" />
              Final Checklist Before You Start Selling
            </h3>
          </div>
          <div className="px-6 py-6 space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I understand the Counterfeit Policy and will sell only authentic
                products
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I've reviewed the Prohibited Product List
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I've prepared my warehouse to fulfill and pack orders within 48
                hours
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I've reviewed how to avoid penalties and maintain a high seller
                score
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I know the drop-off location and its working hours
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-gray-700 group-hover:text-gray-900">
                I've explored my Vendor Stall and understand how to track orders &
                earnings
              </span>
            </label>
          </div>
        </div>

        {/* Need Help Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold mb-3">Need Help?</h3>
              <ul className="space-y-2 text-blue-50">
                <li>
                  • Use the{" "}
                  <Link
                    href="/help"
                    className="underline font-medium hover:text-white"
                  >
                    Support Ticket System
                  </Link>{" "}
                  for all concerns or disputes
                </li>
                <li>
                  • Stay informed with updates posted on your Vendor Stall
                  dashboard
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mt-8 text-center">
          <p className="text-2xl font-bold text-gray-900 mb-2">
            📢 Welcome to Kanyiji
          </p>
          <p className="text-lg text-gray-600">
            Let's grow your business together!
          </p>
        </div>
      </div>
    </div>
  );
}

