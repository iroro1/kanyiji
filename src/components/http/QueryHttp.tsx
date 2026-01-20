"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "../ui/Toast";
import { SessionStorage } from "@/utils/sessionStorage";
import {
  LoginUser,
  getAllProducts,
  getWishlist,
  getSingleProduct,
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
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const hasFetchedRef = useRef(false);

  const cacheKey = `allProducts_${JSON.stringify({ searchQuery, category, sale, feature, sort, priceRange })}`;
  const cacheDuration = 30 * 1000; // 30 seconds

  useEffect(() => {
    if (authLoading) return;

    // Check cache first
    const cached = SessionStorage.getWithExpiry<any[]>(cacheKey);
    if (cached && cached.length > 0) {
      setProducts(cached);
      setIsLoading(false);
      setIsSuccess(true);
      hasFetchedRef.current = true;
      return;
    }

    // Only fetch if not already fetched
    if (hasFetchedRef.current) return;

    const fetchProducts = async () => {
      setIsLoading(true);
      setIsFetching(true);
      setIsError(false);
      hasFetchedRef.current = true;

      try {
        const result = await fetchAllProducts(
          { pageParam: 0 },
          searchQuery,
          category,
          sale,
          feature,
          sort,
          priceRange
        );
        setProducts(result || []);
        setHasNextPage((result?.length || 0) >= PAGE_SIZE);
        setIsSuccess(true);
        SessionStorage.set(cacheKey, result || [], cacheDuration);
      } catch (err) {
        setIsError(true);
        // Try stale cache on error
        const staleCache = SessionStorage.get<any[]>(cacheKey);
        if (staleCache) {
          setProducts(staleCache);
        }
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    };

    fetchProducts();
  }, [authLoading, searchQuery, category, sale, feature, sort, priceRange]);

  const fetchNextPage = useCallback(async () => {
    if (isFetchingNextPage || !hasNextPage) return;

    setIsFetchingNextPage(true);
    try {
      const nextPage = currentPage + 1;
      const result = await fetchAllProducts(
        { pageParam: nextPage },
        searchQuery,
        category,
        sale,
        feature,
        sort,
        priceRange
      );
      if (result && result.length > 0) {
        setProducts((prev) => [...prev, ...result]);
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
    products,
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
  const [data, setData] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isError, setIsError] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsPending(false);
      setIsLoading(false);
      return;
    }

    const cacheKey = `singleProduct_${productId}`;
    const cacheDuration = 30 * 1000; // 30 seconds

    // Check cache first
    const cached = SessionStorage.getWithExpiry<any>(cacheKey);
    if (cached && hasFetchedRef.current === productId) {
      setData(cached);
      setIsPending(false);
      setIsLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setIsPending(true);
      setIsLoading(true);
      setIsError(false);
      setError(null);
      hasFetchedRef.current = productId;

      try {
        const result = await getSingleProduct(productId);
        const product = result?.[0] || null;
        setData(product);
        if (product) {
          SessionStorage.set(cacheKey, product, cacheDuration);
        }
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
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, retry]);

  const refetch = useCallback(async () => {
    if (!productId) return;
    const cacheKey = `singleProduct_${productId}`;
    SessionStorage.remove(cacheKey);
    hasFetchedRef.current = null;
    setIsPending(true);
    setIsLoading(true);
    try {
      const result = await getSingleProduct(productId);
      const product = result?.[0] || null;
      setData(product);
      if (product) {
        SessionStorage.set(cacheKey, product, 30 * 1000);
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
