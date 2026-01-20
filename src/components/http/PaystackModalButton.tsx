"use client";

import { useEffect, useState } from "react";
import { InitializePayment } from "./Api";

type PaystackModalProps = {
  amountNaira: number; // amount in Naira
  email: string;
  metadata?: Record<string, string | number | boolean>;
  referencePrefix?: string;
  channels?: string[]; // Payment channels: 'card', 'bank', etc.
  onSuccess?: (
    reference: string,
    metadata?: Record<string, string | number | boolean>
  ) => void;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
};

declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        channels?: string[];
        metadata?: Record<string, string | number | boolean>;
        callback: (response: {
          reference: string;
          metadata?: Record<string, string | number | boolean>;
        }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export default function PaystackModalButton({
  amountNaira,
  email,
  metadata,
  channels = ['card', 'bank', 'bank_transfer', 'ussd', 'qr'], // Default to all common channels
  onSuccess,
  onClose,
  className,
  children,
}: PaystackModalProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => setReady(false);
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxx";
    const amountKobo = Math.round((amountNaira || 0) * 100);

    try {
      // Initialize payment first
      const result = await InitializePayment({
        email: email,
        amount: amountKobo,
        metadata,
        channels: channels,
      });

      if (!result?.data?.reference) {
        console.error("Failed to initialize payment");
        onClose?.();
        return;
      }

      // Open Paystack modal with all enabled payment methods
      if (!window.PaystackPop) return;
      
      const handler = window.PaystackPop.setup({
        key,
        email,
        amount: amountKobo,
        ref: result.data.reference,
        channels: channels, // Use all provided channels
        metadata,
        callback: function (response: { reference: string }) {
          onSuccess?.(response.reference, metadata);
        },
        onClose: function () {
          onClose?.();
        },
      });
      handler.openIframe();
    } catch (error) {
      console.error("Payment initialization error:", error);
      onClose?.();
    }
  };

  return (
    <button
      disabled={!ready || amountNaira <= 0}
      onClick={handlePay}
      className={className}
    >
      {children || (ready ? "Pay with Paystack" : "Loading...")}
    </button>
  );
}
