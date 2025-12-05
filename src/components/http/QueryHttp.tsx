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
  addNewProduct,
  registerNewVendor,
  getCurrentUserWithAxios,
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

//  GET CURRENT USER
export function useFetchCurrentUser() {
  const { authLoading } = useSupabaseAuthReady();

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUserWithAxios,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 5,
    enabled: !authLoading,
  });

  return { data, isPending, error, isError };
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

// REGISTER NEW VENDOR
export function useRegisterVendor(userId: string) {
  const queryClient = useQueryClient();

  const {
    mutate: registerVendor,
    isPending: isRegistering, // This replaces your 'isSubmitting' state
    isSuccess,
    isError,
    error,
  } = useMutation({
    // The function to call
    mutationFn: registerNewVendor, // (variables) => registerNewVendor(variables)

    // Handle success
    onSuccess: async (data) => {
      // 'data' is the vendorData returned from the API function
      // toast.success(`Vendor "${data.business_name}" registered successfully!`);

      // Invalidate the 'vendors' query to refetch
      // This will update any list of vendors shown elsewhere
      queryClient.invalidateQueries({ queryKey: ["vendor", userId] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

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
            // Don't throw - registration was successful, email is just a bonus
          } else {
            console.log("Vendor confirmation email sent successfully");
          }
        } else {
          console.warn("Cannot send confirmation email: missing email or business name", {
            hasEmail: !!userEmail,
            hasBusinessName: !!data.business_name,
          });
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't throw - registration was successful, email is just a bonus
      }
    },

    // Handle error
    onError: (err) => {
      // The error is 'thrown' from the API function
      // toast.error(`Registration failed: ${err.message}`);
    },
  });

  return {
    registerVendor,
    isRegistering,
    isSuccess, // Your component can use this
    isError, // Your component can use this
    error, // Your component can use this
  };
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

// VENDOR ADD PRODUCTS
export function useAddProduct(userId: string) {
  const queryClient = useQueryClient();

  const {
    mutate: createProduct, // Renamed 'mutate' to 'createProduct' for clarity
    isPending: isCreating, // Renamed 'isPending' to 'isCreating'
    isError,
  } = useMutation({
    // Pass the API function
    mutationFn: addNewProduct,

    // Handle success
    onSuccess: () => {
      // Invalidate the 'products' query to refetch the list
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["vendor", userId] });
    },

    // Handle error
    onError: (err) => {
      // toast.error(err.message);
    },
  });

  return { createProduct, isCreating, isError };
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
