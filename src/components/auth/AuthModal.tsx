"use client";

import { useState } from "react";
import { X } from "lucide-react";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import ForgotPasswordModal from "./ForgotPasswordModal";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  onLoginStart?: () => void;
  onLoginEnd?: (success: boolean) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "login",
  onLoginStart,
  onLoginEnd,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);

  const handleClose = () => {
    if (!isLoginInProgress) {
      onClose();
    }
    // If login is in progress, block the close
  };

  const handleLoginStart = () => {
    console.log("Login starting - setting isLoginInProgress to true");
    setIsLoginInProgress(true);
    onLoginStart?.();
  };

  const handleLoginEnd = (success: boolean) => {
    console.log("Login ended, success:", success);
    setIsLoginInProgress(false);
    onLoginEnd?.(success);
  };

  if (!isOpen) return null;

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setMode("login");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {mode === "login" ? (
              <LoginForm
                onSuccess={handleClose}
                onSwitchToSignup={() => setMode("signup")}
                onForgotPassword={handleForgotPassword}
                onLoginStart={handleLoginStart}
                onLoginEnd={handleLoginEnd}
              />
            ) : (
              <SignupForm
                onSuccess={handleClose}
                onSwitchToLogin={() => setMode("login")}
              />
            )}
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  );
}
