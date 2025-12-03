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
import { checkRateLimit, recordAttempt, formatTimeUntilReset } from "@/utils/rateLimit";

// Server-side rate limit check
async function checkServerRateLimit(email: string, actionType: "signup" | "resend") {
  try {
    const response = await fetch("/api/auth/rate-limit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: email,
        actionType,
        maxAttempts: 3,
        windowDuration: "1 hour",
      }),
    });

    if (!response.ok) {
      // If API fails, fall back to client-side check
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Server rate limit check failed:", error);
    return null; // Fall back to client-side
  }
}

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
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown in seconds between resends

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

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Verify OTP using Supabase (which uses Resend SMTP for sending)
      const { data: authData, error: authError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (authError) {
        console.error("OTP verification error:", authError);
        
        // Handle specific error cases
        if (
          authError.message?.includes("expired") ||
          authError.message?.includes("invalid")
        ) {
          setError("OTP has expired or is invalid. Please request a new one.");
        } else {
          setError(authError.message || "Invalid OTP. Please try again.");
        }
        setVerificationStatus("error");
        return;
      }

      if (!authData.user) {
        setError("User not found. Please try signing up again.");
        setVerificationStatus("error");
        return;
      }

      const verifiedUser = authData.user;
      console.log("OTP verification successful");

        // Create or update profile
        if (verifiedUser?.id) {
          try {
            // First, try to update existing profile
            const { data: existingProfile, error: fetchError } = await supabase
              .from("profiles")
              .select("id")
              .eq("id", verifiedUser.id)
              .single();

            if (existingProfile) {
              // Profile exists, update email_verified status and phone from metadata
              const { error: profileError } = await supabase
                .from("profiles")
                .update({
                  email_verified: true,
                  phone: verifiedUser.user_metadata?.phone || "", // Update phone from user metadata
                  updated_at: new Date().toISOString(),
                })
                .eq("id", verifiedUser.id);

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
                  id: verifiedUser.id,
                  email: verifiedUser.email || email,
                  full_name: verifiedUser.user_metadata?.full_name || "User",
                  role: verifiedUser.user_metadata?.role || "customer",
                  phone: verifiedUser.user_metadata?.phone || "", // Use phone from user metadata
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
                      userId: verifiedUser.id,
                      email: verifiedUser.email || email,
                      fullName: verifiedUser.user_metadata?.full_name || "User",
                      role: verifiedUser.user_metadata?.role || "customer",
                      phone: verifiedUser.user_metadata?.phone || "",
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

    // Check server-side rate limit first (more reliable)
    const serverRateLimit = await checkServerRateLimit(email, "resend");
    
    if (serverRateLimit?.is_limited) {
      const timeUntilReset = serverRateLimit.time_until_reset_ms || 0;
      setError(
        `Too many resend attempts. Please try again in ${formatTimeUntilReset(timeUntilReset)}.`
      );
      return;
    }

    // Fallback to client-side rate limit check
    const rateLimitKey = `resend:${email.toLowerCase()}`;
    const rateLimitCheck = checkRateLimit(rateLimitKey, 3, 60 * 60 * 1000); // 3 attempts per hour

    if (rateLimitCheck.isLimited) {
      setError(
        `Too many resend attempts. Please try again in ${formatTimeUntilReset(rateLimitCheck.timeUntilReset)}.`
      );
      return;
    }

    setIsResending(true);
    setError("");

    try {
      // Record the attempt
      recordAttempt(rateLimitKey, 3, 60 * 60 * 1000);

      // Resend verification email via Supabase (which uses Resend SMTP)
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        console.error("Resend OTP error:", error);
        
        // Handle specific error cases
        if (error.message?.includes("rate limit")) {
          const timeUntilReset = rateLimitCheck.timeUntilReset;
          setError(
            `Too many resend attempts. Please try again in ${formatTimeUntilReset(timeUntilReset)}.`
          );
        } else {
          setError(error.message || "Failed to resend OTP. Please try again.");
        }
      } else {
        toast.success("OTP sent successfully! Check your email.");
        setVerificationStatus("pending");
        setOtp(""); // Clear the OTP input
        setTimeLeft(120); // Reset timer to 2 minutes
        setResendCooldown(60); // Set 60 second cooldown before allowing another resend
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
              {resendCooldown > 0 && (
                <p className="text-xs text-gray-500 mb-2">
                  Please wait {resendCooldown} second{resendCooldown > 1 ? "s" : ""} before requesting a new code
                </p>
              )}
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || resendCooldown > 0}
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
