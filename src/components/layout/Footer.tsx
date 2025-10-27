"use client";

import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "../auth/AuthModal";
import kanyiyi from "../../assets/Kanyiji-dark.png";

export default function Footer() {
  // const { user } = useAuth();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">(
    "signup"
  );

  const router = useRouter();

  // Function to open the modal by setting state to true
  const openAuthModal = () => setShowAuthModal(true);

  // function to retroute to vendors/register
  const vendorRegistration = () => router.push("/vendor/register");

  // Track if login is in progress to prevent modal from closing
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);

  // Prevent modal from closing if login is in progress
  const shouldCloseModal = () => {
    return !isLoginInProgress;
  };

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Marketplace",
      links: [
        { name: "All Products", href: "/products" },
        { name: "Categories", href: "/categories" },
        { name: "Vendors", href: "/vendors" },
        { name: "Deals", href: "/deals" },
        { name: "New Arrivals", href: "/new-arrivals" },
      ],
    },
    {
      title: "For Vendors",
      links: [
        { name: "Become a Vendor", action: "openAuthModal" },
        { name: "Vendor Guidelines", href: "/vendor/guidelines" },
        { name: "Success Stories", href: "/vendor/success-stories" },
        { name: "Vendor Support", href: "/vendor/support" },
      ],
    },
    {
      title: "Customer Service",
      links: [
        { name: "Help Center", href: "/help" },
        { name: "Contact Us", href: "/contact" },
        { name: "Shipping Info", href: "/shipping" },
        { name: "Returns", href: "/returns" },
        { name: "Size Guide", href: "/size-guide" },
      ],
    },
    {
      title: "About Kanyiji",
      links: [
        { name: "Our Story", href: "/about" },
        { name: "Mission & Vision", href: "/mission" },
        { name: "Team", href: "/team" },
        { name: "Careers", href: "/careers" },
        { name: "Press", href: "/press" },
      ],
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://facebook.com" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com" },
    { name: "Instagram", icon: Instagram, href: "https://instagram.com" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com" },
    { name: "YouTube", icon: Youtube, href: "https://youtube.com" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          if (shouldCloseModal()) {
            setShowAuthModal(false);
          }
        }}
        initialMode={authModalMode}
        onLoginStart={() => {
          console.log("Navbar onLoginStart called");
          setIsLoginInProgress(true);
        }}
        onLoginEnd={(success) => {
          console.log("Navbar onLoginEnd called with success:", success);
          setIsLoginInProgress(false);
          if (success) {
            console.log("Login successful - closing modal");
            setShowAuthModal(false);
          } else {
            console.log("Login failed - reopening modal in 100ms");
            // Reopen the modal after a short delay
            setTimeout(() => {
              console.log("Reopening modal now");
              setShowAuthModal(true);
              setAuthModalMode("login");
            }, 100);
          }
        }}
      />
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src={kanyiyi}
                alt="Kanyiyi"
                height={150}
                width={150}
                priority
              />
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting Nigerian artisans, brands, and businesses with
              customers nationwide. Discover authentic Made-in-Nigeria products
              that tell the story of our rich heritage.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail className="w-5 h-5 text-primary-400" />
                <span>hello@kanyiji.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone className="w-5 h-5 text-primary-400" />
                <span>+234 800 KANYIJI</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4 text-white">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    {link.action === "openAuthModal" ? (
                      <button
                        // onClick={!user ? openAuthModal : vendorRegistration}
                        className="text-gray-300 hover:text-blue-400 transition-colors duration-200 text-sm text-left w-full focus:outline-none"
                      >
                        {link.name}
                      </button>
                    ) : (
                      <Link
                        href={link.href ? link.href : ""}
                        className="text-gray-300 hover:text-primary-400 transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Get the latest updates on new products, vendor stories, and
              African culture.
            </p>
            <div className="flex space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="btn-primary px-6 py-2">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-400 text-sm">
              © {currentYear} Kanyiji Marketplace. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
