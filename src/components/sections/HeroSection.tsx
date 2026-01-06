"use client";

import { Users, ShoppingBag, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1 + 0.4,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
};

export default function HeroSection() {
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[80vh] flex items-center overflow-hidden bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            className="relative z-10 py-8 sm:py-12 lg:py-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Main Heading */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight"
              variants={itemVariants}
            >
              Discover Authentic
              <motion.span
                className="block text-primary-600 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Made-in-Africa
              </motion.span>
              Products
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg sm:text-xl text-gray-700 mb-4 sm:mb-6 leading-relaxed"
              variants={itemVariants}
            >
              Connect with African entrepreneurs, brands, and businesses. Shop unique
              products that tell the story of Africa's rich heritage.
            </motion.p>
            
            {/* App Functionality Description */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed"
              variants={itemVariants}
            >
              <strong className="text-gray-900">Kanyiji</strong> is an e-commerce marketplace connecting customers with authentic Made-in-Africa products. 
              Browse and purchase from verified Nigerian vendors, manage orders, and enjoy secure payment processing with reliable shipping.
            </motion.p>

            {/* Stats Section - Horizontal Layout */}
            <motion.div
              className="grid grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
              variants={itemVariants}
            >
              {[
                { icon: Users, value: "100+", label: "Vendors" },
                { icon: ShoppingBag, value: "1000+", label: "Products" },
                { icon: Globe, value: "1", label: "Country" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center sm:text-left"
                  variants={statVariants}
                  custom={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className="inline-flex items-center justify-center sm:justify-start w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl mb-2 sm:mb-3"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={"/products"}
                  className="group bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
                >
                  Start Shopping
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.span>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Side - Image */}
          <motion.div
            className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.img
              src="https://images.pexels.com/photos/6192182/pexels-photo-6192182.jpeg"
              alt="Colorful African artwork - Vibrant traditional art with rich colors and patterns"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to another colorful African artwork
                e.currentTarget.src = "https://images.unsplash.com/photo-1601925260368-ae2f83d8b8b8?w=1200&q=80";
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.6 }}
            />
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
