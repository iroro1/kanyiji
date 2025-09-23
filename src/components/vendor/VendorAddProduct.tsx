"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Image,
  Info,
  Shirt,
  Tag,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProductImage } from "@/utils/supabase-images";
import { supabase } from "@/lib/supabase";
import { slugify } from "@/utils/helpers";
import LoadingSpinner from "../ui/LoadingSpinner";
import { SuccessModal } from "../ui/ProductSuccessModal";

// Define type for a single product variant
type Variant = {
  size: string;
  color: string;
  quantity: number | string;
};

// Define type for an image preview
type ImagePreview = {
  url: string;
  file: File;
  alt: string;
};

// --- Variant Management ---
const colors = [
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
];
const sizes = ["XS", "S", "M", "L", "XL", "XXL", "One Size"];

// Main App Component
function AddProductPage() {
  const { user } = useAuth();
  // You may want to define a Vendor type for better type safety, e.g.:
  // type Vendor = { id: string; user_id: string; ... };
  // const [vendorData, setVendorData] = useState<Vendor[]>([]);
  const [vendorData, setVendorData] = useState<any[]>([]);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openDialog = () => {
    dialogRef.current?.showModal(); // opens the dialog
  };

  const closeDialog = () => {
    dialogRef.current?.close(); // closes the dialog
  };
  //GET VENDORS DETAILS

  useEffect(() => {
    async function getVendorDetails() {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user?.id);

      if (error) {
        console.error(error);
      } else {
        console.log(data); // <-- actual array of vendors
        setVendorData(data);
      }
    }

    getVendorDetails();
  }, []);

  // MODAL DESIGNS
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // State for image previews with alt text
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productLoading, setProductLoading] = useState<boolean>();
  const [productUploadSuccess, setProductUploadSuccess] =
    useState<boolean>(false);

  // State for managing product variants
  const [variants, setVariants] = useState<Variant[]>([]);
  const [currentVariant, setCurrentVariant] = useState<Variant>({
    size: "S",
    color: "blue",
    quantity: "",
  });

  // Consolidated state for the new product
  const [slug, setSlug] = useState("");
  console.log(slug);
  const [newProduct, setNewProduct] = useState({
    vendor_id: vendorData,
    name: "",
    slug: slug,
    price: "",
    original_price: "",
    description: ``,
    category: "",
    status: "active",
    material: "",
    type: "",
    weight: "",
    // stock_quantity, colors, sizes are now handled by variants
  });

  // Update vendor_id when vendorData is loaded
  useEffect(() => {
    if (vendorData && vendorData.length > 0 && vendorData[0].id) {
      setNewProduct((prev) => ({
        ...prev,
        vendor_id: vendorData[0].id,
      }));
    }
  }, [vendorData]);

  // This effect will log the combined state whenever it changes
  useEffect(() => {
    console.log("Updated Product State:", {
      ...newProduct,
      variants: variants,
      images: imagePreviews.map((p) => ({ file: p.file, alt: p.alt })),
    });
  }, [newProduct, variants, imagePreviews]);

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

  async function addProduct() {
    setProductLoading(true);

    // 1. Insert product

    console.log("product uploading here");
    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert({
        vendor_id: newProduct.vendor_id,
        name: newProduct.name,
        slug: slug,
        price: newProduct.price,
        original_price: newProduct.original_price,
        description: newProduct.description,
        status: newProduct.status,
      })
      .select() // important: return inserted row
      .single();

    console.log("second check");

    if (productError) {
      console.error("Error saving product:", productError);
      return;
    }
    const productId = productData.id;

    console.log("third check after product upload");

    // PRODUCT IMAGE UPLOAD

    // 2. Loop through all images in imagePreviews
    // for (const preview of imagePreviews) {
    //   const file = preview.file; // ✅ actual image file

    //   const vendorId = user ? user.id : "";
    //   const publicUrl = await uploadProductImage(vendorId, productId, file);

    //   console.log("imagePublicUrl", publicUrl);

    //   // 5. Save image record into product_images table
    //   const { error: imageError } = await supabase
    //     .from("product_images")
    //     .insert({
    //       product_id: productId,
    //       url: publicUrl,
    //     });

    //   if (imageError) {
    //     console.error("Error saving image URL:", imageError);
    //   }
    // }

    setProductLoading(false);
    setProductUploadSuccess(true);

    console.log("Product + Image saved successfully!");
  }

  if (productLoading) {
    return <LoadingSpinner />;
  } else if (productUploadSuccess) {
    return <SuccessModal isOpen={openModal} onClose={closeModal} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans antialiased text-gray-800">
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                >
                  <option>Jewelry & Accessories</option>
                  <option>Books & Media</option>
                  <option>Food & Beverages</option>
                  <option>Arts & Crafts</option>
                  <option>Home & Decor</option>
                  <option>Beauty & Personal care</option>
                  <option>Fashion & Clothing</option>
                  <option>Health & Wellness</option>
                </select>
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
                rows={5}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={newProduct.description}
              ></textarea>
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
                    className="w-full border border-gray-300 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
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

            {/* Product Variants Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product Variants</h3>
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
                        <span className="font-semibold">{variant.size}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: variant.color }}
                          ></div>
                          <span className="capitalize">{variant.color}</span>
                        </div>
                        <span>
                          Qty: <strong>{String(variant.quantity)}</strong>
                        </span>
                      </div>
                      <button
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
          <button className="bg-gray-200 text-gray-800 rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gray-300 transition-colors">
            Save as Draft
          </button>
          <button
            onClick={addProduct}
            className="bg-blue-600 text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            Publish Product
          </button>
        </footer>
      </div>
    </div>
  );
}

export default AddProductPage;
