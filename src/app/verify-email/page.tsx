"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds (Supabase OTP expires quickly)

  useEffect(() => {
    // Get email from URL params or session
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Try to get email from current session
      const getCurrentUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user?.email) {
          setEmail(user.email);
        }
      };
      getCurrentUser();
    }
  }, [searchParams]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && verificationStatus === "pending") {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && verificationStatus === "pending") {
      // Auto-suggest resend when timer expires
      setError("OTP has expired. Please request a new verification code.");
    }
  }, [timeLeft, verificationStatus]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        console.error("OTP verification error:", error);

        // Handle specific error cases
        if (
          error.message?.includes("expired") ||
          error.message?.includes("invalid")
        ) {
          setError("OTP has expired or is invalid. Please request a new one.");
        } else {
          setError(error.message || "Invalid OTP. Please try again.");
        }
        setVerificationStatus("error");
      } else {
        console.log("OTP verification successful:", data);

        // Create or update profile
        if (data.user?.id) {
          try {
            // First, try to update existing profile
            const { data: existingProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", data.user.id)
              .single();

            if (existingProfile) {
              // Profile exists, update email_verified status and phone from metadata
              const { error: profileError } = await supabase
                .from("profiles")
                .update({
                  email_verified: true,
                  phone: data.user.user_metadata?.phone || "", // Update phone from user metadata
                  updated_at: new Date().toISOString(),
                })
                .eq("id", data.user.id);

              if (profileError) {
                console.error("Profile update error:", profileError);
              } else {
                console.log(
                  "Profile email_verified status and phone updated successfully"
                );
                console.log(
                  "Phone from metadata:",
                  data.user.user_metadata?.phone
                );
              }
            } else {
              // Profile doesn't exist, create it
              console.log("Creating profile during email verification...");
              const { error: createError } = await supabase
                .from("profiles")
                .insert({
                  id: data.user.id,
                  email: data.user.email || email,
                  full_name: data.user.user_metadata?.full_name || "User",
                  role: data.user.user_metadata?.role || "customer",
                  phone: data.user.user_metadata?.phone || "", // Use phone from user metadata
                  address: "", // Initialize address as empty string
                  city: "", // Initialize city as empty string
                  state: "", // Initialize state as empty string
                  zip_code: "", // Initialize zip_code as empty string
                  country: "Nigeria", // Default country
                  email_verified: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (createError) {
                console.error("Profile creation error:", createError);

                // If it's a foreign key constraint error, try using the API route
                if (createError.code === "23503") {
                  console.log(
                    "Foreign key constraint error - trying API route..."
                  );
                  try {
                    const response = await fetch("/api/create-profile", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        userId: data.user.id,
                        email: data.user.email || email,
                        fullName: data.user.user_metadata?.full_name || "User",
                        role: data.user.user_metadata?.role || "customer",
                        phone: data.user.user_metadata?.phone || "",
                        emailVerified: true,
                      }),
                    });

                    if (response.ok) {
                      console.log("Profile created successfully via API route");
                    } else {
                      console.error("API route also failed");
                    }
                  } catch (apiError) {
                    console.error("API route error:", apiError);
                  }
                }
                // Don't fail verification if profile creation fails
              } else {
                console.log(
                  "Profile created successfully during email verification"
                );
              }
            }
          } catch (profileError) {
            console.error("Profile operation error:", profileError);
            // Don't fail the verification if profile operation fails
          }
        }

        setVerificationStatus("success");
        toast.success("Email verified successfully!");

        // Redirect to home page after 2 seconds
        setTimeout(() => {
          router.push("/");
        }, 2000);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      setError("An error occurred. Please try again.");
      setVerificationStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Email address not found. Please try signing up again.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        console.error("Resend OTP error:", error);

        // Handle specific error cases
        if (error.message?.includes("rate limit")) {
          setError(
            "Too many requests. Please wait a moment before trying again."
          );
        } else if (
          error.message?.includes("not found") ||
          error.message?.includes("invalid")
        ) {
          setError("Email not found. Please try signing up again.");
        } else {
          setError(error.message || "Failed to resend OTP. Please try again.");
        }
      } else {
        toast.success("OTP sent successfully! Check your email.");
        setVerificationStatus("pending");
        setOtp(""); // Clear the OTP input
        setTimeLeft(120); // Reset timer to 2 minutes
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  if (verificationStatus === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now access all
              features of Kanyiji.
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">
              Redirecting you to the homepage...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-primary-600 font-medium">{email}</p>
          <p className="text-xs text-gray-500 mt-1">
            ⚡ Enter the code quickly - it expires in 2 minutes
          </p>
          {timeLeft > 0 && verificationStatus === "pending" && (
            <p
              className={`text-sm mt-2 ${
                timeLeft <= 30 ? "text-red-500 font-medium" : "text-gray-500"
              }`}
            >
              {timeLeft <= 30 ? "⚠️ " : ""}Code expires in{" "}
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60).toString().padStart(2, "0")}
              {timeLeft <= 30 && (
                <span className="block text-xs mt-1">
                  Code will expire soon! Consider requesting a new one.
                </span>
              )}
            </p>
          )}
        </div>

        {/* OTP Form */}
        <form className="mt-8 space-y-6" onSubmit={handleVerifyOTP}>
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              value={otp}
              onChange={handleOTPChange}
              placeholder="000000"
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
            {error && (
              <div className="mt-2">
                <div className="flex items-center text-red-600 mb-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <p className="text-sm">{error}</p>
                </div>
                {error.includes("expired") && (
                  <div className="text-center">
                    <Link
                      href="/auth"
                      className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Start Over - Sign Up Again
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {timeLeft === 0
                  ? "Code has expired!"
                  : "Didn't receive the code?"}
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className={`font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center mx-auto ${
                  timeLeft === 0
                    ? "text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                    : "text-primary-600 hover:text-primary-700"
                }`}
              >
                {isResending ? (
                  <div className="flex items-center">
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Resending...
                  </div>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {timeLeft === 0 ? "Get New Code" : "Resend Code"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Back to Sign Up */}
        <div className="text-center">
          <Link
            href="/auth"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
