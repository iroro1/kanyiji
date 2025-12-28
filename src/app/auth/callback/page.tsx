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
          const user = data.session.user;
          
          // Check if this is a new user (created within the last 2 minutes)
          // This helps detect new Google OAuth signups
          const userCreatedAt = new Date(user.created_at);
          const now = new Date();
          const timeDiff = now.getTime() - userCreatedAt.getTime();
          const isNewUser = timeDiff < 2 * 60 * 1000; // 2 minutes

          // Check if user signed up via Google OAuth
          const isGoogleUser = user.app_metadata?.provider === "google" || 
                               user.identities?.some((identity: any) => identity.provider === "google");

          // If it's a new user from Google OAuth, send welcome email
          if (isNewUser && isGoogleUser) {
            // Check if profile exists to avoid duplicate emails
            try {
              const { data: profile } = await supabase
                .from("profiles")
                .select("id, created_at")
                .eq("id", user.id)
                .maybeSingle();
              
              // If profile was just created (within last 2 minutes) or doesn't exist yet, send welcome email
              const profileIsNew = !profile || (profile.created_at && 
                (now.getTime() - new Date(profile.created_at).getTime()) < 2 * 60 * 1000);
              
              if (profileIsNew) {
                // Send welcome email
                try {
                  const response = await fetch("/api/auth/send-welcome-email", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: user.email,
                      fullName: user.user_metadata?.full_name || 
                               user.user_metadata?.name ||
                               user.user_metadata?.display_name,
                    }),
                  });

                  if (response.ok) {
                    console.log("Welcome email sent to new Google user");
                  } else {
                    console.error("Failed to send welcome email");
                  }
                } catch (emailError) {
                  console.error("Error sending welcome email:", emailError);
                  // Don't block the auth flow if email fails
                }
              }
            } catch (profileError) {
              console.error("Error checking profile:", profileError);
              // If we can't check profile, still try to send welcome email for very new users
              if (timeDiff < 60 * 1000) { // Less than 1 minute old
                try {
                  await fetch("/api/auth/send-welcome-email", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      email: user.email,
                      fullName: user.user_metadata?.full_name || 
                               user.user_metadata?.name ||
                               user.user_metadata?.display_name,
                    }),
                  });
                } catch (emailError) {
                  console.error("Error sending welcome email:", emailError);
                }
              }
            }
          }

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

  // Loading spinner disabled - show content immediately
  // if (isLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">Completing authentication...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return null;
}
