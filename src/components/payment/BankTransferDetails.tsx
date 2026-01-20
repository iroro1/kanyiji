"use client";

import { useState, useEffect } from "react";
import { Copy, Check, X, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface BankTransferDetailsProps {
  accountNumber: string;
  bankName: string;
  accountName: string;
  amount: number;
  reference: string;
  expiresAt?: string; // ISO timestamp for expiry
  onClose?: () => void;
  onBankChange?: () => void; // Callback to change bank
}

export default function BankTransferDetails({
  accountNumber,
  bankName,
  accountName,
  amount,
  reference,
  expiresAt,
  onClose,
  onBankChange,
}: BankTransferDetailsProps) {
  const { notify } = useToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  // Calculate and update countdown timer
  useEffect(() => {
    if (!expiresAt) {
      // Default to 30 minutes if no expiry provided
      const defaultExpiry = new Date(Date.now() + 30 * 60 * 1000);
      const updateTimer = () => {
        const now = new Date();
        const diff = defaultExpiry.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining("Expired");
          return;
        }
        
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }

    const expiryDate = new Date(expiresAt);
    const updateTimer = () => {
      const now = new Date();
      const diff = expiryDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining("Expired");
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      notify(`${fieldName} copied to clipboard!`, "success");
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      notify("Failed to copy to clipboard", "error");
    }
  };

  // Format bank name to match Paystack Titan format
  const displayBankName = bankName.includes("Titan") || bankName.includes("Paystack") 
    ? bankName 
    : `Paystack-${bankName}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Transfer {formatPrice(amount)} to {accountName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Paystack Checkout</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-6">

          {/* Bank Name with Change Bank option */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 uppercase">
                Bank Name
              </label>
              {onBankChange && (
                <button
                  onClick={onBankChange}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  CHANGE BANK
                </button>
              )}
            </div>
            <div className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-semibold text-gray-900">
              {displayBankName}
            </div>
          </div>

          {/* Account Number */}
          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Account Number
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg text-gray-900">
                {accountNumber}
              </div>
              <button
                onClick={() => copyToClipboard(accountNumber, "Account Number")}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy account number"
              >
                {copiedField === "Account Number" ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm font-semibold text-gray-700 uppercase block mb-2">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 font-semibold text-lg text-gray-900">
                {formatPrice(amount)}
              </div>
              <button
                onClick={() => copyToClipboard(amount.toString(), "Amount")}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy amount"
              >
                {copiedField === "Amount" ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Search for <strong>{displayBankName}</strong> or <strong>{displayBankName.split('-').reverse().join('-')}</strong> on your bank app. Use this account for this transaction only.
            </p>
          </div>

          {/* Timer */}
          {timeRemaining && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-green-600">₦</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Expires in</p>
              <p className="text-xl font-bold text-gray-900">{timeRemaining}</p>
            </div>
          )}

          {/* Action Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-colors"
            >
              I've sent the money
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

