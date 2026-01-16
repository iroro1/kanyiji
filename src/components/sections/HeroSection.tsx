"use client";

import { Users, ShoppingBag, Globe, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

// Import banner images
import banner1 from "../../assets/banners/Banner 1.jpg";
import banner2 from "../../assets/banners/Banner 2.jpg";
import banner3 from "../../assets/banners/Banner 3 corrected .jpg";
import banner4 from "../../assets/banners/Banner 4 corrected .jpg";
import banner5 from "../../assets/banners/Banner 5 New.jpg";
import banner6 from "../../assets/banners/Banner 6 corrected .jpg";
import banner7 from "../../assets/banners/Banner 7.jpg";
import banner8 from "../../assets/banners/Banner 8.jpg";
import banner9 from "../../assets/banners/Banner 9 New.jpg";
import banner10 from "../../assets/banners/Banner 10 corrected .jpg";

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

const bannerSlides = [
  {
    id: 1,
    image: banner1,
    title: "Featured Collection",
    subtitle: "Discover our handpicked selection",
  },
  {
    id: 2,
    image: banner2,
    title: "New Arrivals",
    subtitle: "Latest products from African artisans",
  },
  {
    id: 3,
    image: banner3,
    title: "Special Offers",
    subtitle: "Exclusive deals on authentic products",
  },
  {
    id: 4,
    image: banner4,
    title: "Authentic African Products",
    subtitle: "Shop unique items from verified vendors",
  },
  {
    id: 5,
    image: banner5,
    title: "Premium Quality",
    subtitle: "Handcrafted with care and tradition",
  },
  {
    id: 6,
    image: banner6,
    title: "Cultural Heritage",
    subtitle: "Celebrate Africa's rich traditions",
  },
  {
    id: 7,
    image: banner7,
    title: "Trending Now",
    subtitle: "Discover what's popular this season",
  },
  {
    id: 8,
    image: banner8,
    title: "Best Sellers",
    subtitle: "Top-rated products from our vendors",
  },
  {
    id: 9,
    image: banner9,
    title: "Limited Edition",
    subtitle: "Exclusive items available now",
  },
  {
    id: 10,
    image: banner10,
    title: "Shop with Confidence",
    subtitle: "Secure payments and reliable shipping",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };
  return (
    <section className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[85vh] flex items-center overflow-hidden">
      {/* Background Image Banner */}
      <div className="absolute inset-0 z-0">
        <motion.img
          src="https://images.pexels.com/photos/6192182/pexels-photo-6192182.jpeg"
          alt="Colorful African artwork - Vibrant traditional art with rich colors and patterns"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1601925260368-ae2f83d8b8b8?w=1200&q=80";
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/70 to-gray-900/60" />
        {/* Accent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Text Content */}
          <motion.div
            className="max-w-3xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          {/* Main Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg"
            variants={itemVariants}
          >
            Discover Authentic
            <motion.span
              className="block text-primary-300 mt-2"
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
            className="text-lg sm:text-xl lg:text-2xl text-gray-100 mb-4 sm:mb-6 leading-relaxed drop-shadow-md"
            variants={itemVariants}
          >
            Connect with African entrepreneurs, brands, and businesses. Shop unique
            products that tell the story of Africa's rich heritage.
          </motion.p>
          
          {/* App Functionality Description */}
          <motion.p
            className="text-base sm:text-lg text-gray-200 mb-6 sm:mb-8 leading-relaxed max-w-2xl drop-shadow-sm"
            variants={itemVariants}
          >
            <strong className="text-white">Kanyiji</strong> is an e-commerce marketplace connecting customers with authentic Made-in-Africa products. 
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
                  className="inline-flex items-center justify-center sm:justify-start w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-xl mb-2 sm:mb-3 border border-white/30"
                  whileHover={{ rotate: 360, backgroundColor: "rgba(255, 255, 255, 0.3)" }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1 drop-shadow-md">{stat.value}</h3>
                <p className="text-xs sm:text-sm text-gray-200 font-medium">{stat.label}</p>
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
                className="group bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center backdrop-blur-sm border border-white/20"
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

          {/* Right Side - Banner Slider (Desktop Only) */}
          <motion.div
            className="hidden lg:block relative h-[500px] rounded-2xl overflow-hidden shadow-2xl"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="relative w-full h-full">
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={currentSlide}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                  className="absolute inset-0"
                >
                  <div className="relative w-full h-full bg-gray-100">
                    <Image
                      src={bannerSlides[currentSlide].image}
                      alt={bannerSlides[currentSlide].title}
                      fill
                      className="object-contain"
                      quality={90}
                      sizes="(max-width: 1024px) 0vw, 50vw"
                    />
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                  
                  {/* Slide content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                      {bannerSlides[currentSlide].title}
                    </h3>
                    <p className="text-gray-200 text-sm drop-shadow-md">
                      {bannerSlides[currentSlide].subtitle}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {bannerSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? "bg-white w-8"
                        : "bg-white/50 hover:bg-white/75"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
