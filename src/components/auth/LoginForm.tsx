"use client";

import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { toast } from "react-hot-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
  onLoginStart?: () => void;
  onLoginEnd?: (success: boolean) => void;
}

export default function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onForgotPassword,
  onLoginStart,
  onLoginEnd,
}: LoginFormProps) {
  const { login, verifyMFA } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [mfaChallenge, setMfaChallenge] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("LoginForm onSubmit called with:", data.email);
    setIsLoading(true);
    onLoginStart?.(); // Notify that login is starting

    try {
      const result = await login(data.email, data.password);
      console.log("Login result:", result);
      
      // Check if MFA is required
      if (result.requiresMFA) {
        console.log("MFA required, showing verification form");
        setRequiresMFA(true);
        setMfaChallenge(result.mfaChallenge);
        onLoginEnd?.(false); // Don't close modal yet
        setIsLoading(false);
        return;
      }

      onLoginEnd?.(result.success); // Notify of login result

      if (result.success) {
        console.log("Calling onSuccess");
        onSuccess?.();
      } else {
        console.log("Login failed - not calling onSuccess");
      }
      // If login fails, we don't call onSuccess, so modal stays open
    } catch (error) {
      console.error("Login error:", error);
      onLoginEnd?.(false); // Notify that login failed
      // If there's an error, we don't call onSuccess, so modal stays open
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFAVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode.trim()) {
      toast.error("Please enter the verification code");
      return;
    }

    setIsLoading(true);
    onLoginStart?.();

    try {
      const success = await verifyMFA(mfaCode, mfaChallenge?.id);
      onLoginEnd?.(success);

      if (success) {
        console.log("MFA verification successful, calling onSuccess");
        setRequiresMFA(false);
        setMfaCode("");
        setMfaChallenge(null);
        onSuccess?.();
      } else {
        console.log("MFA verification failed");
      }
    } catch (error) {
      console.error("MFA verification error:", error);
      onLoginEnd?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const response = await supabaseAuthService.loginWithGoogle();

      if (response.success) {
        // User will be redirected to Google OAuth
        // The callback page will handle the result
      } else {
        toast.error(response.error || "Google authentication failed");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show MFA verification form if MFA is required
  if (requiresMFA) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Identity</h2>
          <p className="text-gray-600">Enter the verification code sent to your email or authenticator app</p>
        </div>

        <form onSubmit={handleMFAVerification} className="space-y-6">
          <div>
            <label
              htmlFor="mfaCode"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="mfaCode"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              autoFocus
            />
            <p className="mt-2 text-sm text-gray-500 text-center">
              Check your email or authenticator app for the 6-digit code
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !mfaCode.trim()}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {isLoading ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={() => {
              setRequiresMFA(false);
              setMfaCode("");
              setMfaChallenge(null);
            }}
            className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            ← Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your Kanyiji account</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleSubmit(onSubmit)(e);
        }}
        className="space-y-6"
        noValidate
      >
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
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Remember me</span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-colors duration-200 flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
