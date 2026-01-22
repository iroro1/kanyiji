"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import kanyijiLogo from "../../assets/Kanyiji-light.png";

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
    <section className="relative w-full overflow-hidden">
      {/* Top Section - Brown Banner */}
      <div className="bg-[#8B4513] w-full py-4 sm:py-5 lg:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left Side - Text */}
            <motion.div
              className="text-white text-left"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 leading-tight text-left"
                variants={itemVariants}
              >
                Discover Authentic{" "}
                <motion.span
                  className="text-yellow-400"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  Made-in-Africa
                </motion.span>{" "}
                Products
              </motion.h1>
            </motion.div>

            {/* Right Side - Description and Button */}
            <motion.div
              className="flex flex-col justify-center lg:items-end"
              variants={itemVariants}
            >
              <motion.p
                className="text-sm sm:text-base lg:text-lg text-white mb-4 leading-relaxed text-left lg:text-right"
                variants={itemVariants}
              >
                Connect with African entrepreneurs, brands, and businesses. Shop unique
                products that tell the story of Africa's rich heritage.
              </motion.p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={"/products"}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold text-base px-6 py-3 rounded-lg shadow-lg transition-all duration-300 inline-flex items-center"
                >
                  Start shopping
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Full Width Banner Slider */}
      <div className="bg-gradient-to-br from-blue-50 to-white w-full relative overflow-hidden">
        {/* Full Width Auto-sliding Banner */}
        <motion.div
          className="relative w-full h-[45vh] sm:h-[70vh] lg:h-[80vh]"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
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
                  alt={`Banner ${bannerSlides[currentSlide].id}`}
                  fill
                  className="object-contain sm:object-contain"
                  quality={90}
                  sizes="100vw"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation arrows - reduced padding on mobile */}
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 p-1.5 sm:p-2 rounded-full transition-all duration-300 shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-800 p-1.5 sm:p-2 rounded-full transition-all duration-300 shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots indicator - reduced bottom spacing on mobile */}
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 sm:gap-2">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-white w-6 sm:w-8"
                    : "bg-white/50 hover:bg-white/75 w-1.5 sm:w-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
