"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait for the URL to be processed
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Get the session
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          toast.error("Authentication failed. Please try again.");
          router.push("/");
          return;
        }

        if (data.session) {
          // User is authenticated
          toast.success("Successfully signed in!");
          router.push("/");
        } else {
          // No session found
          toast.error("Authentication failed. Please try again.");
          router.push("/");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("Authentication failed. Please try again.");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </div>
      </div>
    );
  }

  return null;
}
