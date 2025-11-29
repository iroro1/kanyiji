"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Globe,
  CheckCircle,
  Package,
  DollarSign,
  Truck,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  MapPin,
  Star,
  Zap,
} from "lucide-react";

export default function VendorRecruitmentPage() {
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
              <Globe className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vendor Recruitment Kit
              </h1>
              <p className="text-gray-600 mt-1">
                Nigerians in Diaspora – Expand Your Business Globally
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-8">
          <div className="flex items-start gap-4">
            <Globe className="w-8 h-8 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold mb-3">
                E-commerce Platform for Nigerian Vendors
              </h2>
              <p className="text-primary-50 text-lg leading-relaxed">
                Are you a Nigerian vendor looking to expand your business globally?
                Our platform connects you directly with Nigerians in the diaspora
                who crave authentic Nigerian products. From foodstuffs and fabrics
                to crafts and beauty products, this is your chance to grow your
                brand beyond borders.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("benefits")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Benefits of Becoming a Vendor
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Why join the Kanyiji vendor community
                </p>
              </div>
            </div>
            {expandedSection === "benefits" ? (
              <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
            ) : (
              <ArrowRight className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "benefits" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Users className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Access to Diaspora Market
                    </h4>
                    <p className="text-sm text-gray-700">
                      Access thousands of diaspora customers looking for Nigerian
                      products.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Secure Payments
                    </h4>
                    <p className="text-sm text-gray-700">
                      Guaranteed and secure payments for every transaction.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Truck className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Logistics Support
                    </h4>
                    <p className="text-sm text-gray-700">
                      We handle international shipping & delivery.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Marketing Support
                    </h4>
                    <p className="text-sm text-gray-700">
                      Increased visibility through our marketing campaigns.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg md:col-span-2">
                  <Globe className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      Trusted Community
                    </h4>
                    <p className="text-sm text-gray-700">
                      Be part of a trusted vendor community showcasing Nigeria
                      globally.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Requirements Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <button
            onClick={() => toggleSection("requirements")}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900">
                  Requirements for Vendors
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  What you need to get started
                </p>
              </div>
            </div>
            {expandedSection === "requirements" ? (
              <ArrowRight className="w-5 h-5 text-gray-400 rotate-90" />
            ) : (
              <ArrowRight className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === "requirements" && (
            <div className="px-6 pb-6 space-y-4 border-t border-gray-200">
              <ul className="space-y-3 text-gray-700 ml-4 pt-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Must be based in Nigeria</strong> and sell authentic
                    Nigerian products.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Ability to package goods</strong> for export quality
                    standards.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Commitment to timely order fulfillment</strong> within
                    our specified timelines.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Willingness to work</strong> with our logistics and
                    payment guidelines.
                  </span>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* How to Join Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  How to Join
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get started in 4 simple steps
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Step 1: Register on our platform
                  </h4>
                  <p className="text-gray-700 mb-3">
                    Create your vendor account via our vendor signup page.
                  </p>
                  <Link
                    href="/vendor/register"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Go to Vendor Signup
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Step 2: Submit product details
                  </h4>
                  <p className="text-gray-700">
                    Provide details of your products, pricing, and inventory
                    information.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Step 3: Get approved and onboarded
                  </h4>
                  <p className="text-gray-700">
                    Our team will review your application and onboard you as a
                    trusted vendor.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Step 4: Start receiving orders
                  </h4>
                  <p className="text-gray-700">
                    Begin receiving orders from Nigerians abroad and grow your
                    business globally!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-8 text-white text-center">
          <Globe className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">
            This is more than just selling products
          </h3>
          <p className="text-primary-50 text-lg mb-6 max-w-2xl mx-auto">
            It's about telling Nigeria's story to the world. Join us and become
            part of the movement showcasing authentic Nigerian products to the
            diaspora.
          </p>
          <Link
            href="/vendor/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Become a Vendor Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Additional Resources
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/vendor/onboarding"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <FileText className="w-5 h-5 text-primary-600" />
              <div>
                <h4 className="font-medium text-gray-900">Vendor Onboarding Guide</h4>
                <p className="text-sm text-gray-600">
                  Learn about policies and procedures
                </p>
              </div>
            </Link>
            <Link
              href="/help"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
            >
              <Users className="w-5 h-5 text-primary-600" />
              <div>
                <h4 className="font-medium text-gray-900">Support & Help</h4>
                <p className="text-sm text-gray-600">
                  Get assistance with your vendor account
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

