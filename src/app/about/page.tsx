import { Users, Globe, Shield, Heart, Award, Star } from "lucide-react";

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

      {/* Mission & Vision */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              To create a sustainable digital marketplace that showcases the
              rich diversity of African craftsmanship, enabling local artisans
              and businesses to reach global markets while preserving
              traditional skills and cultural heritage.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe that every product tells a story - a story of
              tradition, innovation, and the vibrant spirit of Africa.
            </p>
          </div>
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl p-8">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Connecting Cultures
            </h3>
            <p className="text-gray-600">
              Building bridges between African artisans and global consumers
              through technology and trust.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Kanyiji
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Authenticity
              </h3>
              <p className="text-gray-600">
                We ensure every product is genuinely made in Africa, supporting
                local communities and preserving cultural heritage.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Trust & Quality
              </h3>
              <p className="text-gray-600">
                Building lasting relationships through transparent business
                practices and high-quality products.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Community
              </h3>
              <p className="text-gray-600">
                Supporting African artisans and businesses to grow and thrive in
                the global marketplace.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sustainability
              </h3>
              <p className="text-gray-600">
                Promoting eco-friendly practices and sustainable business models
                for long-term growth.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Excellence
              </h3>
              <p className="text-gray-600">
                Striving for excellence in every aspect of our service and
                product offerings.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Innovation
              </h3>
              <p className="text-gray-600">
                Embracing technology to create better experiences for both
                vendors and customers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Our Story
            </h3>
            <p className="text-gray-600">
              Born from a passion to showcase Africa's rich cultural heritage
              and support local artisans.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How It All Began
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              Kanyiji was founded with a simple yet powerful vision: to create a
              digital bridge between African artisans and the global market. We
              recognized that many talented craftspeople and businesses across
              Africa had incredible products but lacked access to wider markets.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Today, we're proud to connect thousands of customers worldwide
              with authentic African products, while helping local businesses
              grow and preserve their cultural traditions.
            </p>
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
            <button className="bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Become a Vendor
            </button>
            <button className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white hover:text-primary-600 transition-colors">
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
