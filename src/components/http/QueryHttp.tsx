"use client";

import {
  QueryClient,
  QueryClientProvider as RQProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "../ui/Toast";

const queryClient = new QueryClient();

function AppQueryProvider({ children }: { children: React.ReactNode }) {
  return <RQProvider client={queryClient}>{children}</RQProvider>;
}
export default AppQueryProvider;

// TANSTACK QUERIES STARTS HERE
import { useQuery, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import {
  LoginUser,
  getAllProducts,
  getWishlist,
  getSingleProduct,
  fetchAllOrders,
  fetchVendorDetails,
  deleteVendorProduct,
  deleteVendorProductImages,
  editProduct,
  fetchAllProducts,
} from "./Api";
import { useSupabaseAuthReady } from "@/lib/useSupabaseAuthReady";

// AUTHENTICATE NEW USER
export function useLoginUser() {
  const { mutate: login, isPending } = useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      LoginUser(credentials),

    onSuccess: () => {
      console.log("user signed in successfully");
    },
  });

  return { login, isPending };
}

// PRODUCTS QUERY SECTION
// ALL PRODUCTS AND SERVICES APIs HERE
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

  const {
    data,
    fetchNextPage, // Function to fetch the next page
    hasNextPage, // Boolean, true if there is a next page
    isFetchingNextPage, // Boolean for next page loading state
    isLoading,
    isFetching,
    isError,
    isSuccess,
  } = useInfiniteQuery({
    queryKey: [
      "allProducts",
      { searchQuery, category, sale, feature, sort, priceRange },
    ],
    queryFn: ({ pageParam }) =>
      fetchAllProducts(
        { pageParam },
        searchQuery,
        category,
        sale,
        feature,
        sort,
        priceRange
      ),
    initialPageParam: 0, // The initial page number to
    // refetchOnMount: "always",
    enabled: !authLoading,

    getNextPageParam: (lastPage, allPages) => {
      // If the last page had fewer items than the page size, there are no more pages.
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // Otherwise, return the next page number
      return allPages.length;
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 15 * 60 * 1000,
  });

  // Flatten the pages array for easy rendering
  const products =
    data?.pages.flatMap((page: any) => page.slice(0, PAGE_SIZE)) ?? [];

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

// export function useFetchAllProducts(searchQuery: string) {
//   const {
//     data: products,
//     isPending: productsIsLoading,
//     error: productsError,
//     isError,
//   } = useQuery({
//     queryKey: ["allproducts", searchQuery],
//     queryFn: () => getAllProducts(searchQuery),
//     staleTime: 15 * 60 * 1000,
//     gcTime: 15 * 60 * 1000,
//   });

//   return { products, productsIsLoading, productsError, isError };
// }

export function useFetchSingleProduct(productId: string, retry: boolean) {
  const { data, isPending, error, isError } = useQuery({
    queryKey: ["singleProduct", productId, retry],
    queryFn: () => getSingleProduct(productId),
    staleTime: 15 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 5,
  });

  return { data, isPending, error, isError };
}

export function useFetchWishlist(userId: string, refresh: number) {
  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["allwishlist", userId, refresh],
    queryFn: () => getWishlist(userId),
    enabled: !!userId,
    staleTime: 15 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 5,
  });

  console.log("from query api", data);

  return { data, isLoading, error, isError };
}

// FETCH ORDERS
export function useFetchUserOrders(userId: string) {
  const { data, isPending, error, isError } = useQuery({
    queryKey: ["userOrders", userId],
    queryFn: () => fetchAllOrders(userId),
    staleTime: 15 * 60 * 1000,
    enabled: !!userId,
    gcTime: 15 * 60 * 1000,
    // retry: 5,
  });

  return { data, isPending, error, isError };
}

// VENDOR DASHBOARD INFORMATION
export function useFetchVendorDetails(userId: string) {
  const {
    data: vendor,
    isPending,
    error,
    isError,
  } = useQuery({
    queryKey: ["vendor", userId],
    queryFn: () => fetchVendorDetails(userId),
    staleTime: 15 * 60 * 1000,
    enabled: !!userId,
    gcTime: 15 * 60 * 1000,
    // retry: 5,
  });

  return { vendor, isPending, error, isError };
}

// DELETE VENDOR PRODUCT
export function useDeleteVendorProduct() {
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const { mutate: deleteProduct, isPending: isDeleting } = useMutation({
    mutationFn: async (variables: {
      productId: string;
      userId: string;
      imagePath: any[];
    }) => {
      // Step 1: delete product images
      await deleteVendorProductImages(variables.imagePath);

      // Step 2: delete product from database
      return await deleteVendorProduct(variables.productId, variables.userId);
    },

    onSuccess: (_data, variables) => {
      notify("Product deleted successfully", "success");
      queryClient.invalidateQueries({
        queryKey: ["vendor", variables.userId],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: () => {
      notify("Something went wrong, unable to delete product", "error");
    },
  });

  return { deleteProduct, isDeleting };
}

// EDIT VENDOR PRODUCT
export function useEditVendorProduct() {
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const { mutate: editVendorProduct, isPending: isEditing } = useMutation({
    mutationFn: async (variables: {
      productId: string;
      userId: string;
      updates: any; // ideally use a typed interface for product fields
    }) => {
      // Step 1: Update product in database
      return await editProduct(variables.productId, variables.updates);
    },

    onSuccess: (_data, variables) => {
      notify("Product updated successfully", "success");

      // Invalidate vendor-specific cache
      queryClient.invalidateQueries({
        queryKey: ["vendor", variables.userId],
      });

      // Invalidate products list cache
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },

    onError: () => {
      notify("Something went wrong, unable to update product", "error");
    },
  });

  return { editVendorProduct, isEditing };
}
