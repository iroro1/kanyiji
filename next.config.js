/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'vunesehycewonscqnamb.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [384, 414, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Enable compression (gzip/brotli)
  compress: true,
  // Optimize production builds
  swcMinify: true,
  // Enable React strict mode for better performance
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
  // Reduce mobile JS: experimental for smaller client bundles (optional)
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  // Enable static page generation where possible
  output: 'standalone',
  async redirects() {
    return [
      // Fix typo: /vendor/dashboard. → /vendor/dashboard
      { source: '/vendor/dashboard.', destination: '/vendor/dashboard', permanent: false },
      // /signin doesn't exist – redirect to correct login route
      { source: '/signin', destination: '/auth/login', permanent: false },
    ];
  },
};

module.exports = nextConfig;
