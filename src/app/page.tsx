import { Suspense } from 'react';
import HeroSection from '@/components/sections/HeroSection';
import FeaturedCategories from '@/components/sections/FeaturedCategories';
import FeaturedProducts from '@/components/sections/FeaturedProducts';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedCategories />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturedProducts />
      </Suspense>
      
      <WhyChooseUs />
    </main>
  );
}
