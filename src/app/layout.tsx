import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
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
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Kanyiji - Made-in-Nigeria Marketplace",
  description:
    "Connect with Nigerian artisans, brands, and businesses. Discover authentic Made-in-Nigeria products.",
  keywords:
    "Nigerian marketplace, e-commerce, Made-in-Nigeria, artisans, crafts, fashion, food, Lagos, Abuja",
  authors: [{ name: "Kanyiji Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-gray-50">
        <AuthProvider>
          <AppQueryProvider>
            <ToastProvider>
              <CartProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: "#363636",
                      color: "#fff",
                    },
                  }}
                />
              </CartProvider>
            </ToastProvider>
          </AppQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
