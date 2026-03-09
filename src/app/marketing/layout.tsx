"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import { fetchJson } from "./_lib/fetchJson";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  const isLoginPage = pathname === "/marketing/login";
  const isSetupPage = pathname === "/marketing/setup";

  useEffect(() => {
    if (isLoginPage || isSetupPage) {
      setAllowed(true);
      return;
    }

    const check = async () => {
      try {
        const res = await fetch("/api/marketing/auth", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await fetchJson<{ authenticated?: boolean }>(res);
        if (data?.authenticated) {
          setAllowed(true);
        } else {
          router.replace("/marketing/login");
        }
      } catch {
        router.replace("/marketing/login");
      }
    };

    check();
  }, [pathname, isLoginPage, isSetupPage, router]);

  if (isLoginPage || isSetupPage) {
    return <>{children}</>;
  }

  if (allowed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MarketingNavbar />
      <main className="pt-14">{children}</main>
    </div>
  );
}
