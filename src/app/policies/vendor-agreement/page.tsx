"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Shield,
  CheckCircle,
  DollarSign,
  Package,
  RefreshCw,
  Copyright,
  Lock,
  Scale,
  AlertTriangle,
  XCircle,
  RefreshCcw,
  Gavel,
  ChevronDown,
} from "lucide-react";

export default function VendorAgreementPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
                Vendor Agreement
              </h1>
              <p className="text-gray-600 mt-1">
                Electronic Contract for Kanyiji
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            This Vendor Agreement ("Agreement") is made electronically between
            Kanyiji ("Platform", "we", "our") and the registering vendor
            ("Vendor", "you", "your"). By creating a Vendor account and listing
            products on the Platform, you agree to comply with the following
            terms:
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>By clicking "I Agree" or completing Vendor registration, you confirm that you have read, understood, and accepted the terms of this Agreement.</strong>
            </p>
          </div>
        </div>

        {/* Section 1: Vendor Eligibility & Account Registration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("eligibility")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  1. Vendor Eligibility & Account Registration
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Requirements for vendor registration
                </p>
              </div>
            </div>
            {expandedSection === "eligibility" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "eligibility" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Vendor must provide accurate and verifiable business
                    information, tax identification, bank account details, and
                    licenses where required.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Vendor shall keep all account information current and updated
                    at all times.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    The Platform reserves the right to verify, approve, or
                    reject any Vendor application at its sole discretion.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: Product Listings & Compliance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("listings")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  2. Product Listings & Compliance
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Requirements for product listings
                </p>
              </div>
            </div>
            {expandedSection === "listings" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "listings" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Vendor shall ensure that all product information
                    (descriptions, prices, images, specifications) is accurate,
                    non-misleading, and complies with applicable laws.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Prohibited products (including counterfeit, unsafe, or
                    restricted goods) are not permitted.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    The Platform reserves the right to remove listings that
                    violate policies or applicable regulations without prior
                    notice.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 3: Pricing, Payments & Fees */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("payments")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  3. Pricing, Payments & Fees
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Payment terms and fee structure
                </p>
              </div>
            </div>
            {expandedSection === "payments" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "payments" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Vendor determines product prices but shall not unreasonably
                    inflate prices compared to other channels.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    The Platform will deduct commissions, service fees, logistics
                    charges, and applicable taxes from sales before remitting
                    payments.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    Payments will be made on a <strong>bi-weekly cycle</strong>{" "}
                    to the Vendor's registered bank account.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    The Platform reserves the right to withhold payments for
                    disputed or fraudulent transactions.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 4: Order Fulfillment & Logistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("fulfillment")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  4. Order Fulfillment & Logistics
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Fulfillment requirements and logistics
                </p>
              </div>
            </div>
            {expandedSection === "fulfillment" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "fulfillment" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>
                    Vendor shall process and deliver orders within agreed
                    timelines.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>
                    Vendor may opt for Platform-supported logistics or approved
                    self-shipping methods.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>
                    Failure to fulfill confirmed orders may result in penalties,
                    suspension, or termination.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 5: Returns, Refunds & Customer Protection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("returns")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  5. Returns, Refunds & Customer Protection
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Return and refund obligations
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
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Vendor agrees to comply with the Platform's return and refund
                    policy.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Returned products due to defects, incorrect items, or
                    non-conformity will be borne by the Vendor.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    The Platform may issue refunds to customers directly and
                    recover costs from the Vendor if the Vendor is at fault.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 6: Intellectual Property */}
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
                  6. Intellectual Property
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  IP rights and licensing
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
                    Vendor represents and warrants ownership or legal rights to
                    sell all listed products.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>
                    Vendor grants the Platform a non-exclusive, royalty-free
                    license to use product descriptions, images, and trademarks
                    for listing and promotional purposes.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>
                    Vendor shall indemnify the Platform against any third-party
                    claims of IP infringement.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 7: Data Protection & Confidentiality */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("data")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  7. Data Protection & Confidentiality
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Data handling and privacy obligations
                </p>
              </div>
            </div>
            {expandedSection === "data" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "data" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>
                    Vendor shall not misuse customer data obtained through the
                    Platform and may only use such data for order fulfillment.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>
                    Vendor agrees to comply with applicable data protection and
                    privacy laws.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-teal-600 mt-1">•</span>
                  <span>
                    Confidential information shared by the Platform must not be
                    disclosed to third parties.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 8: Compliance with Laws */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("compliance")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  8. Compliance with Laws
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Legal compliance requirements
                </p>
              </div>
            </div>
            {expandedSection === "compliance" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "compliance" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Vendor shall comply with all relevant consumer protection,
                    tax, import/export, and product safety laws.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>
                    Vendor is responsible for remitting applicable taxes unless
                    otherwise managed by the Platform.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 9: Dispute Resolution */}
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
                  9. Dispute Resolution
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
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    Disputes shall first be resolved amicably through good faith
                    negotiation.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-pink-600 mt-1">•</span>
                  <span>
                    If unresolved, disputes will be referred to binding
                    arbitration in Nigeria, under the rules of the{" "}
                    <strong>Arbitration and Mediation Act 2023 (AMA)</strong>.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 10: Suspension & Termination */}
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
                  10. Suspension & Termination
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Conditions for account suspension or termination
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
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                The Platform may suspend or terminate Vendor accounts for:
              </p>
              <ul className="space-y-2 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Breach of this Agreement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Sale of counterfeit or prohibited products</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Fraudulent or unethical practices</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-600 mt-1">•</span>
                  <span>Excessive customer complaints</span>
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  Vendor may terminate this Agreement with{" "}
                  <strong>30 days' notice</strong>, subject to outstanding
                  obligations.
                </p>
              </div>
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
                    The Platform acts as an intermediary and is not liable for
                    Vendor's obligations, product defects, or representations.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>
                    The Platform's liability shall not exceed the total
                    commission earned on the disputed transaction.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 12: Amendments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("amendments")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <RefreshCcw className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  12. Amendments
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How this agreement can be updated
                </p>
              </div>
            </div>
            {expandedSection === "amendments" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "amendments" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 mt-1">•</span>
                  <span>
                    The Platform may amend this Agreement at any time, with
                    notice provided through email or Vendor dashboard.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gray-600 mt-1">•</span>
                  <span>
                    Continued use of the Platform constitutes acceptance of the
                    updated terms.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 13: Governing Law */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Gavel className="w-6 h-6" />
            13. Governing Law
          </h3>
          <p className="text-primary-50">
            This Agreement shall be governed and interpreted in accordance with
            the laws of the <strong>Federal Republic of Nigeria</strong>.
          </p>
        </div>

        {/* Agreement Acceptance Notice */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border-2 border-primary-200 p-6">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Agreement Acceptance
              </h3>
              <p className="text-gray-700">
                By clicking "I Agree" or completing Vendor registration, you
                confirm that you have read, understood, and accepted the terms of
                this Agreement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

