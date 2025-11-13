"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, Image, Info, Shirt, Tag, Trash2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProductImage } from "@/utils/supabase-images";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/utils/helpers";
import LoadingSpinner from "../ui/LoadingSpinner";
import { SuccessModal } from "../ui/ProductSuccessModal"; // You may want a custom "Update Success" message
import CustomError from "@/app/error";
import {
  ProductFormData,
  Variant,
  sizes,
  ImagePreview, // This is now only for NEW images
  colors,
  productCategories,
} from "./VendorAddProduct";
import { useEditVendorProduct } from "../http/QueryHttp";

// Type for EXISTING images loaded from DB
type ExistingImage = {
  id: string; // This is the ID from the product_images table
  image_url: string;
  alt: string;
};

// Full type for the product being edited
export type ProductToEdit = ProductFormData & {
  id: string; // This is the Product ID
  product_images: ExistingImage[];
  product_attributes: Variant[];
  stock_quantity: string; // Add fields from DB schema if missing in ProductFormData
  is_featured: boolean;
  slug: string;
};

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: ProductToEdit | null;
}

// --- Main Edit Modal Component ---
function EditProductModal({
  isOpen,
  onClose,
  productToEdit,
}: EditProductModalProps) {
  const { user } = useAuth();
  // vendorData state is removed, as we don't need to fetch it to update a product.
  // The vendor ID is already associated with the product.

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [productUploadSuccess, setProductUploadSuccess] =
    useState<boolean>(false);
  const [productError, setProductError] = useState(false);

  // --- State Management ---
  const [variants, setVariants] = useState<Variant[]>([]);
  const [currentVariant, setCurrentVariant] = useState<Variant>({
    size: "S",
    color: "blue",
    quantity: "",
  });

  const [newImagePreviews, setNewImagePreviews] = useState<ImagePreview[]>([]); // For NEW uploads
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]); // For images from DB
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]); // Keep track of image IDs to delete

  const [slug, setSlug] = useState("");
  const [productForm, setProductForm] = useState<ProductFormData>({
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
  });

  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    price?: string;
    category?: string;
  }>({});

  // --- Effect to Populate Form ---
  // This effect runs when the modal is opened or the product prop changes.
  // It populates all form states from the productToEdit prop.
  useEffect(() => {
    if (productToEdit && isOpen) {
      setProductForm({
        name: productToEdit.name || "",
        category: productToEdit.category || "",
        price: productToEdit.price || 0,
        original_price: productToEdit.original_price || 0,
        quantity: productToEdit.stock_quantity || "", // Map from DB field
        description: productToEdit.description || "",
        status: productToEdit.status || "",
        material: productToEdit.material || "",
        type: productToEdit.type || "",
        weight: productToEdit.weight || "",
        stock: productToEdit.stock || 0, // or productToEdit.stock_quantity
        isFeatured: productToEdit.is_featured || false, // Map from DB field
        sku: productToEdit.sku,
      });
      setVariants(productToEdit.product_attributes || []);
      setExistingImages(productToEdit.product_images || []);
      setSlug(productToEdit.slug || slugify(productToEdit.name));

      // Reset action-specific states every time the modal opens
      setNewImagePreviews([]);
      setImagesToDelete([]);
      setErrors({});
      setProductError(false);
      setProductLoading(false);
    }
  }, [productToEdit, isOpen]);

  // --- Close Handlers ---
  const handleSuccessModalClose = () => {
    setProductUploadSuccess(false);
    onClose(); // This now closes the main Edit modal too
  };

  // --- Form Validation (Identical to Create) ---
  const validateForm = (): boolean => {
    const newErrors: {
      name?: string;
      description?: string;
      price?: string;
      category?: string;
    } = {};

    if (!productForm.name.trim()) newErrors.name = "Product name is required";
    if (!productForm.description.trim())
      newErrors.description = "Description is required";
    if (productForm.price <= 0)
      newErrors.price = "Price must be greater than 0";
    if (productForm.price > productForm.original_price)
      newErrors.price = "Sale Price must be lower than original price";
    if (!productForm.category) newErrors.category = "Category is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- General Input Handlers (Identical to Create) ---
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name") {
      setSlug(slugify(value));
    }

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // --- Variant Handlers (Identical to Create) ---
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
    setCurrentVariant({ size: "S", color: "blue", quantity: "" });
  };

  const handleRemoveVariant = (indexToRemove: number) => {
    setVariants((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // --- Image Handlers (Modified) ---
  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const files = Array.from(selectedFiles);
    const newPreviews: ImagePreview[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      file: file,
      alt: "",
    }));
    // **MODIFIED:** Use setNewImagePreviews
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  // This function is correct as-is
  const handleAltTextChange = (
    index: number,
    altText: string,
    isExisting: boolean
  ) => {
    if (isExisting) {
      setExistingImages((prev) =>
        prev.map((img, i) => (i === index ? { ...img, alt: altText } : img))
      );
    } else {
      setNewImagePreviews((prev) =>
        prev.map((img, i) => (i === index ? { ...img, alt: altText } : img))
      );
    }
  };

  // This function is correct as-is
  const removeNewImage = (indexToRemove: number) => {
    URL.revokeObjectURL(newImagePreviews[indexToRemove].url);
    setNewImagePreviews((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // This function is correct as-is
  const handleRemoveExistingImage = (idToRemove: string) => {
    setImagesToDelete((prev) => [...prev, idToRemove]);
    setExistingImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  // --- Main UPDATE Function ---
  // **REPLACED `addProduct`**
  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!productToEdit) return; // Guard clause

    if (validateForm()) {
      setProductLoading(true);
      setProductError(false);

      try {
        // 1. Update main product details
        const { error: productError } = await supabase
          .from("products")
          .update({
            name: productForm.name,
            category: productForm.category,
            slug: slug,
            price: productForm.price,
            original_price: productForm.original_price,
            stock_quantity: productForm.quantity,
            description: productForm.description,
            status: productForm.status,
            weight: productForm.weight,
            sub_category: productForm.type,
            sku: productForm.sku,
            is_featured: productForm.isFeatured,
            material: productForm.material,
          })
          .eq("id", productToEdit.id); // <-- The crucial update condition

        if (productError) throw productError;

        const productId = productToEdit.id;

        // 2. Update variants (Strategy: Delete all, re-add all)
        // This is simpler and more robust than diff-checking.
        const { error: deleteVariantError } = await supabase
          .from("product_attributes")
          .delete()
          .eq("product_id", productId);

        if (deleteVariantError) throw deleteVariantError;

        if (variants.length > 0) {
          const newVariantsData = variants.map((v) => ({
            product_id: productId,
            size: v.size,
            color: v.color,
            quantity: v.quantity,
          }));
          const { error: insertVariantError } = await supabase
            .from("product_attributes")
            .insert(newVariantsData);
          if (insertVariantError) throw insertVariantError;
        }

        // 3. Delete marked images from DB
        if (imagesToDelete.length > 0) {
          // TODO: Also delete from Supabase Storage
          // This requires parsing URLs to get file paths, which is complex.
          // For now, just delete from the database table.
          const { error: deleteImageError } = await supabase
            .from("product_images")
            .delete()
            .in("id", imagesToDelete); // Use the 'id' from product_images table

          if (deleteImageError)
            console.error("Error deleting images:", deleteImageError);
        }

        // 4. Upload NEW images
        for (const preview of newImagePreviews) {
          const file = preview.file;
          const vendorId = user ? user.id : "";
          const publicUrl = await uploadProductImage(vendorId, productId, file);

          const { error: imageError } = await supabase
            .from("product_images")
            .insert({
              product_id: productId,
              image_url: publicUrl,
              alt_text: preview.alt, // Save alt text
            });
          if (imageError) throw imageError;
        }

        // 5. Update alt text for EXISTING images
        const altTextUpdates = existingImages.map((img) => ({
          id: img.id, // The conflicting column
          product_id: productId,
          image_url: img.image_url,
          alt_text: img.alt, // The field to update
        }));

        if (altTextUpdates.length > 0) {
          const { error: altUpdateError } = await supabase
            .from("product_images")
            .upsert(altTextUpdates, { onConflict: "id" });
          if (altUpdateError) throw altUpdateError;
        }

        // --- Success ---
        setProductLoading(false);
        setProductUploadSuccess(true);
        // We don't reset the form, as the modal will close.
        // The parent page should refetch its data upon close.
      } catch (error: any) {
        console.error("Error updating product:", error);
        setProductLoading(false);
        setProductError(true);
      }
    }
  }

  // --- Render Logic ---
  if (!isOpen || !productToEdit) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-gray-50 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-gray-50 rounded-t-xl z-10">
          <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={productLoading}
          >
            <X size={24} />
          </button>
        </header>

        {/* --- Loading Overlay --- */}
        {productLoading && (
          <div className="absolute inset-0 z-20 bg-white bg-opacity-75 flex items-center justify-center rounded-xl">
            <LoadingSpinner />
          </div>
        )}

        {/* --- Success Modal --- */}
        <SuccessModal
          isOpen={productUploadSuccess}
          onClose={handleSuccessModalClose}
          // You can add a custom message prop to SuccessModal
          title="Product updated successfully!"
          message="Your product has been edited successfully"
        />

        {/* --- Error Display --- */}
        {productError && (
          // Note: This CustomError will be *behind* the LoadingSpinner if both are true.
          // You might want a different UI for this, like a toast notification.
          <div className="absolute inset-0 z-10 bg-white p-10">
            <CustomError
              statusCode={500}
              title="Update Error"
              message="Something went wrong while updating. Please try again later."
            />
          </div>
        )}

        {/* --- Form --- */}
        <form
          onSubmit={handleUpdateProduct} // **MODIFIED**
          className="overflow-y-auto flex-1"
        >
          <div className="container mx-auto p-4 md:p-8">
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: General Information */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-8 space-y-6">
                <h2 className="text-xl font-semibold">General Information</h2>

                {/* Product Name */}
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
                    value={productForm.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl ... ${
                      errors.name ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Category */}
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
                    value={productForm.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-xl ... ${
                      errors.category ? "border-red-300" : "border-gray-200"
                    }`}
                  >
                    <option value="">Select category</option>
                    {productCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
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
                    className={`w-full px-4 py-3 border rounded-xl ... ${
                      errors.description ? "border-red-300" : "border-gray-200"
                    }`}
                    value={productForm.description}
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
                        value={productForm.material}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 ..."
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
                        value={productForm.type}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 ..."
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
                        type="number" // Use type="number" for prices
                        id="sale-price"
                        name="price"
                        onChange={handleChange}
                        value={productForm.price}
                        className={`w-full pr-4 py-3 border rounded-xl pl-8 ... ${
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
                        type="number" // Use type="number" for prices
                        name="original_price"
                        onChange={handleChange}
                        id="original_price"
                        value={productForm.original_price}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 ..."
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
                      type="number" // Use type="number" for quantity
                      name="quantity"
                      onChange={handleChange}
                      id="quantity"
                      value={productForm.quantity}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 ..." // Removed pl-8
                    />
                  </div>
                </div>

                {/* Product Variants Section (JSX is identical) */}
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
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 ..."
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
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 ... capitalize"
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
                          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 ..."
                          min="1"
                        />
                      </div>

                      {/* Add Variant Button */}
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 flex align-center justify-center text-center"
                      >
                        <Plus size={16} className="mr-1" />

                        <p>Add</p>
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

              {/* Right Column: Details (JSX is identical) */}
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
                        type="text" // Or "number"
                        name="weight"
                        onChange={handleChange}
                        value={productForm.weight}
                        id="weight"
                        placeholder="e.g., 0.5"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 ..."
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Status
                      </h3>
                      <select
                        name="status"
                        value={productForm.status}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 ... capitalize"
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
                          checked={productForm.isFeatured}
                          onChange={(e) =>
                            setProductForm((prev) => ({
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
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center ..."
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
                    {/* **MODIFIED:** Render Existing Images */}
                    {existingImages.map((image, index) => (
                      <div
                        key={image.id}
                        className="flex items-start gap-4 p-2 border rounded-lg"
                      >
                        <img
                          src={image.image_url}
                          alt={image.alt || "Existing image"}
                          className="rounded-md object-cover w-16 h-16"
                        />
                        <div className="flex-grow">
                          <label
                            htmlFor={`alt-text-existing-${index}`}
                            className="text-xs font-medium text-gray-600"
                          >
                            Alt Text
                          </label>
                          <input
                            type="text"
                            id={`alt-text-existing-${index}`}
                            placeholder="Describe the image"
                            value={image.alt}
                            onChange={(e) =>
                              handleAltTextChange(index, e.target.value, true)
                            }
                            className="w-full text-sm border-gray-200 rounded-md px-2 py-1 mt-1 ..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(image.id)}
                          className="bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 ..."
                          aria-label="Remove image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {/* **MODIFIED:** Render New Images */}
                    {newImagePreviews.map((image, index) => (
                      <div
                        key={image.url} // Use URL for temp key
                        className="flex items-start gap-4 p-2 border rounded-lg"
                      >
                        <img
                          src={image.url}
                          alt={`Preview ${index + 1}`}
                          className="rounded-md object-cover w-16 h-16"
                        />
                        <div className="flex-grow">
                          <label
                            htmlFor={`alt-text-new-${index}`}
                            className="text-xs font-medium text-gray-600"
                          >
                            Alt Text
                          </label>
                          <input
                            type="text"
                            id={`alt-text-new-${index}`}
                            placeholder="Describe the image"
                            value={image.alt}
                            onChange={(e) =>
                              handleAltTextChange(index, e.target.value, false)
                            }
                            className="w-full text-sm border-gray-200 rounded-md px-2 py-1 mt-1 ..."
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 ..."
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
              <button
                className="bg-white border border-gray-300 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors"
                onClick={onClose}
                type="button"
                disabled={productLoading} // **MODIFIED**
              >
                Cancel
              </button>
              <button
                type="submit" // **MODIFIED**
                className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                disabled={productLoading} // **MODIFIED**
              >
                {productLoading ? "Updating..." : "Update Product"}{" "}
                {/* **MODIFIED** */}
              </button>
            </footer>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProductModal;
