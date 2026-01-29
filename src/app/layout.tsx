import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import ClarityScript from "@/components/analytics/ClarityScript";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import AppQueryProvider from "@/components/http/QueryHttp";
import { ToastProvider } from "@/components/ui/Toast";
// Validate environment variables on startup (server-side only)
if (typeof window === "undefined") {
  require("@/lib/envValidation");
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Optimize font loading
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap", // Optimize font loading
});

export const metadata: Metadata = {
  title: "Kanyiji - Made-in-Nigeria Marketplace",
  description:
    "Connect with Nigerian entrepreneurs, brands, and businesses. Discover authentic Made-in-Nigeria products.",
  keywords:
    "Nigerian marketplace, e-commerce, Made-in-Nigeria, entrepreneurs, crafts, fashion, food, Lagos, Abuja",
  authors: [{ name: "Kanyiji Team" }],
  robots: "index, follow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://vunesehycewonscqnamb.supabase.co" />
        <link rel="dns-prefetch" href="https://vunesehycewonscqnamb.supabase.co" />
        <link rel="preconnect" href="https://js.paystack.co" />
        <link rel="dns-prefetch" href="https://js.paystack.co" />
      </head>
      <body suppressHydrationWarning>
        <ClarityScript />
        <AppQueryProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: "#363636",
                      color: "#fff",
                    },
                  }}
                />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
