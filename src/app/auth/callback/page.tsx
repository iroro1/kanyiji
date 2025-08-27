"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { account } from "@/lib/appwrite";
import { authService } from "@/services/authService";
import { toast } from "react-hot-toast";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      setIsProcessing(true);

      // Get the OAuth provider from localStorage
      const provider = localStorage.getItem("oauth_provider");
      localStorage.removeItem("oauth_provider"); // Clean up

      if (!provider) {
        throw new Error("OAuth provider not found");
      }

      // Check if we have a session (user successfully authenticated)
      const session = await account.get();

      if (session) {
        // User successfully authenticated via OAuth
        toast.success(`Successfully signed in with ${provider}!`);

        // Redirect to dashboard or home page
        router.push("/dashboard");
      } else {
        // OAuth failed or was cancelled
        throw new Error("OAuth authentication failed");
      }
    } catch (error: any) {
      console.error("OAuth callback error:", error);
      setError(error.message || "Authentication failed");
      toast.error("Authentication failed. Please try again.");

      // Redirect back to login after a delay
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we complete your sign-in...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Redirecting you back to the home page...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
