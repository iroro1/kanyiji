"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/marketing/users");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
