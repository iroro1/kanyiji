"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { toast } from "react-hot-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  onBackToLogin,
}: ForgotPasswordModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const response = await supabaseAuthService.resetPassword(data.email);

      if (response.success) {
        setUserEmail(data.email);
        setIsEmailSent(true);
        toast.success("Password reset email sent successfully!");
      } else {
        toast.error(response.error || "Failed to send password reset email");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsEmailSent(false);
    setUserEmail("");
    onClose();
  };

  const handleBackToLogin = () => {
    reset();
    setIsEmailSent(false);
    setUserEmail("");
    onBackToLogin();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {!isEmailSent ? (
              <>
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-orange-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Forgot Password?
                  </h2>
                  <p className="text-gray-600">
                    No worries! Enter your email address and we'll send you a
                    link to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        {...register("email")}
                        type="email"
                        id="email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                        placeholder="Enter your email address"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending Reset Link...
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleBackToLogin}
                    className="flex items-center justify-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to{" "}
                    <span className="font-medium text-gray-900">
                      {userEmail}
                    </span>
                  </p>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <div className="flex items-start">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Next Steps:</p>
                        <ul className="space-y-1 text-xs">
                          <li>• Check your email inbox (and spam folder)</li>
                          <li>• Click the reset link in the email</li>
                          <li>• Create a new password</li>
                          <li>• Sign in with your new password</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleBackToLogin}
                      className="w-full bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Back to Sign In
                    </button>

                    <button
                      onClick={() => {
                        setIsEmailSent(false);
                        setUserEmail("");
                        reset();
                      }}
                      className="w-full text-gray-600 hover:text-primary-600 transition-colors text-sm"
                    >
                      Try Different Email
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
