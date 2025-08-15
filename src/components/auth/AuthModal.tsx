"use client";

import { useState } from "react";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  if (!isOpen) return null;

  const handleForgotPassword = () => {
    // For demo purposes, show an alert
    alert(
      "Password reset functionality will be implemented with Supabase integration. For now, please use the demo credentials: user@demo.com / password123"
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {mode === "login" ? (
              <LoginForm
                onSuccess={onClose}
                onSwitchToSignup={() => setMode("signup")}
                onForgotPassword={handleForgotPassword}
              />
            ) : (
              <SignupForm
                onSuccess={onClose}
                onSwitchToLogin={() => setMode("login")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
