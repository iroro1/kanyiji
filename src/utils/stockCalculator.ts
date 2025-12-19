/**
 * Calculate total stock quantity for a product
 * If product has product_attributes (variants), sum their quantities
 * Otherwise, use the product's stock_quantity field
 */
export function calculateProductStock(product: any): number {
  // Safety check: if product is null/undefined, return 0
  if (!product) return 0;
  
  // If product has product_attributes (variants), sum their quantities
  if (product.product_attributes && Array.isArray(product.product_attributes) && product.product_attributes.length > 0) {
    return product.product_attributes.reduce((sum: number, attr: any) => {
      const qty = typeof attr.quantity === 'string' ? parseInt(attr.quantity) : (attr.quantity || 0);
      return sum + qty;
    }, 0);
  }
  
  // Otherwise, use the product's stock_quantity field
  return product.stock_quantity || 0;
}

