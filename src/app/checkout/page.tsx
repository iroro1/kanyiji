"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Truck, Lock } from "lucide-react";
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
import { calculateShippingFee, type ShippingLocation, type ShippingMethod } from "@/utils/shippingCalculator";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const { notify } = useToast();
  const router = useRouter();
  const { state, dispatch } = useCart();
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingMethod, setShippingMethod] = useState("Standard Delivery");
  const [shippingData, setShippingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    zipCode: "",
  });

  const [checkoutItem, setCheckoutItem] = useState([]);
  const [checkOutQuantity, setCheckOutQuantity] = useState(1);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const items = state.items;
  
  // Calculate shipping fee based on destination and total weight
  // Add 1kg to every item weight from the database (Bug #10)
  const totalWeight = useMemo(() => {
    const total = items.reduce((sum, item) => {
      // Use actual product weight from database if available, otherwise default to 1kg per item
      const itemWeight = (item.weight && item.weight > 0) ? item.weight : 1;
      // Add 1kg to each item's weight, then multiply by quantity
      const weightWithExtra = (itemWeight + 1) * item.quantity;
      return sum + weightWithExtra;
    }, 0);
    
    return total;
  }, [items]);

  const shippingFee = useMemo(() => {
    // Don't calculate shipping until at least state or city is provided
    if (!shippingData.state && !shippingData.city) {
      return null; // Return null to indicate shipping not calculated yet
    }

    const location: ShippingLocation = {
      country: shippingData.country || "Nigeria",
      state: shippingData.state,
      city: shippingData.city,
    };

    // Convert shipping method string to ShippingMethod type
    const method: ShippingMethod = shippingMethod === "Express Delivery" ? "express" : "standard";
    
    // Calculate shipping fee using totalWeight which includes the extra 1kg per item
    const result = calculateShippingFee(totalWeight, location, method);
    return result ? result.price : null; // Return null if calculation fails
  }, [shippingData.state, shippingData.city, shippingData.country, totalWeight, shippingMethod]);

  const shipping = shippingFee ?? 0; // Use nullish coalescing to handle null
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
          // Clear cart after successful payment
          dispatch({ type: "CLEAR_CART" });
          
          // Invalidate orders cache so new order appears immediately
          if (user?.id) {
            // Invalidate queries to refresh data after order
            queryClient.invalidateQueries({ queryKey: ["userOrders", user.id] });
            // Invalidate all product queries to refresh stock quantities - remove all cached data
            queryClient.removeQueries({ queryKey: ["singleProduct"] });
            queryClient.removeQueries({ queryKey: ["allProducts"] });
            // Force refetch of all product-related queries
            queryClient.refetchQueries({ queryKey: ["singleProduct"] });
            queryClient.refetchQueries({ queryKey: ["allProducts"] });
          }
          
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
        title="Sign In Required"
        message="Please sign in to your account to complete your purchase. Create an account if you don't have one yet."
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

        <div className={`grid grid-cols-1 ${step !== 3 ? 'lg:grid-cols-3' : ''} gap-8`}>
          {/* Main Content */}
          <div className={step !== 3 ? "lg:col-span-2" : "lg:col-span-full"}>
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={shippingData.country}
                    onChange={(event) =>
                      handleShippingData("country", event.target.value)
                    }
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="UK">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="Canada">Canada</option>
                  </select>
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
                    <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-primary-50 border-primary-200">
                      <input
                        type="radio"
                        name="shipping"
                        value="standard"
                        className="mr-3"
                        checked={shippingMethod === "Standard Delivery"}
                        onChange={() => setShippingMethod("Standard Delivery")}
                      />
                      <div className="flex-1">
                        <div className="font-medium">Kanyiji Standard Shipping</div>
                        <div className="text-sm text-gray-600">
                          {shippingData.state || shippingData.city 
                            ? `3-7 business days • ${totalWeight.toFixed(1)} kg`
                            : "Enter destination to calculate shipping"}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {shippingFee === null 
                          ? "Enter destination" 
                          : shippingFee > 0 
                            ? formatPrice(shippingFee) 
                            : "Free"}
                      </div>
                    </label>
                    
                    {/* Express Delivery - Only for International (UK, US, Canada) */}
                    {shippingData.country && 
                     (shippingData.country.toLowerCase() === "uk" ||
                      shippingData.country.toLowerCase() === "united kingdom" ||
                      shippingData.country.toLowerCase() === "us" ||
                      shippingData.country.toLowerCase() === "usa" ||
                      shippingData.country.toLowerCase() === "united states" ||
                      shippingData.country.toLowerCase() === "canada") && (
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          className="mr-3"
                          checked={shippingMethod === "Express Delivery"}
                          onChange={() => setShippingMethod("Express Delivery")}
                        />
                        <div className="flex-1">
                          <div className="font-medium">Express International Shipping</div>
                          <div className="text-sm text-gray-600">
                            5-7 business days • From ₦62,000
                          </div>
                        </div>
                        <div className="font-semibold">
                          {shippingMethod === "Express Delivery" ? "₦62,000" : "Select"}
                        </div>
                      </label>
                    )}
                    
                    {shippingFee !== null && shippingFee > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                        <p className="font-medium mb-1">Shipping Details:</p>
                        <p>Weight: {totalWeight.toFixed(1)} kg</p>
                        <p>Destination: {shippingData.city || shippingData.state || shippingData.country || "Not specified"}</p>
                        <p>Method: {shippingMethod}</p>
                        <p className="mt-1 font-semibold">Rate: {formatPrice(shipping)}</p>
                      </div>
                    )}
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
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      paymentMethod === "card" 
                        ? "bg-primary-50 border-primary-200" 
                        : "border-gray-200"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        className="mr-3"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        defaultChecked
                      />
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-primary-600" />
                        <span className="font-medium">Credit/Debit Card</span>
                      </div>
                    </label>
                    <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      paymentMethod === "bank" 
                        ? "bg-primary-50 border-primary-200" 
                        : "border-gray-200"
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        className="mr-3"
                        checked={paymentMethod === "bank"}
                        onChange={() => setPaymentMethod("bank")}
                      />
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span className="font-medium">Bank Transfer</span>
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
                      channels={['card']}
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
                                  vendor_id: (item as any).vendor_id,
                                  price: item.price,
                                  image: item.product_images?.[0]?.image_url || '',
                                  quantity: item.quantity,
                                  size: (item as any).selectedVariant?.size || null,
                                  color: (item as any).selectedVariant?.color || null,
                                  variantId: (item as any).selectedVariant?.variantId || null,
                                  address: {
                                    ...shippingData,
                                    shippingFee: shipping,
                                  },
                                }))
                              ),
                        totalAmount:
                          checkoutItem.length !== 0
                            ? checkoutOrders[0].price * checkOutQuantity +
                              shipping
                            : state.total + shipping,
                        shippingFee: shipping,
                        shippingMethod: shippingMethod,
                        subtotal: checkoutItem.length !== 0
                          ? checkoutOrders[0].price * checkOutQuantity
                          : state.total,

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
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span className="font-medium text-blue-900">
                          Bank Transfer via Paystack
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 mb-4">
                        Pay directly from your bank account. You'll receive bank transfer details after clicking the payment button.
                      </p>
                    </div>
                    <PaystackModalButton
                      channels={['bank']}
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
                                  address: shippingData,
                                }))
                              )
                            : JSON.stringify(
                                items?.map((item) => ({
                                  name: item.name,
                                  id: item.id,
                                  vendor_id: (item as any).vendor_id,
                                  price: item.price,
                                  image: item.product_images?.[0]?.image_url || '',
                                  quantity: item.quantity,
                                  size: (item as any).selectedVariant?.size || null,
                                  color: (item as any).selectedVariant?.color || null,
                                  variantId: (item as any).selectedVariant?.variantId || null,
                                  address: {
                                    ...shippingData,
                                    shippingFee: shipping,
                                  },
                                }))
                              ),
                        totalAmount:
                          checkoutItem.length !== 0
                            ? checkoutOrders[0].price * checkOutQuantity +
                              shipping
                            : state.total + shipping,
                        shippingFee: shipping,
                        shippingMethod: shippingMethod,
                        subtotal: checkoutItem.length !== 0
                          ? checkoutOrders[0].price * checkOutQuantity
                          : state.total,
                        cartCount: items.length,
                        paymentMethod: "bank_transfer",
                      }}
                      className="w-full bg-yellow-500 text-text-inverse py-4 rounded-xl font-semibold text-center block hover:bg-primary-dark transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      onSuccess={handlePayment}
                      onClose={handlePaymentClose}
                    >
                      {checkoutItem.length !== 0
                        ? paymentLoading
                          ? "Processing..."
                          : `Pay ${formatPrice(
                              checkoutOrders[0].price * checkOutQuantity +
                                shipping
                            )}`
                        : paymentLoading
                        ? "Processing..."
                        : `Pay ${formatPrice(state.total + shipping)}`}
                    </PaystackModalButton>
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

          {/* Order Summary - Hidden on confirmation step */}
          {step !== 3 && (
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
                      src={item.product_images?.[0]?.image_url || '/placeholder-image.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {item.name}
                      </h4>
                      {/* Display size and color if available */}
                      {(item as any).selectedVariant && ((item as any).selectedVariant.size || (item as any).selectedVariant.color) && (
                        <p className="text-gray-500 text-xs mt-1">
                          {((item as any).selectedVariant.size && (item as any).selectedVariant.color) 
                            ? `Size: ${(item as any).selectedVariant.size} • Color: ${(item as any).selectedVariant.color}`
                            : (item as any).selectedVariant.size 
                            ? `Size: ${(item as any).selectedVariant.size}`
                            : (item as any).selectedVariant.color
                            ? `Color: ${(item as any).selectedVariant.color}`
                            : ''}
                        </p>
                      )}
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
                    {shippingFee === null ? (
                      <span className="text-gray-400">Enter destination</span>
                    ) : shippingFee > 0 ? (
                      <>
                        ₦{shippingFee.toLocaleString()}
                        {shippingData.state || shippingData.city ? (
                          <span className="text-xs text-gray-500 block">
                            ({totalWeight.toFixed(1)} kg)
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-green-600">Free</span>
                    )}
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
          )}
        </div>
      </div>
    </div>
  );
}

