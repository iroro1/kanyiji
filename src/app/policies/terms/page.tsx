"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Shield,
  User,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Ban,
  Copyright,
  AlertTriangle,
  XCircle,
  Gavel,
  Zap,
  Mail,
  Phone,
  Globe,
  ChevronDown,
  CheckCircle,
  DollarSign,
} from "lucide-react";

export default function TermsConditionsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const effectiveDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Terms and Conditions of Use
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Effective Date: {effectiveDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Last Updated: {effectiveDate}</span>
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
            Welcome to Kanyiji! These Terms and Conditions ("Terms") govern your
            use of our e-commerce platform, including all content, products, and
            services offered on or through our website ("the Site"). By accessing
            or using this website, you agree to be bound by these Terms. If you
            do not agree, please do not use the Site.
          </p>
        </div>

        {/* Section 1: Definitions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("definitions")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  1. Definitions
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Key terms used in this agreement
                </p>
              </div>
            </div>
            {expandedSection === "definitions" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "definitions" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <div>
                    <strong>"Platform"</strong> means Kanyiji, including its
                    website, mobile app, and related services.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <div>
                    <strong>"User"</strong> refers to any person using the
                    Platform, including vendors, customers, and visitors.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <div>
                    <strong>"Vendor"</strong> refers to any person or business
                    listing or selling products on the Platform.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <div>
                    <strong>"Customer"</strong> refers to any person purchasing
                    products from vendors on the Platform.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <div>
                    <strong>"We," "Us," or "Our"</strong> refers to the
                    management or owners of Kanyiji.
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: Acceptance of Terms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("acceptance")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  2. Acceptance of Terms
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What you agree to by using the platform
                </p>
              </div>
            </div>
            {expandedSection === "acceptance" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "acceptance" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    By using our platform, you confirm that you are at least{" "}
                    <strong>18 years old</strong> or have legal capacity to
                    contract.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    You agree to comply with these Terms, our Privacy Policy, and
                    all applicable laws.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    We may modify these Terms at any time and your continued use
                    implies acceptance of the revised version.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 3: Account Registration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("registration")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  3. Account Registration
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Account creation and responsibilities
                </p>
              </div>
            </div>
            {expandedSection === "registration" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "registration" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>
                    Users must create an account to access certain features
                    (buying, selling, tracking orders).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>
                    You are responsible for maintaining the confidentiality of
                    your login credentials.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>
                    Provide accurate and up-to-date information and ensure all
                    activities under your account comply with these Terms.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>
                    We reserve the right to suspend or terminate any account that
                    violates these Terms.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 4: Vendor Obligations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("vendor")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  4. Vendor Obligations
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Requirements for vendors
                </p>
              </div>
            </div>
            {expandedSection === "vendor" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "vendor" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Provide true and accurate product information.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Sell only authentic and legally permitted items.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Fulfill orders promptly and maintain product quality.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Avoid fraudulent or misleading activities.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Comply with all applicable tax and regulatory requirements.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Do not list prohibited items (e.g., weapons, counterfeit
                    goods, endangered wildlife, expired food, drugs, or
                    pornographic content).
                  </span>
                </li>
              </ul>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  We reserve the right to suspend or delist any vendor who
                  breaches these rules.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Customer Responsibilities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("customer")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  5. Customer Responsibilities
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What customers must do
                </p>
              </div>
            </div>
            {expandedSection === "customer" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "customer" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Provide accurate shipping and payment details.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Pay for all purchases made through your account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Refrain from abusing return/refund privileges.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Do not engage in fraudulent transactions or activities that
                    harm vendors or the platform.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 6: Product Listings & Pricing */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("pricing")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  6. Product Listings & Pricing
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How products and prices are managed
                </p>
              </div>
            </div>
            {expandedSection === "pricing" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "pricing" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Prices, product descriptions, and availability are provided
                    by vendors.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Kanyiji is not responsible for any errors in listings or
                    changes made by vendors.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Prices may change without prior notice.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    We reserve the right to cancel or modify orders in case of
                    pricing or availability errors.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 7: Orders, Payments & Delivery */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("orders")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  7. Orders, Payments & Delivery
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Order processing and delivery terms
                </p>
              </div>
            </div>
            {expandedSection === "orders" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "orders" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Orders placed constitute an offer to purchase products.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Payments may be processed through approved gateways
                    (Paystack, Flutterwave, etc.).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Delivery timelines vary based on vendor and location.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Risk of loss passes to the customer upon confirmed delivery.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    We are not responsible for courier delays or force majeure
                    events.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 8: Returns, Refunds & Cancellations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("returns")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-pink-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  8. Returns, Refunds & Cancellations
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Return and refund policies
                </p>
              </div>
            </div>
            {expandedSection === "returns" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "returns" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    Returns and refunds are governed by our{" "}
                    <Link
                      href="/policies/return-refund"
                      className="text-primary-600 hover:text-primary-700 underline"
                    >
                      Return & Refund Policy
                    </Link>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    Eligible items must be returned in original condition within
                    the specified period.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    Refunds will be processed through the original payment method.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    Kanyiji reserves the right to reject claims that do not meet
                    policy requirements.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 9: Prohibited Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("prohibited")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Ban className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  9. Prohibited Activities
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Activities that are not allowed
                </p>
              </div>
            </div>
            {expandedSection === "prohibited" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "prohibited" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Do not engage in fraud, hacking, or unauthorized data access.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Do not use the platform for illegal or harmful purposes.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Do not post or transmit offensive, defamatory, or misleading
                    content.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Do not violate intellectual property rights of others.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Do not circumvent our payment or delivery systems.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 10: Intellectual Property */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("ip")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Copyright className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  10. Intellectual Property
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Platform content ownership
                </p>
              </div>
            </div>
            {expandedSection === "ip" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "ip" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>
                    All content, including text, graphics, and logos, is the
                    property of Kanyiji or its licensors.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>
                    Users may not reproduce or distribute platform content
                    without written permission.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 11: Limitation of Liability */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("liability")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  11. Limitation of Liability
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Platform liability limitations
                </p>
              </div>
            </div>
            {expandedSection === "liability" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "liability" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Kanyiji is not liable for indirect or consequential damages.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    We do not guarantee accuracy or availability of vendor
                    products.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Our total liability shall not exceed the amount paid for the
                    relevant product.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 12: Indemnification */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("indemnification")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  12. Indemnification
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your responsibility to protect the platform
                </p>
              </div>
            </div>
            {expandedSection === "indemnification" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "indemnification" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                You agree to indemnify and hold harmless Kanyiji and its
                employees from any claims or damages arising from your use of the
                platform.
              </p>
            </div>
          )}
        </div>

        {/* Section 13: Suspension & Termination */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("termination")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  13. Suspension & Termination
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  When accounts may be suspended or terminated
                </p>
              </div>
            </div>
            {expandedSection === "termination" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "termination" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                We may suspend or terminate any account without notice for fraud,
                violation, or security concerns.
              </p>
            </div>
          )}
        </div>

        {/* Section 14: Governing Law */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("governing")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Gavel className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  14. Governing Law
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Legal jurisdiction
                </p>
              </div>
            </div>
            {expandedSection === "governing" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "governing" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                These Terms are governed by the laws of the{" "}
                <strong>Federal Republic of Nigeria</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Section 15: Dispute Resolution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("disputes")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Gavel className="w-5 h-5 text-pink-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  15. Dispute Resolution
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How disputes are resolved
                </p>
              </div>
            </div>
            {expandedSection === "disputes" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "disputes" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                Disputes shall first be resolved amicably or referred to
                arbitration before court action.
              </p>
            </div>
          )}
        </div>

        {/* Section 16: Force Majeure */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("force")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  16. Force Majeure
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Events beyond our control
                </p>
              </div>
            </div>
            {expandedSection === "force" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "force" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                We are not responsible for failure to perform due to events
                beyond our control (e.g., natural disasters, strikes, war,
                internet disruptions).
              </p>
            </div>
          )}
        </div>

        {/* Section 17: Contact Information */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            17. Contact Information
          </h3>
          <div className="space-y-3 text-primary-50">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span>
                <strong>Kanyiji Support Team</strong>
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
              <Globe className="w-5 h-5" />
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

