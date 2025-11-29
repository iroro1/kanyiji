"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Shield,
  Database,
  Eye,
  Share2,
  Cookie,
  Lock,
  Clock,
  UserCheck,
  Baby,
  Globe,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
} from "lucide-react";

export default function PrivacyPolicyPage() {
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
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600 mt-1">For Kanyiji E-Commerce Website</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Effective Date: {effectiveDate}</span>
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
            Kanyiji ("we", "our", "us") values your privacy and is committed to
            protecting the personal information of our customers, vendors, and
            website visitors. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our website,
            mobile application, and related services (collectively, the
            "Platform").
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>By accessing or using the Platform, you consent to the terms of this Privacy Policy.</strong>
            </p>
          </div>
        </div>

        {/* Section 1: Information We Collect */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("collect")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  1. Information We Collect
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Types of data we gather from users
                </p>
              </div>
            </div>
            {expandedSection === "collect" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "collect" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <ul className="space-y-3 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Account Information:</strong> Name, email address,
                    phone number, password, business name (for vendors).
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Transaction Information:</strong> Billing address,
                    shipping address, order history, payment details.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Device & Usage Information:</strong> IP address,
                    browser type, device identifiers, pages visited, cookies.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Vendor Information:</strong> Business registration
                    details, tax identification, bank account information.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Customer Support Records:</strong> Communications
                    with our support team.
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 2: How We Use Your Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("use")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  2. How We Use Your Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Purposes for which we process your data
                </p>
              </div>
            </div>
            {expandedSection === "use" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "use" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>To create and manage your account.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>To process and fulfill orders and payments.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    To facilitate communication between customers and vendors.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    To personalize user experience and improve the Platform.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    To detect, prevent, and address fraud or security issues.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    To comply with legal and regulatory requirements.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    To send marketing communications (only where legally
                    permitted and with opt-out options).
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 3: Sharing of Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("sharing")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  3. Sharing of Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Who we share your data with
                </p>
              </div>
            </div>
            {expandedSection === "sharing" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "sharing" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <div>
                    <strong>Vendors:</strong> To process and deliver customer
                    orders.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <div>
                    <strong>Service Providers:</strong> Logistics, payment
                    processors, IT support.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <div>
                    <strong>Regulatory Authorities:</strong> As required by law,
                    court order, or government request.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-600 mt-1">•</span>
                  <div>
                    <strong>Business Transfers:</strong> In case of merger,
                    acquisition, or sale of assets.
                  </div>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 4: Cookies & Tracking Technologies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("cookies")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Cookie className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  4. Cookies & Tracking Technologies
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How we use cookies and tracking
                </p>
              </div>
            </div>
            {expandedSection === "cookies" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "cookies" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Enable website functionality.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>Analyze usage patterns and improve services.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-orange-600 mt-1">•</span>
                  <span>
                    Deliver personalized advertisements and promotions.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 5: Data Security */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("security")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  5. Data Security
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How we protect your information
                </p>
              </div>
            </div>
            {expandedSection === "security" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "security" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                We implement appropriate technical and organizational measures to
                protect your personal data from unauthorized access, alteration, or
                disclosure. However, no method of transmission over the Internet
                is 100% secure.
              </p>
            </div>
          )}
        </div>

        {/* Section 6: Data Retention */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("retention")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  6. Data Retention
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How long we keep your data
                </p>
              </div>
            </div>
            {expandedSection === "retention" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "retention" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                We retain your personal information only as long as necessary to
                fulfill the purposes outlined in this policy, unless longer
                retention is required by law.
              </p>
            </div>
          )}
        </div>

        {/* Section 7: Your Rights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("rights")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  7. Your Rights
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your data protection rights
                </p>
              </div>
            </div>
            {expandedSection === "rights" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "rights" && (
            <div className="px-6 pb-6 space-y-3 border-t border-gray-200">
              <ul className="space-y-2 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Access, correct, or delete your personal data.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Restrict or object to processing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Withdraw consent for marketing communications.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-indigo-600 mt-1">•</span>
                  <span>Request data portability.</span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Section 8: Children's Privacy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("children")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Baby className="w-5 h-5 text-pink-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  8. Children's Privacy
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Our policy regarding children
                </p>
              </div>
            </div>
            {expandedSection === "children" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "children" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                Our services are not directed at children under 18. We do not
                knowingly collect personal data from children.
              </p>
            </div>
          )}
        </div>

        {/* Section 9: International Data Transfers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("transfers")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  9. International Data Transfers
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Cross-border data processing
                </p>
              </div>
            </div>
            {expandedSection === "transfers" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "transfers" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                If you are accessing our Platform from outside Nigeria, your
                information may be transferred to and processed in countries with
                different data protection laws.
              </p>
            </div>
          )}
        </div>

        {/* Section 10: Changes to This Privacy Policy */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("changes")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  10. Changes to This Privacy Policy
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  How we update this policy
                </p>
              </div>
            </div>
            {expandedSection === "changes" ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400 -rotate-90" />
            )}
          </button>

          {expandedSection === "changes" && (
            <div className="px-6 pb-6 border-t border-gray-200">
              <p className="text-gray-700 pt-4">
                We may update this Privacy Policy from time to time. Any changes
                will be posted with an updated effective date. Continued use of
                the Platform after changes indicates acceptance.
              </p>
            </div>
          )}
        </div>

        {/* Section 11: Contact Us */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Mail className="w-6 h-6" />
            11. Contact Us
          </h3>
          <p className="text-primary-50 mb-4">
            If you have any questions about this Privacy Policy or our data
            practices, please contact us:
          </p>
          <div className="space-y-3 text-primary-50">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span>
                <strong>Kanyiji</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5" />
              <span>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:privacy@kanyiji.com"
                  className="underline hover:text-white"
                >
                  privacy@kanyiji.com
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5" />
              <span>
                <strong>Phone:</strong>{" "}
                <a href="tel:+2348000000000" className="underline hover:text-white">
                  +234 800 000 0000
                </a>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <span>
                <strong>Address:</strong> Plot 61, 11 Road, Festac Town, Lagos,
                Nigeria
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

