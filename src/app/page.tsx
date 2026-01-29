import { Suspense } from "react";
import dynamic from "next/dynamic";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Lazy load heavy components
const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), {
  loading: () => <div className="min-h-[600px] bg-gray-100 animate-pulse" />,
});

const FeaturedCategories = dynamic(() => import("@/components/sections/FeaturedCategories"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse my-8" />,
});

const FeaturedProducts = dynamic(() => import("@/components/sections/FeaturedProducts"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse my-8" />,
});

const NewProducts = dynamic(() => import("@/components/sections/NewProducts"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse my-8" />,
});

const FeaturedVendors = dynamic(() => import("@/components/sections/FeaturedVendors"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse my-8" />,
});

const WhyChooseUs = dynamic(() => import("@/components/sections/WhyChooseUs"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse my-8" />,
});

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse my-8" />}>
        <FeaturedCategories />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse my-8" />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse my-8" />}>
        <NewProducts />
      </Suspense>

      <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse my-8" />}>
        <FeaturedVendors />
      </Suspense>

      <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse my-8" />}>
        <WhyChooseUs />
      </Suspense>
    </>
  );
}
