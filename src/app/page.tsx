import { Suspense } from "react";
import HeroSection from "@/components/sections/HeroSection";
import FeaturedCategories from "@/components/sections/FeaturedCategories";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import FeaturedVendors from "@/components/sections/FeaturedVendors";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function HomePage() {
  return (
    <>
      <HeroSection />

      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedCategories />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedProducts />
      </Suspense>

      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedVendors />
      </Suspense>

      <WhyChooseUs />
    </>
  );
}
