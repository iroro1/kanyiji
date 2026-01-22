"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ConfigError from "../ConfigError";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const { isConfigValid, isLoading } = useAuth();
  const isAdminRoute = pathname.startsWith("/admin");
  // Auth callback is a special case - it needs to render immediately to process the callback
  // It's not a protected route, so treat it as public (don't block on auth loading)
  const isAuthCallback = pathname.startsWith("/auth/callback");
  const isPublicRoute = isAuthCallback || (
                        !pathname.startsWith("/admin") && 
                        !pathname.startsWith("/profile") && 
                        !pathname.startsWith("/vendor") &&
                        !pathname.startsWith("/checkout") &&
                        !pathname.startsWith("/orders"));

  // Show configuration error if config is invalid
  if (!isLoading && !isConfigValid) {
    return <ConfigError />;
  }

  // CRITICAL: For public routes (like product pages), don't block on auth loading
  // This prevents infinite spinner on mobile when logged in
  // Only show loading for protected routes that actually need auth
  if (isLoading && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show Navbar/Footer on auth callback page - it needs to be minimal
  if (isAuthCallback) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="min-h-screen">{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
