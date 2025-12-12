import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import Script from "next/script";
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
    "Connect with Nigerian entrepreneurs, brands, and businesses. Discover authentic Made-in-Nigeria products.",
  keywords:
    "Nigerian marketplace, e-commerce, Made-in-Nigeria, entrepreneurs, crafts, fashion, food, Lagos, Abuja",
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
        <Script
          id="omnisend-tracking"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.omnisend = window.omnisend || [];
              omnisend.push(["brandID", "69208bab8ca7847caab11746"]);
              omnisend.push(["track", "$pageViewed"]);
              !function(){var e=document.createElement("script");
              e.type="text/javascript",e.async=!0,
              e.src="https://omnisnippet1.com/inshop/launcher-v2.js";
              var t=document.getElementsByTagName("script")[0];
              t.parentNode.insertBefore(e,t)}();
            `,
          }}
        />
        <AppQueryProvider>
          <AuthProvider>
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
          </AuthProvider>
        </AppQueryProvider>
      </body>
    </html>
  );
}
