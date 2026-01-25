// Format currency (Nigerian Naira)
export const formatCurrency = (amount: number, currency = "NGN"): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// Format date
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(dateObj);
};

// Format relative time
export const formatRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Calculate discount percentage
export const calculateDiscount = (
  originalPrice: number,
  currentPrice: number
): number => {
  if (originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Nigerian format)
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone);
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Check if object is empty
export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === "string") return obj.length === 0;
  if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return false;
};

// Deep clone object
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Array) return obj.map((item) => deepClone(item)) as T;
  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
  return obj;
};

/** Fallback when product has no image. Unsplash URL allowed in next.config. */
export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";

/**
 * Safely get the first product image URL. Handles undefined/null images,
 * non-array values, and product_images shape. Never throws.
 */
export function getProductImageUrl(product: {
  images?: unknown;
  product_images?: Array<{ image_url?: string }>;
} | null | undefined): string {
  if (!product) return PLACEHOLDER_IMAGE;
  const imgs = product.images;
  if (Array.isArray(imgs) && imgs.length > 0) {
    const first = imgs[0];
    if (typeof first === "string" && first) return first;
  }
  const pimgs = product.product_images;
  if (Array.isArray(pimgs) && pimgs.length > 0) {
    const first = pimgs[0];
    const url = first?.image_url;
    if (typeof url === "string" && url) return url;
  }
  return PLACEHOLDER_IMAGE;
}

export function slugify(text: string): string {
  const a =
    "àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;";
  const b =
    "aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------";
  const p = new RegExp(a.split("").join("|"), "g");

  return (
    text
      .toString()
      .toLowerCase()
      // Replace special characters with their Latin equivalents
      .replace(p, (c) => b.charAt(a.indexOf(c)))
      // Replace spaces with a single hyphen
      .replace(/\s+/g, "-")
      // Remove all characters that are not a word character (a-z, 0-9, _), a hyphen, or a space
      .replace(/[^\w\-]+/g, "")
      // Replace multiple hyphens with a single one
      .replace(/\-\-+/g, "-")
      // Remove any leading hyphens
      .replace(/^-+/, "")
      // Remove any trailing hyphens
      .replace(/-+$/, "")
  );
}

/** Order item shape parsed from order internal_notes (JSON or legacy "Product Variants" text) */
export interface InternalNoteOrderItem {
  name: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  size?: string;
  color?: string;
  product_id?: string;
}

/**
 * Parse legacy "Product Variants: Item 1 (Name): Size: L, Color: gold" format.
 */
function parseLegacyProductVariants(text: string): InternalNoteOrderItem[] {
  const out: InternalNoteOrderItem[] = [];
  const normalized = text.replace(/^Product Variants:\s*/i, "").trim();
  if (!normalized) return out;
  const itemRe = /Item\s+\d+\s*\(\s*([^)]+)\s*\)\s*(?::\s*(.+))?/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(normalized)) !== null) {
    const name = m[1].trim();
    const rest = (m[2] || "").trim();
    let size: string | undefined;
    let color: string | undefined;
    if (rest) {
      const sizeMatch = rest.match(/Size:\s*([^,]+?)(?:\s*,|$)/i);
      const colorMatch = rest.match(/Color:\s*([^,]+?)(?:\s*,|$)/i);
      if (sizeMatch) size = sizeMatch[1].trim();
      if (colorMatch) color = colorMatch[1].trim();
    }
    out.push({ name: name || "Product", quantity: 1, size, color });
  }
  return out;
}

/**
 * Parse order items from order.internal_notes.
 * Supports: (1) JSON array of items; (2) legacy "Product Variants: Item 1 (Name): Size: L, Color: gold".
 * Returns [] if invalid or missing.
 */
export function parseOrderItemsFromInternalNotes(
  internalNotes: string | null | undefined
): InternalNoteOrderItem[] {
  if (!internalNotes || typeof internalNotes !== "string") return [];
  const t = internalNotes.trim();
  if (!t) return [];

  try {
    const parsed = JSON.parse(t) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
        .filter((row: any) => row && (row.name != null || row.quantity != null))
        .map((row: any) => {
          const qty = Math.max(0, Math.floor(Number(row.quantity ?? row.qty ?? 1) || 0));
          const up = parseFloat(String(row.unit_price ?? row.price ?? 0)) || 0;
          const tp = parseFloat(String(row.total_price ?? row.total ?? 0)) || up * qty;
          return {
            name: String(row.name ?? row.product_name ?? "Product"),
            quantity: qty,
            unit_price: up,
            total_price: tp,
            size: row.size ?? undefined,
            color: row.color ?? undefined,
            product_id: row.product_id ?? undefined,
          };
        });
    }
  } catch {
    /* not JSON */
  }

  const legacy = parseLegacyProductVariants(t);
  return legacy.length > 0 ? legacy : [];
}
