"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Truck, Shield, Lock } from "lucide-react";
import Link from "next/link";

// Declare Paystack global object
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: any) => {
        openIframe: () => void;
      };
    };
  }
}

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });

  // Load Paystack script
  useEffect(() => {
    if (paymentMethod === "card" && !paystackLoaded) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setPaystackLoaded(true);
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [paymentMethod, paystackLoaded]);

  // Initialize Paystack payment
  const initializePaystack = () => {
    if (window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key:
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_1234567890", // Replace with your actual Paystack public key
        email: "customer@email.com", // This should come from form data
        amount: total * 100, // Paystack expects amount in kobo (smallest currency unit)
        currency: "NGN",
        callback: function (response: any) {
          // Handle successful payment
          console.log("Payment successful:", response);
          handlePlaceOrder();
        },
        onClose: function () {
          // Handle payment modal close
          console.log("Payment modal closed");
        },
      });
      handler.openIframe();
    }
  };

  // Mock cart data - in real app this would come from cart context
  const cartItems = [
    {
      id: 1,
      name: "Handcrafted African Beaded Necklace",
      price: 2500,
      quantity: 2,
      image:
        "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    },
    {
      id: 2,
      name: "Traditional Nigerian Ankara Fabric",
      price: 3500,
      quantity: 1,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
    },
  ];

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = 800;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    if (
      !shippingData.email ||
      !shippingData.firstName ||
      !shippingData.lastName ||
      !shippingData.address
    ) {
      alert("Please fill in all required shipping information");
      return;
    }

    try {
      // Create order object
      const order = {
        id: `ORD-${Date.now()}`,
        orderNumber: `ORD-${Date.now()}`,
        date: new Date().toISOString(),
        status: "pending",
        total: total,
        items: cartItems,
        shippingAddress: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}, ${shippingData.zipCode}`,
        customerEmail: shippingData.email,
        customerName: `${shippingData.firstName} ${shippingData.lastName}`,
        customerPhone: shippingData.phone,
      };

      // Get existing orders from localStorage
      const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      existingOrders.push(order);
      localStorage.setItem("orders", JSON.stringify(existingOrders));

      // Clear cart
      localStorage.removeItem("cart");

      // Show success message
      alert(
        "Order placed successfully! You will receive a confirmation email shortly."
      );

      // Redirect to orders page
      window.location.href = "/orders";
    } catch (error) {
      console.error("Error placing order:", error);
      alert("There was an error placing your order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/cart"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 1
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                1
              </div>
              <div
                className={`w-16 h-1 ${
                  step >= 2 ? "bg-primary-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 2
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                2
              </div>
              <div
                className={`w-16 h-1 ${
                  step >= 3 ? "bg-primary-500" : "bg-gray-200"
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= 3
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                3
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <span className="text-sm text-gray-600 mr-8">Shipping</span>
            <span className="text-sm text-gray-600 mr-8">Payment</span>
            <span className="text-sm text-gray-600">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Shipping Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+234 801 234 5678"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Lagos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="100001"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        className="mr-3"
                        defaultChecked
                      />
                      <div className="flex-1">
                        <div className="font-medium">Standard Shipping</div>
                        <div className="text-sm text-gray-600">
                          3-5 business days
                        </div>
                      </div>
                      <div className="font-semibold">₦800</div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="shipping"
                        value="express"
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <div className="font-medium">Express Shipping</div>
                        <div className="text-sm text-gray-600">
                          1-2 business days
                        </div>
                      </div>
                      <div className="font-semibold">₦1,200</div>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Payment Information
                </h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        className="mr-3"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                      />
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                        <span>Credit/Debit Card</span>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        className="mr-3"
                        checked={paymentMethod === "bank"}
                        onChange={() => setPaymentMethod("bank")}
                      />
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-primary-600" />
                        <span>Bank Transfer</span>
                      </div>
                    </label>
                  </div>
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Secure Payment with Paystack
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mb-4">
                        Your payment information will be securely processed by
                        Paystack. No card details are stored on our servers.
                      </p>

                      {paystackLoaded ? (
                        <button
                          onClick={initializePaystack}
                          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-5 h-5" />
                          Pay with Card
                        </button>
                      ) : (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
                          <p className="text-sm text-blue-600">
                            Loading payment form...
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {paymentMethod === "bank" && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600 mb-3">
                      You will receive bank transfer details after placing your
                      order. Please complete the transfer within 24 hours to
                      confirm your order.
                    </p>
                    <div className="text-sm text-gray-500">
                      <p>Bank: First Bank of Nigeria</p>
                      <p>Account: 1234567890</p>
                      <p>Account Name: Kanyiji Marketplace</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Back to Shipping
                  </button>
                  <button
                    onClick={
                      paymentMethod === "card"
                        ? initializePaystack
                        : handlePlaceOrder
                    }
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {paymentMethod === "card" ? "Pay with Card" : "Place Order"}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-2xl">✅</div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Order Confirmed!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We've sent a confirmation email with
                  your order details.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-gray-600">
                    Order Number:{" "}
                    <span className="font-semibold">#KNJ-2024-001</span>
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link
                    href="/"
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/orders"
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    View Orders
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    ₦{shipping.toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-bold text-primary-600">
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout powered by Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
