'use client';

import { Shield, Truck, Heart, Star, Users, Globe } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Trusted Vendors',
    description: 'All vendors are verified and approved through our KYC process',
  },
  {
    icon: Truck,
    title: 'Reliable Shipping',
    description: 'Fast and secure shipping across Africa and worldwide',
  },
  {
    icon: Heart,
    title: 'Authentic Products',
    description: 'Genuine Made-in-Africa products with cultural significance',
  },
  {
    icon: Star,
    title: 'Quality Assured',
    description: 'Rigorous quality checks and customer satisfaction guarantee',
  },
  {
    icon: Users,
    title: 'Community Support',
    description: 'Supporting African artisans and small businesses',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connecting African products with customers worldwide',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="section-title">Why Choose Kanyiji?</h2>
          <p className="section-subtitle">
            We're committed to bringing you the best of Africa while supporting local communities
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                <feature.icon className="w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-2xl p-8 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">10,000+</div>
              <div className="text-primary-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-primary-100">Verified Vendors</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">50+</div>
              <div className="text-primary-100">African Countries</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">99%</div>
              <div className="text-primary-100">Satisfaction Rate</div>
            </div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Discover Africa?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of customers who trust Kanyiji for authentic African products. 
            Start your journey today and experience the rich culture and craftsmanship of Africa.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-4">
              Start Shopping Now
            </button>
            <button className="btn-outline text-lg px-8 py-4">
              Learn More About Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
