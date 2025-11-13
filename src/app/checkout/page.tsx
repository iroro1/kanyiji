"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Truck, Shield, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import PaystackModalButton from "@/components/http/PaystackModalButton";
import { VerifyPayment } from "@/components/http/Api";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import CustomError from "../error";
import { validateSignupForm } from "@/components/ui/ValidateInputs";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const { notify } = useToast();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("card");
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

  const [checkoutItem, setCheckoutItem] = useState([]);
  const [checkOutQuantity, setCheckOutQuantity] = useState(1);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const { state } = useCart();
  const items = state.items;
  const shipping = 800;
  const handlePlaceOrder = async () => {
    const validationErrors = validateSignupForm(shippingData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // Stop submit if there are errors
    }

    setStep(2);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("checkoutItem");
    if (storedData) {
      const buyNowItem = JSON.parse(storedData);
      setCheckoutItem(buyNowItem);
    }
  }, []);

  const checkoutOrders = checkoutItem.length !== 0 ? checkoutItem : items;

  const handlePayment = (ref: string) => {
    (async () => {
      try {
        setPaymentLoading(true);

        const result = await VerifyPayment(ref);
        if (!result) {
          notify("Payment verification failed", "error");
          return;
        }

        try {
          // router.push(
          //   `/payment-success?orderId=ORD-${Date.now()}&transactionId=${
          //     result.reference
          //   }`
          // );
          setStep(3);
        } catch {
          notify("Payment failed. Please try again.", "error");
          router.push(`/payment-failed?error=Payment processing failed`);
        }
      } catch (err) {
        console.error(err);
        notify("Payment verification failed", "error");
      } finally {
        setPaymentLoading(false);
      }
    })();
  };

  const handlePaymentClose = () => {
    notify("Payment cancelled", "info");
  };

  if (!user) {
    return (
      <CustomError
        statusCode={403}
        title="Access Restricted"
        message="Please sign in to your account to access this page."
      />
    );
  }

  function handleShippingData(field: string, value: string) {
    setShippingData((prevValue) => ({
      ...prevValue,
      [field]: value,
    }));
  }

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
                      onChange={(event) =>
                        handleShippingData("firstName", event.target.value)
                      }
                    />

                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Doe"
                      onChange={(event) =>
                        handleShippingData("lastName", event.target.value)
                      }
                    />

                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
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
                    onChange={(event) =>
                      handleShippingData("email", event.target.value)
                    }
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+234 801 234 5678"
                    onChange={(event) =>
                      handleShippingData("phone", event.target.value)
                    }
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="123 Main Street"
                    onChange={(event) =>
                      handleShippingData("address", event.target.value)
                    }
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
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
                      onChange={(event) =>
                        handleShippingData("city", event.target.value)
                      }
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Lagos"
                      onChange={(event) =>
                        handleShippingData("state", event.target.value)
                      }
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="100001"
                      onChange={(event) =>
                        handleShippingData("zipCode", event.target.value)
                      }
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
                  onClick={handlePlaceOrder}
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
                    </div>
                    <PaystackModalButton
                      amountNaira={
                        checkoutItem.length !== 0
                          ? checkoutOrders[0].price * checkOutQuantity +
                            shipping
                          : state.total + shipping
                      }
                      email={user?.email || "customer@example.com"}
                      metadata={{
                        product:
                          checkoutItem.length !== 0
                            ? JSON.stringify(
                                checkoutItem.map((item) => ({
                                  // name: item?.name,
                                  // id: item.id,
                                  // seller: item.seller_id,
                                  // price: item.price,
                                  // image: item.images[0],
                                  // quantity: item.quantity,
                                  address: shippingData,
                                }))
                              )
                            : JSON.stringify(
                                items?.map((item) => ({
                                  name: item.name,
                                  id: item.id,
                                  // seller: item?.seller_id,
                                  price: item.price,
                                  image: item.product_images[0].image_url,
                                  quantity: item.quantity,
                                  address: shippingData,
                                }))
                              ),
                        totalAmount:
                          checkoutItem.length !== 0
                            ? checkoutOrders[0].price * checkOutQuantity +
                              shipping
                            : state.total + shipping,

                        cartCount: items.length,
                        // addressId: selectedAddress?.id,
                      }}
                      className="w-full bg-yellow-500 text-text-inverse py-4 rounded-xl font-semibold text-center block hover:bg-primary-dark transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onSuccess={handlePayment}
                      onClose={handlePaymentClose}
                      // disabled={!selectedAddress || paymentLoading}
                    >
                      {checkoutItem.length !== 0
                        ? paymentLoading
                          ? "Verifying payment..."
                          : `Pay ${formatPrice(
                              checkoutOrders[0].price * checkOutQuantity +
                                shipping
                            )}`
                        : paymentLoading
                        ? "Verifying payment..."
                        : `Pay ${formatPrice(state.total + shipping)}`}
                    </PaystackModalButton>
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
                  {/* <button
                    onClick={
                      paymentMethod === "card"
                        ? initializePaystack
                        : handlePlaceOrder
                    }
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {paymentMethod === "card" ? "Pay with Card" : "Place Order"}
                  </button> */}
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
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <Image
                      width={500}
                      height={300}
                      src={item.product_images[0]?.image_url}
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
                    ₦{state.total.toLocaleString()}
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
                    ₦{(state.total + shipping).toLocaleString()}
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
