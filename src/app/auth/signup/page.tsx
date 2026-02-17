"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import SignupForm from "@/components/auth/SignupForm";
import { useAuth } from "@/contexts/AuthContext";

export default function SignupPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const redirect = searchParams.get("redirect") || "/";
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If user is already logged in, redirect immediately
  useEffect(() => {
    if (isMounted && user) {
      router.push(redirect);
    }
  }, [user, redirect, router, isMounted]);

  const handleSignupSuccess = () => {
    // Small delay to ensure auth state is updated
    setTimeout(() => {
      router.push(redirect);
    }, 100);
  };

  const handleSwitchToLogin = () => {
    router.push(`/auth/login?redirect=${encodeURIComponent(redirect)}`);
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            Create Account
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Create an account to get started
          </p>
          <SignupForm onSuccess={handleSignupSuccess} onSwitchToLogin={handleSwitchToLogin} skipReload={true} />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(redirect)}`}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
