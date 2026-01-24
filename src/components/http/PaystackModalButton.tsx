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
    // V1 API (deprecated but still supported)
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
      // V2 API (current)
      new: () => PaystackPopInstance;
    };
    // Prevent inline checkout auto-initialization
    paystackOptions?: any;
  }
  
  interface PaystackPopInstance {
    newTransaction: (config: {
      key: string;
      email: string;
      amount: number;
      ref: string;
      channels?: string[];
      metadata?: Record<string, string | number | boolean>;
      onSuccess: (response: {
        reference: string;
        metadata?: Record<string, string | number | boolean>;
      }) => void;
      onCancel: () => void;
    }) => void;
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
    // Check if PaystackPop is already available
    if (window.PaystackPop) {
      setReady(true);
      return;
    }
    
    // Load Paystack script only when needed (for popup mode)
    // Prevent inline checkout auto-initialization by ensuring script is not in a form
    // and by loading it dynamically only when needed
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.setAttribute("data-paystack-mode", "popup"); // Explicitly set mode
    script.onload = () => {
      // Wait a moment for PaystackPop to be available
      setTimeout(() => {
        if (window.PaystackPop) {
          setReady(true);
          // Prevent any auto-initialization of inline checkout
          if (window.paystackOptions) {
            delete window.paystackOptions;
          }
        } else {
          console.warn("PaystackPop not available after script load");
          setReady(false);
        }
      }, 100);
    };
    script.onerror = () => {
      console.error("Failed to load Paystack script");
      setReady(false);
    };
    // Append to body (not inside a form) to prevent inline checkout auto-init
    // This is critical - inline checkout requires the script to be in a form
    document.body.appendChild(script);
    
    return () => {
      // Don't remove script on unmount - it might be used by other components
    };
  }, []);

  const handlePay = async () => {
    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxx";
    const amountKobo = Math.round((amountNaira || 0) * 100);

    if (amountKobo <= 0) {
      console.error("Invalid amount:", amountKobo);
      onClose?.();
      return;
    }

    if (!email || !email.includes("@")) {
      console.error("Invalid email:", email);
      onClose?.();
      return;
    }

    try {
      // Initialize payment first - this returns a transaction reference
      const result = await InitializePayment({
        email: email,
        amount: amountKobo,
        metadata,
        channels: channels,
      });

      console.log("Payment initialization result:", {
        status: result?.status,
        hasReference: !!result?.data?.reference,
        reference: result?.data?.reference,
      });

      if (!result?.status || !result?.data?.reference) {
        console.error("Failed to initialize payment:", result);
        onClose?.();
        return;
      }

      // Ensure PaystackPop is available
      if (!window.PaystackPop) {
        console.error("PaystackPop not available after initialization");
        onClose?.();
        return;
      }
      
      try {
        // The issue: Paystack's inline.js V1 script calls /checkout/request_inline 
        // even when using popup mode, causing 400 errors.
        // Solution: Use redirect-based checkout instead of popup to avoid this issue.
        
        // Check if we have an authorization_url from the initialize response
        // This is the redirect URL for Paystack checkout
        if (result?.data?.authorization_url) {
          console.log("Using Paystack redirect checkout (authorization_url)");
          // Redirect to Paystack checkout page
          window.location.href = result.data.authorization_url;
          return;
        }
        
        // Fallback: Try popup mode if authorization_url is not available
        // But this may still trigger the 400 error from /checkout/request_inline
        console.log("Authorization URL not available, attempting popup mode");
        
        // Prevent any inline checkout initialization
        if (typeof window !== 'undefined') {
          const paystackForms = document.querySelectorAll('[data-paystack]');
          paystackForms.forEach(form => {
            form.removeAttribute('data-paystack');
          });
          
          if (window.paystackOptions) {
            delete window.paystackOptions;
          }
        }
        
        // Ensure PaystackPop is available
        if (!window.PaystackPop) {
          console.error("PaystackPop not available for popup mode");
          // If popup fails, try redirect as last resort
          if (result?.data?.reference) {
            const redirectUrl = `https://checkout.paystack.com/${result.data.reference}`;
            console.log("Falling back to Paystack redirect URL:", redirectUrl);
            window.location.href = redirectUrl;
            return;
          }
          onClose?.();
          return;
        }
        
        // Use V1 API (setup + openIframe) - may trigger /checkout/request_inline
        console.log("Using Paystack V1 API (setup + openIframe)");
        const handler = window.PaystackPop.setup({
          key,
          email,
          amount: amountKobo,
          ref: result.data.reference,
          channels: channels || ['card', 'bank', 'bank_transfer', 'ussd', 'qr'],
          metadata: metadata || {},
          callback: function (response: { reference: string }) {
            console.log("Paystack callback:", response);
            if (response && response.reference) {
              onSuccess?.(response.reference, metadata);
            } else {
              console.error("Invalid Paystack response:", response);
              onClose?.();
            }
          },
          onClose: function () {
            console.log("Paystack popup closed");
            onClose?.();
          },
        });
        
        if (handler && typeof handler.openIframe === 'function') {
          console.log("Opening Paystack popup with reference:", result.data.reference);
          setTimeout(() => {
            try {
              handler.openIframe();
            } catch (iframeError: any) {
              console.error("Error calling Paystack openIframe:", iframeError);
              // If popup fails, try redirect as fallback
              if (result?.data?.reference) {
                const redirectUrl = `https://checkout.paystack.com/${result.data.reference}`;
                console.log("Popup failed, falling back to redirect:", redirectUrl);
                window.location.href = redirectUrl;
              } else {
                onClose?.();
              }
            }
          }, 100);
        } else {
          console.error("Paystack handler.openIframe not available");
          // Fallback to redirect
          if (result?.data?.reference) {
            const redirectUrl = `https://checkout.paystack.com/${result.data.reference}`;
            window.location.href = redirectUrl;
          } else {
            onClose?.();
          }
        }
      } catch (error: any) {
        console.error("Error opening Paystack checkout:", error);
        // Last resort: try redirect
        if (result?.data?.reference) {
          const redirectUrl = `https://checkout.paystack.com/${result.data.reference}`;
          console.log("Error occurred, trying redirect fallback:", redirectUrl);
          window.location.href = redirectUrl;
        } else {
          onClose?.();
        }
      }
    } catch (error: any) {
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
