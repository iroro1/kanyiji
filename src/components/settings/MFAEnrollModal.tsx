"use client";

import { useState, useEffect } from "react";
import { X, Shield, Copy, Check } from "lucide-react";
import { supabaseAuthService } from "@/services/supabaseAuthService";
import { toast } from "react-hot-toast";

interface MFAEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MFAEnrollModal({
  isOpen,
  onClose,
  onSuccess,
}: MFAEnrollModalProps) {
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const runEnroll = async () => {
    setEnrollError(null);
    setIsLoading(true);
    const result = await supabaseAuthService.enrollMFA("Kanyiji Authenticator");
    setIsLoading(false);
    if (result.success && result.factorId && result.qrCode && result.secret) {
      setFactorId(result.factorId);
      setQrCode(result.qrCode);
      setSecret(result.secret);
    } else {
      const msg = (result.error || "").toLowerCase();
      const needsReauth = msg.includes("forbidden") || msg.includes("403") || msg.includes("session") || msg.includes("unauthorized");
      setEnrollError(
        needsReauth
          ? "Please sign out and sign in again, then try Enable 2FA. If you just signed in, try again or refresh the page first."
          : (result.error || "Failed to start 2FA setup")
      );
      if (!needsReauth) onClose();
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setFactorId(null);
    setQrCode(null);
    setSecret(null);
    setCode("");
    setCopied(false);
    setEnrollError(null);
    // Start enrollment when modal opens
    runEnroll();
  }, [isOpen]);

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    toast.success("Secret copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId || !code.trim() || code.trim().length !== 6) {
      toast.error("Please enter the 6-digit code from your authenticator app");
      return;
    }
    setIsLoading(true);
    const result = await supabaseAuthService.verifyMFAEnrollment(factorId, code.trim());
    setIsLoading(false);
    if (result.success) {
      toast.success("Two-factor authentication is now enabled.");
      onSuccess();
      onClose();
    } else {
      toast.error(result.error || "Invalid code. Please try again.");
    }
  };

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Enable Two-Factor Authentication</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {enrollError ? (
            <div className="py-4 space-y-3">
              <p className="text-sm text-red-600">{enrollError}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => runEnroll()}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? "Trying..." : "Try again"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-gray-500">
                If you just signed in with Google, refresh this page and try Enable 2FA again.
              </p>
            </div>
          ) : !qrCode ? (
            <div className="py-8 text-center text-gray-500">
              {isLoading ? "Preparing QR code..." : "Loading..."}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Scan the QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.).
              </p>
              <div className="flex justify-center bg-gray-50 rounded-lg p-4">
                {/* qr_code from Supabase is already data:image/svg+xml;utf-8,... */}
                <img
                  src={qrCode}
                  alt="TOTP QR Code"
                  className="w-48 h-48 object-contain"
                />
              </div>
              {secret && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Can&apos;t scan? Enter this secret manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm font-mono break-all">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600"
                      title="Copy secret"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
              <form onSubmit={handleVerify} className="space-y-3">
                <label htmlFor="mfa-verify-code" className="block text-sm font-medium text-gray-700">
                  Enter the 6-digit code from your app
                </label>
                <input
                  id="mfa-verify-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-center text-xl tracking-widest"
                  placeholder="000000"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || code.length !== 6}
                    className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verifying..." : "Verify & Enable"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
