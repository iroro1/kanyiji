"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function MFABlockingOverlay() {
  const router = useRouter();
  const { mfaRequiredForSession, mfaFactorId, verifyMFA, logout, clearMFARequired } = useAuth();
  const [mfaCode, setMfaCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  if (!mfaRequiredForSession || !mfaFactorId) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode.trim() || mfaCode.trim().length !== 6) {
      toast.error("Please enter the 6-digit code from your authenticator app");
      return;
    }
    setIsVerifying(true);
    try {
      const success = await verifyMFA(mfaCode.trim(), mfaFactorId);
      if (success) {
        setMfaCode("");
        router.push("/");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignOut = () => {
    clearMFARequired();
    logout();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
      aria-modal="true"
      role="dialog"
      aria-labelledby="mfa-overlay-title"
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-xl p-6">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 mb-6">
          <p className="text-sm font-medium text-amber-800 text-center">
            Two-factor authentication is required. You cannot use the app until you enter the code from your authenticator app.
          </p>
        </div>
        <h2 id="mfa-overlay-title" className="text-xl font-bold text-gray-900 mb-2 text-center">
          Enter verification code
        </h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Open your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="mfa-overlay-code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              id="mfa-overlay-code"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              autoFocus
              disabled={isVerifying}
            />
          </div>
          <button
            type="submit"
            disabled={isVerifying || mfaCode.trim().length !== 6}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isVerifying ? "Verifying..." : "Verify and continue"}
          </button>
        </form>
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full mt-4 text-sm text-gray-600 hover:text-gray-800 font-medium"
        >
          Sign out instead
        </button>
      </div>
    </div>
  );
}
