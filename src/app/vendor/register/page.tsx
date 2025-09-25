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

export default function VendorRegistrationPage() {
  const { user } = useAuth();
  const [vendorRegistrationError, setvendorRegistrationError] =
    useState<boolean>(false);
  const [vendorLoadingState, setVendorLoadingState] = useState<boolean>(true);
  const [vendorSuccessState, setVendorSuccessState] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    // firstName: "",
    // lastName: "",
    // email: "",
    // phone: "",
    // password: "",
    // confirmPassword: "",

    // Business Information
    businessName: "",
    businessType: "",
    businessDescription: "",
    website: "",

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
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};

    // if (currentStep === 1) {
    //   if (!formData.firstName) newErrors.firstName = "First name is required";
    //   if (!formData.lastName) newErrors.lastName = "Last name is required";
    //   if (!formData.email) newErrors.email = "Email is required";
    //   if (!formData.phone) newErrors.phone = "Phone number is required";
    //   if (!formData.password) newErrors.password = "Password is required";
    //   if (formData.password !== formData.confirmPassword) {
    //     newErrors.confirmPassword = "Passwords do not match";
    //   }
    // }

    if (currentStep === 1) {
      if (!formData.businessName)
        newErrors.businessName = "Business name is required";
      if (!formData.businessType)
        newErrors.businessType = "Business type is required";
      if (!formData.businessDescription)
        newErrors.businessDescription = "Business description is required";
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
      if (!formData.taxCertificate)
        newErrors.taxCertificate = "Tax certificate is required";
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

  function sanitizeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9._-]/g, "_");
  }

  // FUNCTION TO HANDLE FILE UPLOADING TO SUPABASE
  const uploadFile = async (file: any) => {
    if (!file) return null;
    const safeFileName = sanitizeFileName(file.name);

    // Create a unique file path.
    const filePath = `private/${user?.id}/${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("vendor-documents")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      setvendorRegistrationError(true);
      return null;
    }

    // Get the public URL of the uploaded file.
    const { data: urlData } = supabase.storage
      .from("vendor-documents")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. First, validate the final step to make sure the terms are checked
    if (!validateStep(4)) {
      return; // Stop submission if validation fails
    }

    setIsSubmitting(true); // Set loading state to true

    try {
      // 2. Perform all async operations (file uploads)
      console.log("Uploading files...");
      const businessLicenseUrl = await uploadFile(formData.businessLicense);
      const taxCertificateUrl = await uploadFile(formData.taxCertificate);
      const bankStatementUrl = await uploadFile(formData.bankStatement);

      // Add a check to ensure all files were uploaded successfully before proceeding
      if (!businessLicenseUrl || !taxCertificateUrl || !bankStatementUrl) {
        // The uploadFile function already sets the error state, but we can throw to be safe
        throw new Error("One or more file uploads failed.");
      }

      console.log("Files uploaded. Inserting data...");

      // 3. Insert the data into Supabase
      const { data, error } = await supabase
        .from("vendors")
        .insert({
          user_id: user?.id,
          business_name: formData.businessName,
          business_type: formData.businessType,
          business_description: formData.businessDescription,
          website_url: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.zipCode,
          country: formData.country,
          kyc_documents: [
            {
              business_license_url: businessLicenseUrl,
              tax_certificate_url: taxCertificateUrl,
              bank_statement_url: bankStatementUrl,
            },
          ],
        })
        .select();

      if (error) {
        // Let the catch block handle this
        throw error;
      }

      // 4. On success, update the final states
      console.log("Successfully inserted data:", data);
      setVendorSuccessState(true);
      setStep(step + 1); // <-- Now we change the step to show the success screen
    } catch (error) {
      console.error("Error during submission:", error);
      setvendorRegistrationError(true); // Show the full-page error component
    } finally {
      // 5. Always turn off the specific loading state
      setIsSubmitting(false);
    }
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

  if (vendorRegistrationError) {
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {steps.map((stepItem, index) => (
              <div key={stepItem.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepItem.number
                      ? "bg-primary-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > stepItem.number ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    stepItem.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 ${
                      step > stepItem.number ? "bg-primary-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            {steps.map((stepItem) => (
              <span
                key={stepItem.number}
                className="text-sm text-gray-600 mx-4"
              >
                {stepItem.title}
              </span>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Business Information
              </h2>
              <div className="space-y-6">
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
                    <option value="individual">Individual Artisan</option>
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
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Business Address
              </h2>
              <div className="space-y-6">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Business Documents
              </h2>
              <p className="text-gray-600 mb-6">
                Please upload the following documents to verify your business.
                All documents should be in PDF, JPG, or PNG format and maximum
                of 5MB.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business License/Registration *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.businessLicense
                        ? formData.businessLicense.name
                        : "Click to upload or drag and drop"}
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
                      className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
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
                    Tax Certificate *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.taxCertificate
                        ? formData.taxCertificate.name
                        : "Click to upload or drag and drop"}
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
                      className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
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
                    Bank Statement (Last 3 months) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.bankStatement
                        ? formData.bankStatement.name
                        : "Click to upload or drag and drop"}
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
                      className="cursor-pointer bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Terms & Conditions
              </h2>

              <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Kanyiji Marketplace Terms
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    By becoming a vendor on Kanyiji, you agree to our
                    marketplace terms and conditions, including commission
                    rates, payment terms, and quality standards.
                  </p>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={(e) =>
                        handleInputChange("agreeToTerms", e.target.checked)
                      }
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the Kanyiji Marketplace Terms and Conditions *
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Privacy Policy
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    We collect and process your personal data in accordance with
                    our Privacy Policy to provide our services and comply with
                    legal obligations.
                  </p>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.agreeToPrivacy}
                      onChange={(e) =>
                        handleInputChange("agreeToPrivacy", e.target.checked)
                      }
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the Privacy Policy *
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
          {isSubmitting ? <LoadingSpinner /> : ""}

          {vendorSuccessState && (
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
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <button
                onClick={step === 4 ? handleSubmit : handleNext}
                disabled={isSubmitting} // Disable button while submitting
                className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
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
