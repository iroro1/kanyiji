"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Users, Building2 } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Vendor {
  id: string;
  business_name: string;
  business_description: string;
  business_type: string;
  product_count: number;
  rating?: number;
  total_reviews?: number;
  status: string;
  created_at: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/vendors", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }

        const data = await response.json();
        setVendors(data.vendors || []);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Unable to load vendors at the moment.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  /* -------------------- STATES -------------------- */

  if (loading) {
    return <LoadingSpinner timeout={5000} />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Building2 className="w-14 h-14 text-gray-400 mb-4" />
        <p className="text-gray-600">No vendors available yet.</p>
      </div>
    );
  }

  /* -------------------- PAGE -------------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Vendors
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href={`/vendors/${vendor.id}`}
              className="group"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                  {vendor.business_name}
                </h2>

                {vendor.business_type && (
                  <span className="inline-block mt-1 text-xs text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                    {vendor.business_type}
                  </span>
                )}

                <p className="text-sm text-gray-600 line-clamp-2 mt-3">
                  {vendor.business_description || "No description available."}
                </p>

                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {vendor.product_count} products
                  </span>

                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    {vendor.rating && vendor.rating > 0
                      ? vendor.rating.toFixed(1)
                      : "0.0"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
