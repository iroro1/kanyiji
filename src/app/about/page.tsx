import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            About
          </h1>
          <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Kanyiji is a global export-driven e-commerce platform born from a
            deep desire to showcase and celebrate Africa&apos;s rich resources.
          </p>
        </div>
      </div>

      {/* Main About Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Our journey began with a simple mission: to ensure that Africans in
            the diaspora always have a taste and feel of home.
          </p>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            We believe that Africa&apos;s beauty lies not only in its people but
            also in its culture, craftsmanship, and natural abundance. Every
            item we share tells a story of heritage, resilience, and creativity.
          </p>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            For us, it&apos;s more than just commerce—We exist to reposition
            African products.
          </p>

          <p className="text-lg text-gray-700 mb-4 leading-relaxed">
            Across the continent — from Nigeria to Ghana to Kenya — exceptional
            products are created daily.
          </p>
          <ul className="list-none text-lg text-gray-700 mb-6 space-y-1">
            <li>Fashion.</li>
            <li>Beauty.</li>
            <li>Wellness.</li>
            <li>Agro-products.</li>
            <li>Craftsmanship.</li>
            <li>Cultural goods.</li>
          </ul>
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            Yet too many remain limited to local markets.
          </p>
          <p className="text-xl font-semibold text-primary-700 mb-12">
            Kanyiji bridges that gap.
          </p>
        </div>
      </div>

      {/* Section Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-primary-300 mb-16" />
      </div>

      {/* Our Mission */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Our Mission
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          To empower African entrepreneurs and creators by providing a trusted,
          accessible, and globally connected e-commerce platform that showcases
          the richness, innovation, and diversity of African products to the
          world.
        </p>
        <p className="text-lg text-gray-700 mt-6 leading-relaxed">
          We believe African excellence deserves international positioning — not
          just participation.
        </p>
      </div>

      {/* Section Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-primary-300 mb-16" />
      </div>

      {/* Our Vision */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Our Vision
        </h2>
        <ul className="space-y-4 text-lg text-gray-700">
          <li>
            A world where African brands are globally recognized, trusted, and
            premium.
          </li>
          <li>
            A world where diaspora communities can access authentic African
            products seamlessly.
          </li>
          <li>
            A world where export is no longer limited to large corporations —
            but accessible to serious, quality-driven vendors.
          </li>
        </ul>
      </div>

      {/* Section Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-primary-300 mb-16" />
      </div>

      {/* What We Stand For */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
          What We Stand For
        </h2>
        <ul className="space-y-3 text-lg text-gray-700">
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Excellence
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Structure
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Branding
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Global positioning
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Digital visibility
          </li>
        </ul>
      </div>

      {/* Section Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-primary-300 mb-16" />
      </div>

      {/* Who We Work With */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Who We Work With
        </h2>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Kanyiji partners with vendors who are:
        </p>
        <ul className="space-y-3 text-lg text-gray-700 mb-8">
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Committed to quality.
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Ready for structured growth.
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Open to meeting export standards.
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0" />
            Serious about building global brands.
          </li>
        </ul>
        <p className="text-lg text-gray-700 italic leading-relaxed">
          We are not a marketplace for average.
        </p>
        <p className="text-lg text-gray-700 font-semibold mt-2 leading-relaxed">
          We are a platform for African excellence.
        </p>
      </div>

      {/* Section Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-primary-300 mb-16" />
      </div>

      {/* The Future */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          The Future
        </h2>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Export is no longer about containers.
        </p>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          It is about digital access, compliance, positioning, and trust.
        </p>
        <p className="text-xl font-semibold text-primary-700 mb-6">
          Kanyiji is building that bridge.
        </p>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          Kanyiji is not participating in global trade.
        </p>
        <p className="text-lg text-gray-700 mb-6 leading-relaxed">
          We are redefining Africa&apos;s place within it.
        </p>
        <p className="text-lg text-gray-700 font-medium leading-relaxed">
          And it starts here.
        </p>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Join the Kanyiji Family</h2>
          <p className="text-xl text-primary-100 mb-8">
            Whether you&apos;re a vendor looking to reach global markets or a
            customer seeking authentic African products, we&apos;re here to help
            you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/vendor/register"
              className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              Become a Vendor
            </Link>
            <Link
              href="/products"
              className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-primary-600 transition-colors text-center"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
