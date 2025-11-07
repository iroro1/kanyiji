"use client";

import { useEffect, useState } from "react";
import { InitializePayment } from "./Api";

type PaystackModalProps = {
  amountNaira: number; // amount in Naira
  email: string;
  metadata?: Record<string, string | number | boolean>;
  referencePrefix?: string;
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
  //   referencePrefix = "ETWEB",
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
    if (!window.PaystackPop) return;
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxx";
    const amountKobo = Math.round((amountNaira || 0) * 100);
    // const reference = `${referencePrefix}-${Date.now()}`;

    const result = await InitializePayment({
      email: email,
      amount: amountKobo,
      metadata,
    });

    const handler = window.PaystackPop.setup({
      key,
      email,
      amount: amountKobo,
      ref: result?.data.reference,
      callback: function (response: { reference: string }) {
        onSuccess?.(response.reference);
      },
      onClose: function () {
        onClose?.();
      },
    });

    // console.log(reference);
    handler.openIframe();
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
