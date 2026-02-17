"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Upload,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import CustomError from "@/app/error";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRegisterVendor } from "@/components/http/QueryHttp";

export default function VendorRegistrationPage() {
  const { user, isLoading: authLoading } = useAuth();
  // const [vendorRegistrationError, setvendorRegistrationError] =
  //   useState<boolean>(false);
  // const [vendorSuccessState, setVendorSuccessState] = useState<boolean>(false);
  // const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { registerVendor, isRegistering, isSuccess, isError, error } =
    useRegisterVendor(user?.id || "");

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Business Information
    businessName: "",
    businessType: "",
    businessDescription: "",
    businessRegistrationNumber: "",
    taxId: "",
    website: "",
    twitterHandle: "",
    account_information: "",

    // Address Information
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Nigeria",

    // Business Documents
    businessLicense: null as File | null,
    taxCertificate: null as File | null,
    bankStatement: null as File | null,

    // Terms
    agreeToTerms: false,
    agreeToPrivacy: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: string,
    value: string | boolean | File | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general error when user starts interacting
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.businessName)
        newErrors.businessName = "Business name is required";
      if (!formData.businessType)
        newErrors.businessType = "Business type is required";
      if (!formData.businessDescription)
        newErrors.businessDescription = "Business description is required";
      if (!formData.businessRegistrationNumber?.trim())
        newErrors.businessRegistrationNumber = "Business registration number is required";
    }

    if (currentStep === 2) {
      if (!formData.address) newErrors.address = "Address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
    }

    if (currentStep === 3) {
      if (!formData.businessLicense)
        newErrors.businessLicense = "Business license is required";
      if (!formData.bankStatement)
        newErrors.bankStatement = "Bank statement is required";
    }

    if (currentStep === 4) {
      if (!formData.agreeToTerms)
        newErrors.agreeToTerms = "You must agree to the terms";
      if (!formData.agreeToPrivacy)
        newErrors.agreeToPrivacy = "You must agree to the privacy policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is authenticated before submitting
    if (!user || !user.id) {
      setErrors({
        general: "You must be signed in to register as a vendor. Please sign in first.",
      });
      return;
    }

    // 1. First, validate the final step to make sure the terms are checked
    if (!validateStep(4)) {
      return; // Stop submission if validation fails
    }
    // setIsSubmitting(true); // Set loading state to true
    registerVendor({ formData, user });
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const steps = [
    // { number: 1, title: "Personal Info", icon: User },
    { number: 1, title: "Business Info", icon: Building },
    { number: 2, title: "Address", icon: MapPin },
    { number: 3, title: "Documents", icon: FileText },
    { number: 4, title: "Terms", icon: CheckCircle },
  ];

  function validateFileSize(file: File, maxSizeMB = 5): string | null {
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      return `File size must not exceed ${maxSizeMB}MB`;
    }
    return null;
  }

  // Show loading while checking authentication
  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Check if user is authenticated - show message if not
  if (!user || !user.id) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You need to be signed in to register as a vendor. Please sign in to your account first, then you can complete your vendor registration.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/login?redirect=/vendor/register"
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup?redirect=/vendor/register"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <CustomError
        statusCode={500}
        title="Something went wrong"
        message="We are unable to complete your vendor application at this time, please try again later"
        retry={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Progress Steps */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center overflow-x-auto pb-2">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                      step >= stepItem.number
                        ? "bg-primary-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > stepItem.number ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      stepItem.number
                    )}
                  </div>
                  {/* Step label - visible on mobile */}
                  <span className="text-xs text-gray-600 mt-1 sm:hidden max-w-[60px] text-center leading-tight">
                    {stepItem.title.split(" ")[0]}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 sm:w-12 md:w-16 h-1 mx-1 sm:mx-2 ${
                      step > stepItem.number ? "bg-primary-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          {/* Step labels - hidden on mobile, visible on desktop */}
          <div className="hidden sm:flex justify-center mt-4">
            {steps.map((stepItem) => (
              <span
                key={stepItem.number}
                className="text-xs sm:text-sm text-gray-600 mx-2 sm:mx-4"
              >
                {stepItem.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}
          
          {/* API Error Message */}
          {isError && error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">
                {typeof error === 'string' 
                  ? error 
                  : error?.message || "An error occurred. Please try again."}
              </p>
            </div>
          )}
          {/* {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.firstName ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.lastName ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )} */}
          {step === 1 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Business Information
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.businessName ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.businessName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Type *
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) =>
                      handleInputChange("businessType", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.businessType ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select business type</option>
                    <option value="individual">Individual Entrepreneur</option>
                    <option value="small-business">Small Business</option>
                    <option value="medium-business">Medium Business</option>
                    <option value="cooperative">Cooperative</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.businessType && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessType}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) =>
                      handleInputChange("businessDescription", e.target.value)
                    }
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.businessDescription
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Describe your business, products, and what makes you unique..."
                  />
                  {errors.businessDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessDescription}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.businessRegistrationNumber}
                    onChange={(e) =>
                      handleInputChange("businessRegistrationNumber", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.businessRegistrationNumber ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g. RC123456"
                  />
                  {errors.businessRegistrationNumber && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessRegistrationNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax ID <span className="text-gray-400 text-xs">(optional – for future tax remittance)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={(e) =>
                      handleInputChange("taxId", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. TIN or VAT number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram handle <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.twitterHandle}
                    onChange={(e) =>
                      handleInputChange("twitterHandle", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. @yourbusiness"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor account information <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    value={formData.account_information}
                    onChange={(e) =>
                      handleInputChange("account_information", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. bank account details, payment preferences, or other account notes"
                  />
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Business Address
              </h2>
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      errors.address ? "border-red-300" : "border-gray-300"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.city ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) =>
                        handleInputChange("state", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.state ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.state && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.state}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.zipCode ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Business Documents
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Please upload the following documents to verify your business.
                All documents should be in PDF, JPG, or PNG format and maximum
                of 5MB.
              </p>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business License/Registration *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
                      {formData.businessLicense
                        ? formData.businessLicense.name
                        : "Tap to upload"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const error = validateFileSize(file);
                          if (error) {
                            alert(error);
                            e.target.value = "";
                            return;
                          }
                        }
                        handleFileUpload(
                          "businessLicense",
                          e.target.files?.[0] || null
                        );
                      }}
                      className="hidden"
                      id="businessLicense"
                    />
                    <label
                      htmlFor="businessLicense"
                      className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors inline-block"
                    >
                      Choose File
                    </label>
                  </div>
                  {errors.businessLicense && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.businessLicense}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Certificate <span className="text-gray-400 text-xs">(optional – for future tax remittance)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
                      {formData.taxCertificate
                        ? formData.taxCertificate.name
                        : "Tap to upload"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const error = validateFileSize(file);
                          if (error) {
                            alert(error);
                            e.target.value = "";
                            return;
                          }
                        }
                        handleFileUpload(
                          "taxCertificate",
                          e.target.files?.[0] || null
                        );
                      }}
                      className="hidden"
                      id="taxCertificate"
                    />
                    <label
                      htmlFor="taxCertificate"
                      className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors inline-block"
                    >
                      Choose File
                    </label>
                  </div>
                  {errors.taxCertificate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.taxCertificate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank statement for one month or utility bill *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center">
                    <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 break-words">
                      {formData.bankStatement
                        ? formData.bankStatement.name
                        : "Tap to upload"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) {
                          const error = validateFileSize(file);
                          if (error) {
                            alert(error);
                            e.target.value = "";
                            return;
                          }
                        }
                        handleFileUpload(
                          "bankStatement",
                          e.target.files?.[0] || null
                        );
                      }}
                      className="hidden"
                      id="bankStatement"
                    />
                    <label
                      htmlFor="bankStatement"
                      className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 sm:px-6 sm:py-2.5 text-sm sm:text-base rounded-lg transition-colors inline-block"
                    >
                      Choose File
                    </label>
                  </div>
                  {errors.bankStatement && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.bankStatement}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                Terms & Conditions
              </h2>

              <div className="space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                    Kanyiji Marketplace Terms
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    By becoming a vendor on Kanyiji, you agree to our
                    marketplace terms and conditions, including commission
                    rates, payment terms, and quality standards.
                  </p>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) =>
                        handleInputChange("agreeToTerms", e.target.checked)
                      }
                      className="mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="/policies/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Terms and Conditions</a> *
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                    Privacy Policy
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    We collect and process your personal data in accordance with
                    our Privacy Policy to provide our services and comply with
                    legal obligations.
                  </p>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={formData.agreeToPrivacy}
                      onChange={(e) =>
                        handleInputChange("agreeToPrivacy", e.target.checked)
                      }
                      className="mt-1 mr-3 flex-shrink-0"
                    />
                    <span className="text-xs sm:text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Privacy Policy</a> *
                    </span>
                  </label>
                  {errors.agreeToPrivacy && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.agreeToPrivacy}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          {isRegistering ? <LoadingSpinner /> : ""}

          {isSuccess && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your vendor application. Our team will review your
                information and get back to you within 2-3 business days.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">
                  Application ID:{" "}
                  <span className="font-semibold">#VND-2024-001</span>
                </p>
              </div>
              <Link
                href="/"
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Return to Home
              </Link>
            </div>
          )}
          {/* Navigation Buttons */}
          {step < 5 ? (
            <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                Previous
              </button>

              <button
                onClick={step === 4 ? handleSubmit : handleNext}
                disabled={isRegistering} // Disable button while submitting
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                {step === 4 ? "Submit Application" : "Next"}
              </button>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
}
