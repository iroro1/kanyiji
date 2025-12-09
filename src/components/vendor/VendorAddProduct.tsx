"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Image, Info, Shirt, Tag, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProductImage } from "@/utils/supabase-images";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/utils/helpers";
import LoadingSpinner from "../ui/LoadingSpinner";
import { SuccessModal } from "../ui/ProductSuccessModal";
import { useFetchVendorDetails, useAddProduct } from "../http/QueryHttp";
import CustomError from "@/app/error";
import { useFetchCurrentUser } from "../http/QueryHttp";
import { CATEGORIES } from "@/data/categories";

// Define type for a single product variant
export type Variant = {
  size: string;
  color: string;
  quantity: number | string;
};

// Define type for an image preview
export type ImagePreview = {
  url: string;
  file: File;
  alt: string;
};

// --- Variant Management ---
export const colors = [
  "blue",
  "purple",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "black",
  "white",
  "gray",
  "gold",
  "Others",
];
export const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size", "Others"];

export interface ProductFormData {
  product_id?: string;
  name: string;
  weight: string;

  status: string;
  material: string;
  description: string;
  price: number;
  original_price: number;
  category: string;
  type?: string;
  sku: string;
  stock: number;
  isFeatured: boolean;
  quantity: string;

  // Enhanced fields for complete product display
  // brand: string;
  // warranty: string;
  // deliveryOptions: string[];
  // features: string[];
  // isFeatured: boolean;
}
// Categories are now imported from @/data/categories
// Use CATEGORIES.map(cat => cat.name) for category options

// Main App Component
function AddProductPage() {
  const { data: user } = useFetchCurrentUser();
  const { vendor, isPending } = useFetchVendorDetails(user ? user.id : "");

  const closeModal = () => setProductUploadSuccess(false);

  const { createProduct, isCreating, isError } = useAddProduct(
    user ? user.id : ""
  );

  // State for image previews with alt text
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [productLoading, setProductLoading] = useState<boolean>();
  const [productUploadSuccess, setProductUploadSuccess] =
    useState<boolean>(false);

  // State for managing product variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [currentVariant, setCurrentVariant] = useState<Variant>({
    size: "S",
    color: "blue",
    quantity: "",
  });

  // console.log(variants);

  // Consolidated state for the new product
  const [slug, setSlug] = useState("");
  const [newProduct, setNewProduct] = useState<ProductFormData>({
    // vendor_id: "",
    name: "",
    price: 0,
    sku: "",
    original_price: 0,
    quantity: "",
    description: "",
    category: "",
    status: "active",
    material: "",
    type: "",
    weight: "",
    stock: 0,
    isFeatured: false,
    // stock_quantity, colors, sizes are now handled by variants
  });

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    category?: string;
    sku?: string;
    stock?: string;
    salePercentage?: string;
  }>({});

  // Generate SKU once, only when name is entered and no SKU exists
  useEffect(() => {
    if (newProduct.name) {
      const sku = `SKU-${newProduct.name.slice(0, 3).toUpperCase()}-${Date.now()
        .toString(36)
        .toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

      setNewProduct((prev) => ({ ...prev, sku }));
    }
  }, [newProduct.name]);

  // ERROR MANAGEMENT
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      price?: string;
      category?: string;
      // sku?: string;
      stock?: string;
      salePercentage?: string;
    } = {};

    if (!newProduct.name.trim()) newErrors.name = "Product name is required";
    if (!newProduct.description.trim())
      newErrors.description = "Description is required";
    if (newProduct.price <= 0) newErrors.price = "Price must be greater than 0";
    if (newProduct.price > newProduct.original_price)
      newErrors.price = "Sale Price must be lower than original price";
    if (!newProduct.category) newErrors.category = "Category is required";
    // if (!newProduct.sku.trim()) newErrors.sku = "SKU is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // General input handler
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name") {
      setSlug(slugify(value));
    }

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleVariantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCurrentVariant((prev) => ({
      ...prev,
      [name]: name === "quantity" ? parseInt(value) || "" : value,
    }));
  };

  const handleAddVariant = () => {
    if (
      !currentVariant.size ||
      !currentVariant.color ||
      !currentVariant.quantity ||
      Number(currentVariant.quantity) <= 0
    ) {
      alert("Please fill all variant fields with a valid quantity.");
      return;
    }
    const exists = variants.some(
      (v) => v.size === currentVariant.size && v.color === currentVariant.color
    );
    if (exists) {
      alert("This size and color combination already exists.");
      return;
    }
    setVariants((prev) => [...prev, currentVariant]);
    setCurrentVariant({ size: "S", color: "blue", quantity: "" }); // Reset form
  };

  const handleRemoveVariant = (indexToRemove: number) => {
    setVariants((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Image Management ---
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const files = Array.from(selectedFiles);
    const newPreviews: ImagePreview[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      alt: "", // Initialize with empty alt text
    }));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleAltTextChange = (indexToUpdate: number, altText: string) => {
    setImagePreviews((prev) =>
      prev.map((img, index) =>
        index === indexToUpdate ? { ...img, alt: altText } : img
      )
    );
  };

  const removeImage = (indexToRemove: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(imagePreviews[indexToRemove].url);
    setImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();

    if (validateForm()) {
      createProduct({
        newProduct,
        vendor,
        variants,
        imagePreviews,
        slug,
        user,
      });

      setProductUploadSuccess(true);
      setNewProduct({
        name: "",
        price: 0,
        sku: "",
        original_price: 0,
        quantity: "",
        description: ``,
        category: "",
        status: "active",
        material: "",
        type: "",
        weight: "",
        stock: 0,
        isFeatured: false,
        // stock_quantity, colors, sizes are now handled by variants
      });
      setImagePreviews([]);
      setVariants([]);

      setErrors({});
    }

    // PRODUCT IMAGE UPLOAD
  }

  if (user?.role !== "vendor") {
    return (
      <CustomError
        statusCode={401}
        title="Unauthorized"
        message="Only vendors can access the dashboard"
      />
    );
  }

  if (isCreating) {
    return <LoadingSpinner />;
  } else {
    return (
      <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-800">
        <SuccessModal
          isOpen={productUploadSuccess}
          onClose={closeModal}
          title="Product has been added successfully"
          message="Your product has been added to your catalog successfully"
        />

        {isError && (
          <CustomError
            statusCode={500}
            title="Server Error"
            message="Something went wrong, please try again later"
          />
        )}
        <form onSubmit={addProduct}>
          <div className="container mx-auto p-4 md:p-8">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Create a New Product
              </h1>
            </header>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: General Information */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 space-y-6">
                <h2 className="text-xl font-semibold">General Information</h2>

                {/* Product Name & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="product-name"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Product Name
                    </label>
                    <input
                      type="text"
                      id="product-name"
                      name="name"
                      value={newProduct.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.name ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="category"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={newProduct.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                        errors.category ? "border-red-300" : "border-gray-200"
                      }`}
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}{" "}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-600 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.description ? "border-red-300" : "border-gray-200"
                    }`}
                    value={newProduct.description}
                  ></textarea>
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Material & Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="material"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Material
                    </label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="material"
                        name="material"
                        placeholder="e.g., Cotton, Leather"
                        value={newProduct.material}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="type"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Product Type
                    </label>
                    <div className="relative">
                      <Shirt className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        id="type"
                        name="type"
                        placeholder="e.g., T-Shirt, Sneaker"
                        value={newProduct.type}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="sale-price"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Sale Price
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        N
                      </span>
                      <input
                        type="text"
                        id="sale-price"
                        name="price"
                        onChange={handleChange}
                        value={newProduct.price}
                        className={`w-full  pr-4 py-3 border rounded-xl pl-8 focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.price ? "border-red-300" : "border-gray-200"
                        }`}
                      />
                    </div>

                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="original_price"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Original Price
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        N
                      </span>
                      <input
                        type="text"
                        name="original_price"
                        onChange={handleChange}
                        id="original_price"
                        value={newProduct.original_price}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* TOTAL QUANTITY */}
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-600 mb-2"
                  >
                    Total Quantity
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="quantity"
                      onChange={handleChange}
                      id="quantity"
                      value={newProduct.quantity}
                      className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
                {/* Product Variants Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Product Variants
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      {/* Size Dropdown */}
                      <div>
                        <label
                          htmlFor="variant-size"
                          className="text-sm font-medium text-gray-600"
                        >
                          Size
                        </label>
                        <select
                          id="variant-size"
                          name="size"
                          value={currentVariant.size}
                          onChange={handleVariantChange}
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                        >
                          {sizes.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Color Dropdown */}
                      <div>
                        <label
                          htmlFor="variant-color"
                          className="text-sm font-medium text-gray-600"
                        >
                          Color
                        </label>
                        <select
                          id="variant-color"
                          name="color"
                          value={currentVariant.color}
                          onChange={handleVariantChange}
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white capitalize"
                        >
                          {colors.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity Input */}
                      <div>
                        <label
                          htmlFor="variant-quantity"
                          className="text-sm font-medium text-gray-600"
                        >
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="variant-quantity"
                          name="quantity"
                          placeholder="e.g., 15"
                          value={currentVariant.quantity}
                          onChange={handleVariantChange}
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          min="1"
                        />
                      </div>

                      {/* Add Variant Button */}
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                      >
                        <Plus size={16} className="mr-1" /> Add
                      </button>
                    </div>

                    {/* List of Added Variants */}
                    <div className="mt-4 space-y-2">
                      {variants.map((variant, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-white p-2 rounded-md border"
                        >
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-semibold">
                              {variant.size}
                            </span>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: variant.color }}
                              ></div>
                              <span className="capitalize">
                                {variant.color}
                              </span>
                            </div>
                            <span>
                              Qty: <strong>{String(variant.quantity)}</strong>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      {variants.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          No variants added yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Details */}
              <div className="lg:col-span-1 space-y-8">
                {/* Weight & Status */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h2 className="text-xl font-semibold mb-6">Details</h2>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="weight"
                        className="block text-sm font-medium text-gray-600 mb-2"
                      >
                        Weight (kg)
                      </label>
                      <input
                        type="text"
                        name="weight"
                        onChange={handleChange}
                        value={newProduct.weight}
                        id="weight"
                        placeholder="e.g., 0.5"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Status
                      </h3>
                      <select
                        name="status"
                        value={newProduct.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white capitalize"
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={newProduct.isFeatured}
                          onChange={(e) =>
                            setNewProduct((prev) => ({
                              ...prev,
                              isFeatured: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Featured Product
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Image */}
                <div className="bg-white rounded-xl shadow-md p-8">
                  <h2 className="text-xl font-semibold mb-6">Product Images</h2>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition flex flex-col justify-center items-center h-40"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <Image className="text-gray-400" />
                    <p className="text-sm text-gray-600 mt-2">
                      Drop your images or{" "}
                      <span className="font-semibold text-blue-600">
                        click to browse
                      </span>
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  {/* Image Previews & Alt Text Inputs */}
                  <div className="mt-4 space-y-4 max-h-80 overflow-y-auto pr-2">
                    {imagePreviews.map((image, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-2 border rounded-lg"
                      >
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="rounded-md object-cover w-16 h-16"
                        />
                        <div className="flex-grow">
                          <label
                            htmlFor={`alt-text-${index}`}
                            className="text-xs font-medium text-gray-600"
                          >
                            Alt Text
                          </label>
                          <input
                            type="text"
                            id={`alt-text-${index}`}
                            placeholder="Describe the image"
                            value={image.alt}
                            onChange={(e) =>
                              handleAltTextChange(index, e.target.value)
                            }
                            className="w-full text-sm border-gray-200 rounded-md px-2 py-1 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          />
                        </div>
                        <button
                          onClick={() => removeImage(index)}
                          className="bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors"
                          aria-label="Remove image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 mt-4 flex items-start gap-2">
                    <Info size={16} className="flex-shrink-0 mt-0.5" />
                    <span>
                      You should add at least 4 high-quality images for the best
                      results.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <footer className="mt-8 flex justify-end items-center space-x-4">
              <button className="bg-white border border-gray-300 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors">
                Cancel
              </button>
              {/* <button className="bg-gray-200 text-gray-800 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-300 transition-colors">
                Save as Draft
              </button> */}
              <button
                // type="button"
                className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                Publish Product
              </button>
            </footer>
          </div>
        </form>
      </div>
    );
  }
}

export default AddProductPage;
