"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useToast } from "../ui/Toast";
import { SessionStorage } from "@/utils/sessionStorage";
import {
  LoginUser,
  getAllProducts,
  getWishlist,
  fetchAllOrders,
  fetchVendorDetails,
  fetchVendorOrders,
  updateVendorOrderStatus,
  deleteVendorProduct,
  deleteVendorProductImages,
  editProduct,
  fetchAllProducts,
  addNewProduct,
  registerNewVendor,
  getCurrentUserWithAxios,
} from "./Api";

async function fetchSingleProductFromApi(productId: string): Promise<any[]> {
  const res = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Failed to fetch product: ${res.status}`);
  }
  const json = await res.json();
  const product = json?.product;
  return product ? [product] : [];
}

/** SessionStorage.set stores { value, timestamp, maxAge }. get() returns that. Unwrap .value for product cache. */
function getStaleProductCache(key: string): any[] | null {
  const raw = SessionStorage.get<{ value?: any } | any>(key);
  if (!raw) return null;
  const v = raw && typeof raw === "object" && "value" in raw ? raw.value : raw;
  if (!v) return null;
  return Array.isArray(v) ? v : [v];
}
import { useSupabaseAuthReady } from "@/lib/useSupabaseAuthReady";

// Simple provider component that does nothing (for compatibility)
export default function AppQueryProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// AUTHENTICATE NEW USER
export function useLoginUser() {
  const [isPending, setIsPending] = useState(false);

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setIsPending(true);
    try {
      await LoginUser(credentials);
      console.log("user signed in successfully");
    } finally {
      setIsPending(false);
    }
  }, []);

  return { login, isPending };
}

// GET CURRENT USER
export function useFetchCurrentUser() {
  const { authLoading } = useSupabaseAuthReady();
  const [data, setData] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading) {
      // Check cache even while auth is loading
      const cacheKey = "currentUser";
      const cached = SessionStorage.getWithExpiry<any>(cacheKey);
      if (cached) {
        setData(cached);
        setIsPending(false);
      }
      return;
    }

    const cacheKey = "currentUser";
    const cacheDuration = 5 * 60 * 1000; // 5 minutes

    // Always check cache first - this ensures data persists across tab switches
    const cached = SessionStorage.getWithExpiry<any>(cacheKey);
    if (cached) {
      setData(cached);
      setIsPending(false);
      // Still allow background refetch if cache is stale
      if (!hasFetchedRef.current) {
        hasFetchedRef.current = true;
        // Background refetch to update cache
        getCurrentUserWithAxios()
          .then((user) => {
            setData(user);
            SessionStorage.set(cacheKey, user, cacheDuration);
          })
          .catch(() => {
            // Silently fail - keep cached data
          });
      }
      return;
    }

    // Only fetch if not already fetched
    if (hasFetchedRef.current) return;

    const fetchUser = async () => {
      setIsPending(true);
      setIsError(false);
      setError(null);
      hasFetchedRef.current = true;

      try {
        const user = await getCurrentUserWithAxios();
        setData(user);
        SessionStorage.set(cacheKey, user, cacheDuration);
      } catch (err: any) {
        setError(err);
        setIsError(true);
        // Try stale cache on error
        const staleCache = SessionStorage.get<any>(cacheKey);
        if (staleCache) {
          setData(staleCache);
        }
      } finally {
        setIsPending(false);
      }
    };

    fetchUser();
  }, [authLoading]);

  return { data, isPending, error, isError };
}

// PRODUCTS QUERY SECTION
const PAGE_SIZE = 8;

export function useFetchAllProducts(
  searchQuery: string | null,
  category: string | null,
  sale: string | null,
  feature: string | null,
  sort: string | null,
  priceRange: number[] | null
) {
  const { authLoading } = useSupabaseAuthReady();
  
  // CRITICAL: Check cache synchronously before setting initial state
  // This prevents loader from showing when cached data exists
  const getInitialState = () => {
    const cacheKey = `allProducts_${JSON.stringify({ searchQuery, category, sale, feature, sort, priceRange })}`;
    const cached = SessionStorage.getWithExpiry<any[]>(cacheKey);
    if (cached && cached.length > 0) {
      return { products: cached, isLoading: false };
    }
    // Check stale cache too
    const staleCache = SessionStorage.get<any[]>(cacheKey);
    if (staleCache && staleCache.length > 0) {
      return { products: staleCache, isLoading: false };
    }
    return { products: [], isLoading: true };
  };

  const initialState = getInitialState();
  const [products, setProducts] = useState<any[]>(initialState.products);
  const [isLoading, setIsLoading] = useState(initialState.isLoading);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const hasFetchedRef = useRef<string>("");
  const hasEverLoadedRef = useRef<boolean>(initialState.products.length > 0);

  const cacheKey = `allProducts_${JSON.stringify({ searchQuery, category, sale, feature, sort, priceRange })}`;
  const cacheDuration = 30 * 1000; // 30 seconds

  // CRITICAL: When returning to the tab, ensure loader isn't stuck
  // If we already have data or cache, force loading states off
  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const cached = SessionStorage.getWithExpiry<any[]>(cacheKey);
      const staleCache = SessionStorage.get<any[]>(cacheKey);
      if ((cached && cached.length > 0) || (staleCache && staleCache.length > 0) || products.length > 0 || hasEverLoadedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [cacheKey, products.length]);

  useEffect(() => {
    if (authLoading) return;

    // Reset fetch ref if cache key changed (dependencies changed)
    const cacheKeyChanged = hasFetchedRef.current !== cacheKey && hasFetchedRef.current !== "";
    if (cacheKeyChanged) {
      hasFetchedRef.current = "";
      setCurrentPage(0);
      // Clear products when filters change to avoid showing stale data
      setProducts([]);
      setIsLoading(true);
      hasEverLoadedRef.current = false;
    }

    // CRITICAL: Check cache first - if we have cached data, use it immediately
    // This prevents loader from showing on tab switches
    const cached = SessionStorage.getWithExpiry<any[]>(cacheKey);
    const staleCache = SessionStorage.get<any[]>(cacheKey);
    
    if ((cached && cached.length > 0) || (staleCache && staleCache.length > 0)) {
      const cacheData = cached || staleCache;
      if (cacheData && Array.isArray(cacheData) && !products.length) {
        setProducts(cacheData);
        setIsLoading(false);
        setIsSuccess(true);
        hasEverLoadedRef.current = true;
        hasFetchedRef.current = cacheKey;
        // Background refetch to update cache if stale
        if (staleCache && !cached) {
          // Continue to fetch in background
        } else {
          return; // We have fresh cache, no need to fetch
        }
      } else if (cacheData && products.length) {
        // We already have products, just ensure loading is false
        setIsLoading(false);
        hasEverLoadedRef.current = true;
        return;
      }
    }

    // CRITICAL: If we've ever loaded products, don't show loader on tab switches
    // Only show loader on true initial load
    if (hasEverLoadedRef.current && hasFetchedRef.current === cacheKey) {
      setIsLoading(false);
      return;
    }

    // Only fetch if not already fetched for this cache key
    if (hasFetchedRef.current === cacheKey) return;

    const fetchProducts = async () => {
      // CRITICAL: Only set loading to true if we haven't loaded before
      // This prevents loader from blocking tab switches
      if (!hasEverLoadedRef.current) {
        setIsLoading(true);
      }
      setIsFetching(true);
      setIsError(false);
      hasFetchedRef.current = cacheKey;

      try {
        // Build query params for API route
        const params = new URLSearchParams();
        params.append("limit", PAGE_SIZE.toString());
        params.append("offset", "0");
        
        if (searchQuery) params.append("search", searchQuery);
        if (category) params.append("category_id", category);
        if (feature === "true") params.append("featured", "true");
        if (sale === "true") params.append("sale", "true");
        if (sort) {
          if (sort === "trending") {
            params.append("sort", "trending");
          } else if (sort === "price-true") {
            params.append("sort", "price-asc");
          } else if (sort === "price-false") {
            params.append("sort", "price-desc");
          } else if (sort === "updated_at-false") {
            params.append("sort", "newest");
          }
        }

        console.log("Fetching products from API:", params.toString());
        const response = await fetch(`/api/products?${params.toString()}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();
        const result = Array.isArray(data.products) ? data.products : [];
        
        console.log("Products fetched:", result.length);
        setProducts(result);
        setHasNextPage((result?.length || 0) >= PAGE_SIZE);
        setIsSuccess(true);
        SessionStorage.set(cacheKey, result, cacheDuration);
        hasEverLoadedRef.current = true; // Mark that we've successfully loaded
      } catch (err) {
        console.error("Error fetching products:", err);
        setIsError(true);
        // Try stale cache on error
        const staleCache = SessionStorage.get<any[]>(cacheKey);
        if (staleCache && Array.isArray(staleCache)) {
          setProducts(staleCache);
          hasEverLoadedRef.current = true; // Mark as loaded even with stale cache
        } else {
          setProducts([]);
        }
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchProducts();
  }, [authLoading, searchQuery, category, sale, feature, sort, priceRange, cacheKey]);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage) return;

    setIsFetchingNextPage(true);
    try {
      const nextPage = currentPage + 1;
      const offset = nextPage * PAGE_SIZE;
      
      // Build query params for API route
      const params = new URLSearchParams();
      params.append("limit", PAGE_SIZE.toString());
      params.append("offset", offset.toString());
      
      if (searchQuery) params.append("search", searchQuery);
      if (category) params.append("category_id", category);
      if (feature === "true") params.append("featured", "true");
      if (sale === "true") params.append("sale", "true");
      if (sort) {
        if (sort === "trending") {
          params.append("sort", "trending");
        } else if (sort === "price-true") {
          params.append("sort", "price-asc");
        } else if (sort === "price-false") {
          params.append("sort", "price-desc");
        } else if (sort === "updated_at-false") {
          params.append("sort", "newest");
        }
      }

      const response = await fetch(`/api/products?${params.toString()}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status}`);
      }

      const data = await response.json();
      const result = Array.isArray(data.products) ? data.products : [];
      
      if (result && result.length > 0) {
        setProducts((prev) => {
          const prevArray = Array.isArray(prev) ? prev : [];
          return [...prevArray, ...result];
        });
        setHasNextPage(result.length >= PAGE_SIZE);
        setCurrentPage(nextPage);
      } else {
        setHasNextPage(false);
      }
    } catch (err) {
      console.error("Error fetching next page:", err);
    } finally {
      setIsFetchingNextPage(false);
    }
  }, [currentPage, hasNextPage, isFetchingNextPage, searchQuery, category, sale, feature, sort, priceRange]);

  return {
    products: Array.isArray(products) ? products : [],
    isLoading,
    isError,
    isSuccess,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}

export function useFetchSingleProduct(productId: string, retry: boolean) {
  // Check cache immediately on mount to set initial state correctly
  // This runs synchronously during render, before any effects
  // CRITICAL: This must NEVER set isLoading to true if we have any cache or have loaded before
  const getInitialState = () => {
    if (!productId) {
      return { data: null, isPending: false, isLoading: false, hasEverLoaded: false };
    }
    const cacheKey = `singleProduct_${productId}`;
    const cached = SessionStorage.getWithExpiry<any>(cacheKey);
    if (cached) {
      const arr = Array.isArray(cached) ? cached : [cached];
      return { data: arr, isPending: false, isLoading: false, hasEverLoaded: true };
    }
    const staleCache = getStaleProductCache(cacheKey);
    if (staleCache && staleCache.length > 0) {
      return { data: staleCache, isPending: false, isLoading: false, hasEverLoaded: true };
    }
    return { data: null, isPending: true, isLoading: true, hasEverLoaded: false };
  };

  const initialState = getInitialState();
  // CRITICAL: Initialize with cache if available to prevent loader flash
  const [data, setData] = useState<any>(initialState.data);
  const [isPending, setIsPending] = useState(initialState.isPending);
  // CRITICAL: Only set isLoading to true if we have NO cached data
  const [isLoading, setIsLoading] = useState(initialState.isLoading);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);
  const hasInitialLoadRef = useRef<boolean>(false);
  const hasEverLoadedRef = useRef<boolean>(initialState.hasEverLoaded); // Track if we've ever had data
  const shouldShowLoaderRef = useRef<boolean>(!initialState.hasEverLoaded); // Track if we should ever show loader

  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      if (!productId) return;
      const cacheKey = `singleProduct_${productId}`;
      const cached = SessionStorage.getWithExpiry<any>(cacheKey);
      const staleCache = getStaleProductCache(cacheKey);
      if (cached || (staleCache && staleCache.length > 0) || data || hasEverLoadedRef.current) {
        setIsLoading(false);
        setIsPending(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [productId, data]);

  useLayoutEffect(() => {
    if (!productId) {
      setIsPending(false);
      setIsLoading(false);
      return;
    }

    const cacheKey = `singleProduct_${productId}`;
    const cached = SessionStorage.getWithExpiry<any>(cacheKey);
    const staleCache = getStaleProductCache(cacheKey);
    const hasData = cached || (staleCache && staleCache.length > 0) || data || hasEverLoadedRef.current;

    if (hasData) {
      if ((cached || staleCache) && !data) {
        const cacheData = cached
          ? (Array.isArray(cached) ? cached : [cached])
          : staleCache!;
        setData(cacheData);
      }
      SessionStorage.set(`hasLoaded_${productId}`, true, 24 * 60 * 60 * 1000);
      setIsPending(false);
      setIsLoading(false);
      shouldShowLoaderRef.current = false;
      hasFetchedRef.current = productId;
      hasInitialLoadRef.current = true;
      hasEverLoadedRef.current = true;
    }
  }, [productId, data]);

  useEffect(() => {
    if (!productId) {
      setIsPending(false);
      setIsLoading(false);
      return;
    }

    const cacheKey = `singleProduct_${productId}`;
    const cacheDuration = 30 * 1000;
    const cached = SessionStorage.getWithExpiry<any>(cacheKey);
    const staleCache = getStaleProductCache(cacheKey);
    const hasUsableData = cached || (staleCache && staleCache.length > 0) || (data && (Array.isArray(data) ? data.length > 0 : true));

    if (hasUsableData) {
      if (cached && !data) {
        const cacheData = Array.isArray(cached) ? cached : [cached];
        setData(cacheData);
      } else if (staleCache && staleCache.length > 0 && !data) {
        setData(staleCache);
      }
      SessionStorage.set(`hasLoaded_${productId}`, true, 24 * 60 * 60 * 1000);
      setIsPending(false);
      setIsLoading(false);
      shouldShowLoaderRef.current = false;
      hasFetchedRef.current = productId;
      hasInitialLoadRef.current = true;
      hasEverLoadedRef.current = true;

      if (retry && cached) {
        setIsPending(true);
        fetchSingleProductFromApi(productId)
          .then((result) => {
            if (result && result.length > 0) {
              setData(result);
              SessionStorage.set(cacheKey, result, cacheDuration);
            }
          })
          .catch(() => {})
          .finally(() => setIsPending(false));
      }
      return;
    }

    const fetchProduct = async () => {
      setIsPending(true);
      if (shouldShowLoaderRef.current && !hasEverLoadedRef.current) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }
      setIsError(false);
      setError(null);
      hasFetchedRef.current = productId;

      try {
        const result = await fetchSingleProductFromApi(productId);
        setData(result || []);
        if (result && result.length > 0) {
          SessionStorage.set(cacheKey, result, cacheDuration);
          // CRITICAL: Set a persistent flag that we've loaded this product
          // This survives component remounts and prevents loader from showing again
          // Use a very long expiry (24 hours) to ensure it persists across tab switches
          SessionStorage.set(`hasLoaded_${productId}`, true, 24 * 60 * 60 * 1000); // 24 hours
          hasEverLoadedRef.current = true; // Mark that we've successfully loaded data
          shouldShowLoaderRef.current = false; // Never show loader again
          // Also set isLoading to false immediately after setting data
          setIsLoading(false);
        }
        hasInitialLoadRef.current = true;
      } catch (err: any) {
        setError(err);
        setIsError(true);
        const stale = getStaleProductCache(cacheKey);
        if (stale && stale.length > 0) {
          setData(stale);
          SessionStorage.set(`hasLoaded_${productId}`, true, 24 * 60 * 60 * 1000);
          hasInitialLoadRef.current = true;
          hasEverLoadedRef.current = true;
          shouldShowLoaderRef.current = false;
        }
      } finally {
        setIsPending(false);
        // CRITICAL: Always set isLoading to false after fetch
        // Also check if we have data - if yes, definitely set to false
        if (data || hasEverLoadedRef.current) {
          setIsLoading(false);
        } else {
          setIsLoading(false); // Always set to false after fetch completes
        }
      }
    };

    // Only fetch if we haven't already fetched this product (prevents refetch on tab switch)
    // Or if retry is explicitly true
    if (hasFetchedRef.current !== productId || retry) {
      fetchProduct();
    } else {
      // We've already fetched - just ensure loading states are false
      setIsPending(false);
      setIsLoading(false);
    }
  }, [productId, retry, data]);

  const refetch = useCallback(async () => {
    if (!productId) return;
    const cacheKey = `singleProduct_${productId}`;
    // Don't clear cache on refetch - keep it for instant display
    // SessionStorage.remove(cacheKey);
    // hasFetchedRef.current = null;
    
    // If we've ever loaded data, don't show loader on refetch
    const shouldShowLoader = !hasEverLoadedRef.current;
    
    if (shouldShowLoader) {
      setIsPending(true);
      setIsLoading(true);
    } else {
      setIsPending(true); // Set pending but not loading (silent background refetch)
    }
    
    try {
      const result = await fetchSingleProductFromApi(productId);
      setData(result || []);
      if (result && result.length > 0) {
        SessionStorage.set(cacheKey, result, 30 * 1000);
        hasEverLoadedRef.current = true;
      }
    } catch (err: any) {
      setError(err);
      setIsError(true);
    } finally {
      setIsPending(false);
      setIsLoading(false);
    }
  }, [productId]);

  return { data, isPending, isLoading, error, isError, refetch };
}

export function useFetchWishlist(userId: string, refresh: number) {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const cacheKey = `wishlist_${userId}`;
    const cacheDuration = 30 * 1000; // 30 seconds

    // Check cache first
    const cached = SessionStorage.getWithExpiry<any[]>(cacheKey);
    if (cached && hasFetchedRef.current === userId) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    const fetchWishlist = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      hasFetchedRef.current = userId;

      try {
        const result = await getWishlist(userId);
        setData(result || []);
        SessionStorage.set(cacheKey, result || [], cacheDuration);
      } catch (err: any) {
        setError(err);
        setIsError(true);
        // Try stale cache on error
        const staleCache = SessionStorage.get<any[]>(cacheKey);
        if (staleCache) {
          setData(staleCache);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, [userId, refresh]);

  console.log("from query api", data);

  return { data, isLoading, error, isError };
}

// FETCH ORDERS
export function useFetchUserOrders(userId: string) {
  const [data, setData] = useState<any[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsPending(false);
      setIsLoading(false);
      return;
    }

    const cacheKey = `userOrders_${userId}`;
    const cacheDuration = 5 * 60 * 1000; // 5 minutes

    // Check cache first
    const cached = SessionStorage.getWithExpiry<any[]>(cacheKey);
    if (cached && hasFetchedRef.current === userId) {
      setData(cached);
      setIsPending(false);
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsPending(true);
      setIsLoading(true);
      setIsError(false);
      setError(null);
      hasFetchedRef.current = userId;

      try {
        const result = await fetchAllOrders(userId);
        setData(result || []);
        SessionStorage.set(cacheKey, result || [], cacheDuration);
      } catch (err: any) {
        setError(err);
        setIsError(true);
        // Try stale cache on error
        const staleCache = SessionStorage.get<any[]>(cacheKey);
        if (staleCache) {
          setData(staleCache);
        }
      } finally {
        setIsPending(false);
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  return { data, isPending, isLoading, error, isError };
}

// REGISTER NEW VENDOR
export function useRegisterVendor(userId: string) {
  const { notify } = useToast();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  const registerVendor = useCallback(
    async (vendorData: any) => {
      setIsRegistering(true);
      setIsSuccess(false);
      setIsError(false);
      setError(null);

      try {
        const data = await registerNewVendor(vendorData);
        setIsSuccess(true);

        // Clear related caches
        SessionStorage.remove("currentUser");
        SessionStorage.remove(`vendor_${userId}`);

        // Send confirmation email
        try {
          const userEmail = data.userEmail || data.user?.email || data.profiles?.email;
          if (userEmail && data.business_name) {
            const response = await fetch("/api/vendors/send-confirmation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: userEmail,
                businessName: data.business_name,
                userId: userId,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error("Failed to send confirmation email:", errorData);
            } else {
              console.log("Vendor confirmation email sent successfully");
            }
          }
        } catch (emailError) {
          console.error("Error sending confirmation email:", emailError);
        }

        return data;
      } catch (err: any) {
        setError(err);
        setIsError(true);
        throw err;
      } finally {
        setIsRegistering(false);
      }
    },
    [userId, notify]
  );

  return {
    registerVendor,
    isRegistering,
    isSuccess,
    isError,
    error,
  };
}

// VENDOR DASHBOARD INFORMATION
export function useFetchVendorDetails(userId: string) {
  const [vendor, setVendor] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsPending(false);
      return;
    }

    const cacheKey = `vendor_${userId}`;
    const cacheDuration = 15 * 60 * 1000; // 15 minutes

    // Check cache first
    const cached = SessionStorage.getWithExpiry<any>(cacheKey);
    if (cached && hasFetchedRef.current === userId) {
      setVendor(cached);
      setIsPending(false);
      return;
    }

    const fetchVendor = async () => {
      setIsPending(true);
      setIsError(false);
      setError(null);
      hasFetchedRef.current = userId;

      try {
        const result = await fetchVendorDetails(userId);
        setVendor(result);
        if (result) {
          SessionStorage.set(cacheKey, result, cacheDuration);
        }
      } catch (err: any) {
        setError(err);
        setIsError(true);
        // Try stale cache on error
        const staleCache = SessionStorage.get<any>(cacheKey);
        if (staleCache) {
          setVendor(staleCache);
        }
      } finally {
        setIsPending(false);
      }
    };

    fetchVendor();
  }, [userId]);

  return { vendor, isPending, error, isError };
}

// VENDOR ADD PRODUCTS
export function useAddProduct(userId: string) {
  const { notify } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const createProduct = useCallback(
    async (productData: any) => {
      setIsCreating(true);
      setIsError(false);
      setIsSuccess(false);

      try {
        await addNewProduct(productData);
        setIsSuccess(true);

        // Clear related caches
        SessionStorage.remove(`vendor_${userId}`);
        // Clear products cache (all variations)
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith("kanyiji_allProducts_")) {
            SessionStorage.remove(key.replace("kanyiji_", ""));
          }
        });

        return true;
      } catch (err: any) {
        setIsError(true);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [userId, notify]
  );

  const reset = useCallback(() => {
    setIsError(false);
    setIsSuccess(false);
  }, []);

  return { createProduct, isCreating, isError, isSuccess, reset };
}

// DELETE VENDOR PRODUCT
export function useDeleteVendorProduct() {
  const { notify } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProduct = useCallback(
    async (variables: {
      productId: string;
      userId: string;
      imagePath: any[];
    }) => {
      setIsDeleting(true);

      try {
        // Step 1: delete product images
        await deleteVendorProductImages(variables.imagePath);

        // Step 2: delete product from database
        await deleteVendorProduct(variables.productId, variables.userId);

        notify("Product deleted successfully", "success");

        // Clear related caches
        SessionStorage.remove(`vendor_${variables.userId}`);
        // Clear products cache (all variations)
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith("kanyiji_allProducts_")) {
            SessionStorage.remove(key.replace("kanyiji_", ""));
          }
        });

        return true;
      } catch (err) {
        notify("Something went wrong, unable to delete product", "error");
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    [notify]
  );

  return { deleteProduct, isDeleting };
}

// EDIT VENDOR PRODUCT
export function useEditVendorProduct() {
  const { notify } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const editVendorProduct = useCallback(
    async (variables: {
      productId: string;
      userId: string;
      updates: any;
    }) => {
      setIsEditing(true);

      try {
        await editProduct(variables.productId, variables.updates);
        notify("Product updated successfully", "success");

        // Clear related caches
        SessionStorage.remove(`vendor_${variables.userId}`);
        // Clear products cache (all variations)
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith("kanyiji_allProducts_")) {
            SessionStorage.remove(key.replace("kanyiji_", ""));
          }
        });

        return true;
      } catch (err) {
        notify("Something went wrong, unable to update product", "error");
        throw err;
      } finally {
        setIsEditing(false);
      }
    },
    [notify]
  );

  return { editVendorProduct, isEditing };
}

// FETCH VENDOR ORDERS
export function useFetchVendorOrders(status?: string) {
  const { authLoading } = useSupabaseAuthReady();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const cacheKey = `vendorOrders_${status || "all"}`;
    const cacheDuration = 30 * 1000; // 30 seconds

    // Check cache first
    const cached = SessionStorage.getWithExpiry<any>(cacheKey);
    if (cached && hasFetchedRef.current === cacheKey) {
      setOrders(cached.orders || []);
      setStats(cached.stats || stats);
      setPagination(cached.pagination);
      setIsLoading(false);
      return;
    }

    const fetchOrders = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      hasFetchedRef.current = cacheKey;

      try {
        const result = await fetchVendorOrders(undefined, status);
        const ordersData = result?.orders || [];
        const statsData = result?.stats || stats;
        const paginationData = result?.pagination;

        setOrders(ordersData);
        setStats(statsData);
        setPagination(paginationData);

        SessionStorage.set(
          cacheKey,
          { orders: ordersData, stats: statsData, pagination: paginationData },
          cacheDuration
        );
      } catch (err: any) {
        setError(err);
        setIsError(true);
        // Try stale cache on error
        const staleCache = SessionStorage.get<any>(cacheKey);
        if (staleCache) {
          setOrders(staleCache.orders || []);
          setStats(staleCache.stats || stats);
          setPagination(staleCache.pagination);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [authLoading, status]);

  const refetch = useCallback(async () => {
    const cacheKey = `vendorOrders_${status || "all"}`;
    SessionStorage.remove(cacheKey);
    hasFetchedRef.current = null;
    setIsLoading(true);
    try {
      const result = await fetchVendorOrders(undefined, status);
      const ordersData = result?.orders || [];
      const statsData = result?.stats || stats;
      const paginationData = result?.pagination;

      setOrders(ordersData);
      setStats(statsData);
      setPagination(paginationData);

      SessionStorage.set(
        cacheKey,
        { orders: ordersData, stats: statsData, pagination: paginationData },
        30 * 1000
      );
    } catch (err: any) {
      setError(err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  return {
    orders,
    stats,
    pagination,
    isLoading,
    error,
    isError,
    refetch,
  };
}

// UPDATE VENDOR ORDER STATUS
export function useUpdateVendorOrderStatus() {
  const [isPending, setIsPending] = useState(false);

  const updateOrderStatus = useCallback(
    async ({ orderId, status }: { orderId: string; status: string }) => {
      setIsPending(true);
      try {
        await updateVendorOrderStatus(orderId, status);
        // Clear vendor orders cache
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith("kanyiji_vendorOrders_")) {
            SessionStorage.remove(key.replace("kanyiji_", ""));
          }
        });
        return true;
      } finally {
        setIsPending(false);
      }
    },
    []
  );

  return { updateOrderStatus, isPending };
}
