"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllProducts, getWishlist, getSingleProduct } from "./Api";

// PRODUCTS QUERY SECTION

export function useFetchAllProducts() {
  const {
    data: products,
    isPending: productsIsLoading,
    error: productsError,
    isError,
  } = useQuery({
    queryKey: ["allproducts"],
    queryFn: getAllProducts,
    staleTime: 15 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 5,
  });

  return { products, productsIsLoading, productsError, isError };
}

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
  console.log(refresh);
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

import {
  QueryClient,
  QueryClientProvider as RQProvider,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function AppQueryProvider({ children }: { children: React.ReactNode }) {
  return <RQProvider client={queryClient}>{children}</RQProvider>;
}

export default AppQueryProvider;
