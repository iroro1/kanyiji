"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchJson } from "@/app/marketing/_lib/fetchJson";
import {
  Mail,
  LogOut,
  Users,
  FolderHeart,
  Send,
  History,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { id: "users", name: "Users", href: "/marketing/users", icon: Users },
  { id: "groups", name: "Groups", href: "/marketing/groups", icon: FolderHeart },
  { id: "campaigns", name: "Campaigns", href: "/marketing/campaigns", icon: History },
  { id: "new-campaign", name: "New Campaign", href: "/marketing/campaigns/new", icon: Send },
];

export default function MarketingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/marketing/auth", { credentials: "include" });
        const data = await fetchJson<{ authenticated?: boolean; user?: { email?: string; name?: string } }>(res);
        if (data?.authenticated && data.user) setUser(data.user);
      } catch {
        // ignore
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/marketing/auth", { method: "DELETE", credentials: "include" });
      router.push("/marketing/login");
    } catch {
      router.push("/marketing/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link
              href="/marketing"
              className="flex items-center gap-2 text-emerald-700 font-semibold"
            >
              <Mail className="w-6 h-6" />
              <span className="hidden sm:inline">Marketing</span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.id === "campaigns" && pathname?.startsWith("/marketing/campaigns") && pathname !== "/marketing/campaigns/new");
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 truncate max-w-[180px]">
              {user?.email || "—"}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white py-2 px-4">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  pathname === item.href ? "bg-emerald-50 text-emerald-700" : "text-gray-700"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
