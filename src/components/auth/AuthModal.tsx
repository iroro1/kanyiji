"use client";

import { useState, useEffect } from "react";
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

  // When modal opens or initialMode changes, show the requested mode (so "Become a vendor" opens signup)
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
    }
  }, [isOpen, initialMode]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoginInProgress, setIsLoginInProgress] = useState(false);
  const [loginFailed, setLoginFailed] = useState(false);

  const handleClose = () => {
    // Don't allow closing if login is in progress
    // Allow closing even if login failed (user can manually close)
    if (!isLoginInProgress) {
      onClose();
    }
  };

  const handleLoginStart = () => {
    console.log("Login starting - setting isLoginInProgress to true");
    setIsLoginInProgress(true);
    setLoginFailed(false); // Reset failure state
    onLoginStart?.();
  };

  const handleLoginEnd = (success: boolean) => {
    console.log("Login ended, success:", success);
    setIsLoginInProgress(false);
    
    if (!success) {
      // Login failed - keep modal open so user can see error and try again
      // Modal stays open until user manually closes or successfully logs in
      setLoginFailed(true);
    } else {
      // Login successful - modal will close via onSuccess callback
      setLoginFailed(false);
    }
    
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
        onClick={() => {
          // Don't close on backdrop click if login is in progress
          // Allow closing even if login failed (user can manually close)
          if (!isLoginInProgress) {
            handleClose();
          }
        }}
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
            disabled={isLoginInProgress}
            className={`absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors ${
              isLoginInProgress ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title={isLoginInProgress ? "Please wait..." : ""}
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
