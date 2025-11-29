"use client";

import Link from "next/link";
import {
  FileText,
  Shield,
  RefreshCw,
  Truck,
  UserCheck,
  Globe,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

const policies = [
  {
    id: "terms",
    title: "Terms and Conditions of Use",
    description:
      "The terms and conditions that govern your use of the Kanyiji platform, including user obligations, prohibited activities, and dispute resolution.",
    icon: FileText,
    color: "blue",
    href: "/policies/terms",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    description:
      "How we collect, use, disclose, and safeguard your personal information when you use our platform.",
    icon: Shield,
    color: "green",
    href: "/policies/privacy",
  },
  {
    id: "return-refund",
    title: "Return & Refund Policy",
    description:
      "Our policy on returns, refunds, and exchanges. Learn about eligibility, the return process, and refund timelines.",
    icon: RefreshCw,
    color: "purple",
    href: "/policies/return-refund",
  },
  {
    id: "shipping-delivery",
    title: "Shipping & Delivery Policy",
    description:
      "Information about order processing, shipping options, delivery timelines, and tracking your orders.",
    icon: Truck,
    color: "orange",
    href: "/policies/shipping-delivery",
  },
  {
    id: "vendor-agreement",
    title: "Vendor Agreement",
    description:
      "The electronic contract between Kanyiji and vendors, covering obligations, payments, compliance, and more.",
    icon: UserCheck,
    color: "indigo",
    href: "/policies/vendor-agreement",
  },
  {
    id: "vendor-recruitment",
    title: "Vendor Recruitment Kit",
    description:
      "Information for Nigerian vendors looking to expand globally and connect with Nigerians in the diaspora.",
    icon: Globe,
    color: "teal",
    href: "/policies/vendor-recruitment",
  },
];

const colorClasses = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    border: "border-blue-200",
    hover: "hover:bg-blue-50",
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    border: "border-green-200",
    hover: "hover:bg-green-50",
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    border: "border-purple-200",
    hover: "hover:bg-purple-50",
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    border: "border-orange-200",
    hover: "hover:bg-orange-50",
  },
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    border: "border-indigo-200",
    hover: "hover:bg-indigo-50",
  },
  teal: {
    bg: "bg-teal-100",
    text: "text-teal-600",
    border: "border-teal-200",
    hover: "hover:bg-teal-50",
  },
};

export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Policies</h1>
              <p className="text-gray-600 mt-2 text-lg">
                All Kanyiji policies, terms, and agreements in one place
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <p className="text-gray-700 leading-relaxed text-lg">
            Welcome to Kanyiji's Policies page. Here you'll find all our terms,
            conditions, policies, and agreements. We recommend reading through
            the relevant policies before using our platform. If you have any
            questions, please{" "}
            <Link
              href="/help"
              className="text-primary-600 hover:text-primary-700 font-medium underline"
            >
              contact our support team
            </Link>
            .
          </p>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {policies.map((policy) => {
            const Icon = policy.icon;
            const colors = colorClasses[policy.color as keyof typeof colorClasses];

            return (
              <Link
                key={policy.id}
                href={policy.href}
                className={`bg-white rounded-xl shadow-sm border ${colors.border} p-6 hover:shadow-md transition-all group ${colors.hover}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {policy.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {policy.description}
                    </p>
                    <div className="flex items-center text-primary-600 font-medium text-sm">
                      <span>Read Policy</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            <HelpCircle className="w-6 h-6 text-primary-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Need Help?
              </h3>
              <p className="text-gray-700 mb-4">
                If you have questions about any of our policies or need
                clarification, our support team is here to help.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <HelpCircle className="w-4 h-4" />
                  Visit Help Center
                </Link>
                <Link
                  href="/vendor/onboarding"
                  className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <FileText className="w-4 h-4" />
                  Vendor Onboarding Guide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

