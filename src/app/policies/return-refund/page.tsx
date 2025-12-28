"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Package,
  CreditCard,
  AlertTriangle,
  Truck,
  Mail,
  Phone,
  Globe,
  Clock,
  Shield,
} from "lucide-react";

export default function ReturnRefundPolicyPage() {
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
                Return & Refund Policy
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
            Thank you for shopping with Kanyiji. We aim to ensure that all
            customers are satisfied with their purchases. However, if you are not
            completely happy with your order, please review our policy on returns
            and refunds below.
          </p>
        </div>

        {/* Section 1: Eligibility for Returns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("eligibility")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  1. Eligibility for Returns
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Conditions that must be met for returns
                </p>
              </div>
            </div>
            {expandedSection === "eligibility" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "eligibility" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                To qualify for a return, the following conditions must be met:
              </p>
              <ul className="space-y-3 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    The item must have been purchased through Kanyiji.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    The return request must be initiated within{" "}
                    <strong>24 hours of delivery</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    The product must be unused, unworn, unwashed, and in the same
                    condition as received.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    The product must be returned in its original packaging,
                    including all accessories, tags, manuals, and free gifts (if
                    applicable).
                  </span>
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  <strong>Note:</strong> Certain items cannot be returned for
                  hygiene or safety reasons (see "Non-returnable Items" below).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Non-Returnable Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("non-returnable")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  2. Non-Returnable Items
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Items that cannot be returned or refunded
                </p>
              </div>
            </div>
            {expandedSection === "non-returnable" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "non-returnable" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                The following items are not eligible for return or refund:
              </p>
              <ul className="space-y-3 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Perishable goods (e.g., food, flowers, beverages)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Personal care, beauty, or hygiene products (e.g., makeup,
                    razors, undergarments)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Customized, personalized, or made-to-order items
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>Downloadable software or digital goods</span>
                </li>
                <li className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Clearance or final-sale items marked as "non-refundable."
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 3: Return Process */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("process")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  3. Return Process
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How to initiate a return
                </p>
              </div>
            </div>
            {expandedSection === "process" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "process" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">To initiate a return:</p>
              <ol className="space-y-4 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Log into your Kanyiji account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Navigate to "My Orders" and select the item you wish to
                    return.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    Click "Request Return" and provide a reason for your return.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    4
                  </span>
                  <span>
                    Follow the instructions to schedule a pickup or drop off the
                    item at a designated location.
                  </span>
                </li>
              </ol>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-700">
                  Once received, the returned item will be inspected, and you will
                  be notified via email regarding the status of your refund or
                  exchange.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Refunds */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("refunds")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  4. Refunds
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How refunds are processed
                </p>
              </div>
            </div>
            {expandedSection === "refunds" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "refunds" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <ul className="space-y-3 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Refunds are processed only after the returned item passes
                    quality inspection.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Approved refunds will be credited to your original payment
                    method within <strong>5–10 business days</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Shipping costs are non-refundable unless the return is due to
                    a platform or vendor error (e.g., wrong or defective item).
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 5: Damaged, Defective, or Incorrect Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("damaged")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  5. Damaged, Defective, or Incorrect Items
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What to do if you receive a faulty item
                </p>
              </div>
            </div>
            {expandedSection === "damaged" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "damaged" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                If you receive a damaged, defective, or incorrect item:
              </p>
              <ul className="space-y-3 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Report it within <strong>24 hours of delivery</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Provide photo or video evidence showing the issue.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Our team will verify the claim and arrange a replacement or
                    refund at no extra cost.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 6: Late or Missing Refunds */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("late-refund")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  6. Late or Missing Refunds
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What to do if your refund hasn't arrived
                </p>
              </div>
            </div>
            {expandedSection === "late-refund" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "late-refund" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                If you haven't received your refund after the stated period:
              </p>
              <ol className="space-y-4 text-gray-700 ml-4">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Recheck your bank or mobile wallet account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    2
                  </span>
                  <span>
                    Contact your payment provider, as it may take time before your
                    refund is officially posted.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-yellow-100 text-yellow-700 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 mt-0.5">
                    3
                  </span>
                  <span>
                    If you still have not received your refund, please contact our
                    support team.
                  </span>
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Section 7: Vendor Returns */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("vendor-returns")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  7. Vendor Returns
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Returns for third-party vendor items
                </p>
              </div>
            </div>
            {expandedSection === "vendor-returns" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "vendor-returns" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <ul className="space-y-3 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>
                    For items sold by third-party vendors, the return and refund
                    process will follow the vendor's approved policy, as listed on
                    the product page.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Kanyiji acts as an intermediary and ensures all vendors comply
                    with our minimum return standards.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 8: Shipping Costs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("shipping-costs")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  8. Shipping Costs
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Who pays for return shipping
                </p>
              </div>
            </div>
            {expandedSection === "shipping-costs" ? (
              <XCircle className="w-5 h-5 text-gray-400" />
            ) : (
              <CheckCircle className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "shipping-costs" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <ul className="space-y-3 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    The customer is responsible for return shipping costs unless
                    the product is defective or incorrect.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>
                    In the case of a refund, shipping fees paid during checkout
                    may not be refunded.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 9: Contact Information */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            9. Contact Information
          </h3>
          <p className="text-primary-50 mb-4">
            If you have any questions about our Return & Refund Policy or need
            assistance with your return, please contact:
          </p>
          <div className="space-y-3 text-primary-50">
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

