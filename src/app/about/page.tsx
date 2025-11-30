import {
  Users,
  Globe,
  Shield,
  Heart,
  Award,
  Star,
  CheckCircle,
  ShoppingBag,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            About Kanyiji
          </h1>
          <p className="text-xl sm:text-2xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            Connecting the world with authentic Made-in-Africa products,
            empowering local artisans and businesses while preserving cultural
            heritage.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Born from a deep desire to showcase and celebrate Africa's rich
              resources, our journey began with a simple mission: to ensure that
              Africans in the diaspora always have a taste and feel of home.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              We believe that Africa's beauty lies not only in its people but
              also in its culture, craftsmanship, and natural abundance. From
              authentic foods and natural wellness products to handcrafted fashion
              and homeware, every item we share tells a story of heritage,
              resilience, and creativity.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              For us, it's more than just commerce—it's about connection. Every
              package we deliver carries a piece of Africa's soul, reminding
              our brothers and sisters abroad that distance should never mean
              disconnection.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Whether it's the comfort of familiar flavors, the pride of wearing
              African fashion, or the joy of surrounding yourself with pieces
              that echo our traditions, our mission is to bring Africa closer to
              you—wherever you are in the world.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              We are here to preserve memories, promote African talent, and build
              a bridge between home and abroad, one product at a time.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Kanyiji */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Kanyiji?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              What makes us the trusted choice for authentic African products
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 border border-primary-200">
              <div className="bg-primary-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Authenticity You Can Trust
              </h3>
              <p className="text-gray-700">
                Every product is sourced directly from Africa through trusted
                vendors, crafted with care, and tells a story of culture,
                tradition, and heritage.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
              <div className="bg-orange-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                A Taste of Home, Anywhere
              </h3>
              <p className="text-gray-700">
                For Africans in the diaspora, we bring you closer to home—through
                the food, fashion, and art you know and love.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Quality Meets Culture
              </h3>
              <p className="text-gray-700">
                Carefully curated products that meet international standards
                while preserving the originality of Africa's resources.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="bg-purple-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Empowering Africa, One Purchase at a Time
              </h3>
              <p className="text-gray-700">
                By shopping with us, you support African artisans, farmers, and
                creators, helping communities grow and thrive.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Seamless Shopping, Global Delivery
              </h3>
              <p className="text-gray-700">
                From checkout to your doorstep, we make sure your experience is
                smooth, reliable, and stress-free.
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Stats */}
      <div className="bg-primary-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Kanyiji by the Numbers</h2>
            <p className="text-primary-100 text-lg">
              Our impact in connecting Africa with the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-primary-100">African Vendors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-primary-100">Unique Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-primary-100">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-primary-100">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Team */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Dedicated professionals passionate about connecting Africa with the
            world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-4xl">👨‍💼</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              CEO & Founder
            </h3>
            <p className="text-gray-600 mb-3">
              Visionary leader with deep roots in African business
            </p>
            <p className="text-sm text-primary-600">10+ years experience</p>
          </div>

          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-4xl">👩‍💻</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">CTO</h3>
            <p className="text-gray-600 mb-3">
              Technology expert building the future of e-commerce
            </p>
            <p className="text-sm text-primary-600">15+ years experience</p>
          </div>

          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="text-4xl">👨‍🤝‍👨</div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Head of Operations
            </h3>
            <p className="text-gray-600 mb-3">
              Ensuring smooth operations and vendor success
            </p>
            <p className="text-sm text-primary-600">8+ years experience</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-6">Join the Kanyiji Family</h2>
          <p className="text-xl text-primary-100 mb-8">
            Whether you're a vendor looking to reach global markets or a
            customer seeking authentic African products, we're here to help you
            succeed.
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
