"use client";

import { Shield, Truck, Heart, Star, Users, Globe } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Shield,
    title: "Trusted Vendors",
    description:
      "All vendors are verified and approved through our KYC process",
  },
  {
    icon: Truck,
    title: "Reliable Shipping",
    description: "Fast and secure shipping across Nigeria",
  },
  {
    icon: Heart,
    title: "Authentic Products",
    description: "Genuine Made-in-Nigeria products with cultural significance",
  },
  {
    icon: Star,
    title: "Quality Assured",
    description: "Rigorous quality checks and customer satisfaction guarantee",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Supporting Nigerian entrepreneurs and small businesses",
  },
  {
    icon: Globe,
    title: "Local Focus",
    description: "Connecting Nigerian products with customers worldwide",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Why Choose Kanyiji?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            We're committed to bringing you the best of Nigeria while supporting
            local communities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary-100 text-primary-600 rounded-full mb-3 sm:mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>

              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                {feature.title}
              </h3>

              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                10,000+
              </div>
              <div className="text-xs sm:text-sm text-primary-100">
                Happy Customers
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                500+
              </div>
              <div className="text-xs sm:text-sm text-primary-100">
                Verified Vendors
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                36
              </div>
              <div className="text-xs sm:text-sm text-primary-100">
                Nigerian States
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">
                99%
              </div>
              <div className="text-xs sm:text-sm text-primary-100">
                Satisfaction Rate
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Ready to Discover Nigeria?
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Join thousands of customers who trust Kanyiji for authentic Nigerian
            products. Start your journey today and experience the rich culture
            and craftsmanship of Nigeria.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href={"/products"}
              className="btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
            >
              Start Shopping Now
            </Link>
            <Link
              href={"/about"}
              className="btn-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
