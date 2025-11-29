'use client';

import { useState } from 'react';
import { ArrowLeft, HelpCircle, MessageCircle, Phone, Mail, FileText, Search } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: "How do I place an order?",
    answer: "Browse our products, add items to your cart, and proceed to checkout. You can pay securely using Paystack or other available payment methods."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept various payment methods including Paystack (credit/debit cards), bank transfers, and mobile money. All payments are processed securely."
  },
  {
    question: "How long does shipping take?",
    answer: "Shipping times vary by location. Local deliveries typically take 2-5 business days, while international shipping can take 7-14 business days."
  },
  {
    question: "Can I return or exchange items?",
    answer: "Yes, we offer a 30-day return policy for most items. Products must be unused and in their original packaging. Contact our support team to initiate a return."
  },
  {
    question: "How do I become a vendor?",
    answer: "Click on 'Become a Vendor' in your profile dropdown or visit the vendor registration page. Complete the application form and provide required documentation."
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes, we take data security seriously. All personal information is encrypted and stored securely. We never share your data with third parties without consent."
  }
];

const supportChannels = [
  {
    icon: <MessageCircle className="w-6 h-6" />,
    title: "Live Chat",
    description: "Chat with our support team in real-time",
    available: "Available 24/7",
    action: "Start Chat"
  },
  {
    icon: <Phone className="w-6 h-6" />,
    title: "Phone Support",
    description: "Call us directly for immediate assistance",
    available: "Mon-Fri: 9AM-6PM",
    action: "Call Now"
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Email Support",
    description: "Send us a detailed message",
    available: "Response within 24h",
    action: "Send Email"
  }
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Find answers to common questions or get in touch with our support team.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
            />
          </div>
        </div>

        {/* Support Channels */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Get Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportChannels.map((channel, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {channel.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{channel.title}</h3>
                <p className="text-gray-600 mb-3">{channel.description}</p>
                <p className="text-sm text-primary-600 mb-4">{channel.available}</p>
                <button className="btn-primary w-full">
                  {channel.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      expandedFaq === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is ready to help you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3">
              <Mail className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700">support@kanyiji.com</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Phone className="w-5 h-5 text-primary-600" />
              <span className="text-gray-700">+234 801 234 5678</span>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/profile" className="text-primary-600 hover:text-primary-700 underline">
              My Profile
            </Link>
            <Link href="/orders" className="text-primary-600 hover:text-primary-700 underline">
              Order History
            </Link>
            <Link href="/policies/return-refund" className="text-primary-600 hover:text-primary-700 underline">
              Return & Refund Policy
            </Link>
            <Link href="/policies/vendor-recruitment" className="text-primary-600 hover:text-primary-700 underline">
              Vendor Recruitment
            </Link>
            <Link href="/vendor/register" className="text-primary-600 hover:text-primary-700 underline">
              Become a Vendor
            </Link>
            <Link href="/about" className="text-primary-600 hover:text-primary-700 underline">
              About Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
