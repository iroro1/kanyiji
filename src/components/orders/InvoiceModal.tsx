"use client";

import { useState, useEffect } from "react";
import { X, Download, Printer, Share2, FileText, CheckCircle } from "lucide-react";
import { OrderInvoice, OrderItem } from "@/types/orders";

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
}

export default function InvoiceModal({ 
  isOpen, 
  onClose, 
  orderId, 
  orderNumber, 
  items, 
  total, 
  subtotal, 
  tax, 
  shipping, 
  discount 
}: InvoiceModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Reset loading states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDownloading(false);
      setPrinting(false);
      setSharing(false);
    }
  }, [isOpen]);

  // Track when loading states start to detect stuck operations
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // If any loading state is active for more than 30 seconds, reset it (likely stuck)
    if (downloading || printing || sharing) {
      timeoutId = setTimeout(() => {
        if (downloading) setDownloading(false);
        if (printing) setPrinting(false);
        if (sharing) setSharing(false);
      }, 30000); // 30 second timeout for stuck operations
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [downloading, printing, sharing]);

  // Extract first part before first dash for invoice number
  const invoiceNumberPrefix = orderNumber.split('-')[0];
  // Extract last part after last dash for order number display
  const orderNumberSuffix = orderNumber.split('-').pop() || orderNumber;

  // Generate dummy invoice data
  const invoice: OrderInvoice = {
    id: `INV-${orderId}`,
    orderId,
    invoiceNumber: `INV-${invoiceNumberPrefix}`,
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week (7 days) from now
    items,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    currency: "NGN",
    status: "paid",
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Helper function to convert image URL to base64
  const getImageAsBase64 = async (url: string): Promise<string | null> => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64);
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error converting image to base64:", error);
      return null;
    }
  };

  // Generate PDF document (reusable function) - enhanced professional style
  const generatePDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 25;
    const leftColX = margin;
    const rightColX = pageWidth / 2 + 15;
    let yPos = margin;

    // Top border line for professional look
    doc.setLineWidth(0.5);
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);

    // Company Info (Left Column) - enhanced spacing
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Kanyiji Marketplace", leftColX, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99); // text-gray-600
    doc.text("support@kanyiji.ng", leftColX, yPos);
    
    // Invoice Details (Right Column) - better alignment
    const invoiceYStart = margin;
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Invoice Details", rightColX, invoiceYStart);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(75, 85, 99); // text-gray-600
    doc.text(`Invoice: ${invoice.invoiceNumber}`, rightColX, invoiceYStart + 10);
    doc.text(`Order: ${orderNumberSuffix}`, rightColX, invoiceYStart + 16);
    doc.text(`Date: ${formatDate(invoice.issueDate)}`, rightColX, invoiceYStart + 22);
    doc.text(`Due: ${formatDate(invoice.dueDate)}`, rightColX, invoiceYStart + 28);
    
    yPos = Math.max(margin + 35, invoiceYStart + 35);
    yPos += 20; // More spacing before table

    // Order Items Section Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Order Items", leftColX, yPos);
    yPos += 15;

    // Table with enhanced header styling
    const tableStartY = yPos - 8;
    const headerHeight = 14;
    doc.setFillColor(249, 250, 251); // bg-gray-50
    doc.rect(leftColX, tableStartY, pageWidth - (margin * 2), headerHeight, "F");
    
    // Table headers with better spacing
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99); // text-gray-500
    
    // Better column positioning
    const itemColX = leftColX + 8;
    const vendorColX = itemColX + 75;
    const qtyColX = vendorColX + 45;
    const priceColX = qtyColX + 30;
    const totalColX = pageWidth - margin - 5;
    
    doc.text("ITEM", itemColX, yPos);
    doc.text("VENDOR", vendorColX, yPos);
    doc.text("QTY", qtyColX, yPos, { align: "right" });
    doc.text("PRICE", priceColX, yPos, { align: "right" });
    doc.text("TOTAL", totalColX, yPos, { align: "right" });
    yPos += 12;

    // Draw line under header
    doc.setLineWidth(0.5);
    doc.setDrawColor(229, 231, 235); // border-gray-200
    doc.line(leftColX, yPos - 2, pageWidth - margin, yPos - 2);
    yPos += 10;

    // Items rows with better spacing and larger images
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const rowHeight = 24; // Increased for better spacing
    
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      
      if (yPos > pageHeight - 70) {
        doc.addPage();
        yPos = margin + 10;
      }

      // Row background - alternate like modal
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
      } else {
        doc.setFillColor(249, 250, 251);
      }
      doc.rect(leftColX, yPos - 10, pageWidth - (margin * 2), rowHeight, "F");

      // Product image (larger and better positioned)
      let imageX = itemColX;
      const imageSize = 18; // Larger image
      if (item.image) {
        try {
          const base64Image = await getImageAsBase64(item.image);
          if (base64Image) {
            // Add background rectangle for image
            doc.setFillColor(243, 244, 246);
            doc.rect(itemColX, yPos - 8, imageSize, imageSize, "F");
            doc.addImage(base64Image, 'JPEG', itemColX + 1, yPos - 7, imageSize - 2, imageSize - 2, undefined, 'FAST');
            imageX = itemColX + imageSize + 8; // Space after image
          }
        } catch (error) {
          console.error("Error adding image to PDF:", error);
        }
      }

      // Item name - better font sizing
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39); // text-gray-900
      const itemNameY = yPos;
      const maxNameWidth = vendorColX - imageX - 5;
      const itemName = doc.splitTextToSize(item.name, maxNameWidth);
      doc.text(itemName[0], imageX, itemNameY);
      
      // SKU and variant info - if name wraps, adjust position
      let detailY = itemName.length > 1 ? itemNameY + 5 : itemNameY + 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128); // text-gray-500
      
      if (item.sku) {
        doc.text(`SKU: ${item.sku}`, imageX, detailY);
        detailY += 4;
      }
      
      // Size and Color
      if (item.size || item.color) {
        const variantText = [
          item.size ? `Size: ${item.size}` : null,
          item.color ? `Color: ${item.color}` : null
        ].filter(Boolean).join(" • ");
        doc.text(variantText, imageX, detailY);
      }
      
      // Vendor
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(17, 24, 39); // text-gray-900
      const vendorText = (item.vendor || "N/A").substring(0, 20);
      doc.text(vendorText, vendorColX, itemNameY);
      
      // Quantity - right aligned
      doc.text(item.quantity.toString(), qtyColX, itemNameY, { align: "right" });
      
      // Price - right aligned
      doc.text(formatPrice(item.price), priceColX, itemNameY, { align: "right" });
      
      // Total - right aligned, bold
      doc.setFont("helvetica", "bold");
      doc.text(formatPrice(item.price * item.quantity), totalColX, itemNameY, { align: "right" });
      
      // Draw row divider
      doc.setLineWidth(0.3);
      doc.setDrawColor(229, 231, 235);
      doc.line(leftColX, yPos + rowHeight - 10, pageWidth - margin, yPos + rowHeight - 10);
      
      yPos += rowHeight;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
    }

    yPos += 20; // More spacing before summary

    // Order Summary Section - enhanced layout
    if (yPos > pageHeight - 120) {
      doc.addPage();
      yPos = margin + 10;
    }

    // Payment Status (Left Column)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Payment Status", leftColX, yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    // Green checkmark with circle
    doc.setFillColor(34, 197, 94); // green-500
    doc.circle(leftColX + 3, yPos - 2, 3, "F");
    doc.setTextColor(34, 197, 94); // text-green-500
    doc.setFont("helvetica", "bold");
    doc.text("Paid", leftColX + 10, yPos);
    doc.setTextColor(75, 85, 99); // text-gray-600
    yPos += 10;
    doc.setFont("helvetica", "normal");
    doc.text(`Payment completed on ${formatDate(invoice.issueDate)}`, leftColX, yPos);
    
    // Order Summary (Right Column) - better alignment
    const summaryYStart = yPos - 25;
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Order Summary", rightColX, summaryYStart);
    
    let summaryY = summaryYStart + 15;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    // Summary items with better spacing
    doc.setTextColor(75, 85, 99); // text-gray-600
    doc.text("Subtotal:", rightColX, summaryY);
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text(formatPrice(subtotal), pageWidth - margin, summaryY, { align: "right" });
    summaryY += 10;

    doc.setTextColor(75, 85, 99);
    doc.text("Tax:", rightColX, summaryY);
    doc.setTextColor(17, 24, 39);
    doc.text(formatPrice(tax), pageWidth - margin, summaryY, { align: "right" });
    summaryY += 10;

    doc.setTextColor(75, 85, 99);
    doc.text("Shipping:", rightColX, summaryY);
    doc.setTextColor(17, 24, 39);
    doc.text(formatPrice(shipping), pageWidth - margin, summaryY, { align: "right" });
    summaryY += 10;

    if (discount > 0) {
      doc.setTextColor(75, 85, 99);
      doc.text("Discount:", rightColX, summaryY);
      doc.setTextColor(17, 24, 39);
      doc.text(`-${formatPrice(discount)}`, pageWidth - margin, summaryY, { align: "right" });
      summaryY += 10;
    }

    // Total line separator - thicker line
    doc.setLineWidth(0.8);
    doc.setDrawColor(209, 213, 219); // darker gray
    doc.line(rightColX, summaryY + 4, pageWidth - margin, summaryY + 4);
    summaryY += 12;

    // Total - larger and bolder
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39); // text-gray-900
    doc.text("Total:", rightColX, summaryY);
    doc.text(formatPrice(total), pageWidth - margin, summaryY, { align: "right" });

    // Footer - enhanced styling
    const footerY = pageHeight - 20;
    doc.setLineWidth(0.5);
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128); // text-gray-500
    doc.text("Thank you for your order!", pageWidth / 2, footerY, { align: "center" });

    return doc;
  };

  const handleDownload = async () => {
    setDownloading(true);
    
    try {
      const doc = await generatePDF();
      // Save PDF
      doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
      setDownloading(false);
    } catch (err) {
      console.error("Download failed:", err);
      setDownloading(false);
    }
  };

  const handlePrint = async () => {
    setPrinting(true);
    
    try {
      const doc = await generatePDF();
      // Open print dialog with PDF in new window (doesn't affect modal)
      doc.autoPrint();
      doc.output('dataurlnewwindow');
      setPrinting(false);
    } catch (err) {
      console.error("Print failed:", err);
      setPrinting(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    
    try {
      // Simulate share delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, this would open share options
      console.log("Sharing invoice:", invoice);
      
      if (navigator.share) {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `View your invoice for order ${orderNumber}`,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Invoice link copied to clipboard!");
      }
      
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-primary-500" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Invoice
                  </h3>
                  <p className="text-sm text-gray-500">
                    {invoice.invoiceNumber} • {formatDate(invoice.issueDate)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Kanyiji Marketplace</h4>
                <p className="text-sm text-gray-600">support@kanyiji.ng</p>
              </div>
              <div className="text-right">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Invoice Details</h4>
                <p className="text-sm text-gray-600">Invoice: {invoice.invoiceNumber}</p>
                <p className="text-sm text-gray-600">Order: {orderNumberSuffix}</p>
                <p className="text-sm text-gray-600">Date: {formatDate(invoice.issueDate)}</p>
                <p className="text-sm text-gray-600">Due: {formatDate(invoice.dueDate)}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Qty
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded mr-3"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              {item.sku && (
                              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                              )}
                              {/* Display size and color if available */}
                              {(item.size || item.color) && (
                                <div className="text-sm text-gray-500">
                                  {item.size && item.color 
                                    ? `Size: ${item.size} • Color: ${item.color}`
                                    : item.size 
                                    ? `Size: ${item.size}`
                                    : item.color
                                    ? `Color: ${item.color}`
                                    : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.vendor}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Status</h4>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">Paid</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Payment completed on {formatDate(invoice.issueDate)}
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-900">{formatPrice(tax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">{formatPrice(shipping)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-gray-900">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Thank you for your order!
              </div>
              
              <div className="flex space-x-3">
                {/* <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloading ? "Downloading..." : "Download"}
                </button>
                
                <button
                  onClick={handlePrint}
                  disabled={printing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {printing ? "Printing..." : "Print"}
                </button>
                
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {sharing ? "Sharing..." : "Share"}
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
