"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  Dispatch,
  useState,
} from "react";
import { useToast } from "@/components/ui/Toast";

// --------------------
// TYPES
// --------------------
type Product = {
  id: string;
  name: string;
  price: number;
  title: string;
  product_images: {
    id: string;
    image_url: string;
  }[];
};

type CartItem = Product & { quantity: number };

type CartState = {
  items: CartItem[];
  total: number;
};

type CartAction =
  | { type: "ADD_TO_CART"; product: Product }
  | { type: "INCREASE_QUANTITY"; id: string }
  | { type: "DECREASE_QUANTITY"; id: string }
  | { type: "REMOVE_FROM_CART"; id: string }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; state: CartState };

// --------------------
// CONTEXT
// --------------------
type CartContextType = {
  state: CartState;
  dispatch: Dispatch<CartAction>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

// --------------------
// UTILITIES
// --------------------
const calculateTotal = (items: CartItem[]) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);

const loadCartFromStorage = (): CartState => {
  if (typeof window === "undefined") {
    // During SSR
    return { items: [], total: 0 };
  }

  try {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      const parsed = JSON.parse(storedCart);
      return {
        items: parsed.items || [],
        total: parsed.total || calculateTotal(parsed.items || []),
      };
    }
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
  }

  return { items: [], total: 0 };
};

// --------------------
// REDUCER
// --------------------
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "LOAD_CART":
      return action.state;

    case "ADD_TO_CART": {
      const existingItem = state.items.find(
        (item) => item.id === action.product.id
      );

      const updatedItems = existingItem
        ? state.items.map((item) =>
            item.id === action.product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...state.items, { ...action.product, quantity: 1 }];

      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case "INCREASE_QUANTITY": {
      const updatedItems = state.items.map((item) =>
        item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item
      );
      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case "DECREASE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);
      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case "REMOVE_FROM_CART": {
      const updatedItems = state.items.filter((item) => item.id !== action.id);
      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case "CLEAR_CART":
      return { items: [], total: 0 };

    default:
      return state;
  }
};

// --------------------
// PROVIDER
// --------------------
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });
  const [isLoaded, setIsLoaded] = useState(false); // Prevent hydration mismatch

  // Load cart from localStorage only after client hydration
  useEffect(() => {
    const storedState = loadCartFromStorage();
    dispatch({ type: "LOAD_CART", state: storedState });
    setIsLoaded(true);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("cart", JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [state, isLoaded]);

  // Prevent rendering on the server to avoid SSR/client mismatch
  if (!isLoaded) {
    return null;
  }

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// --------------------
// CUSTOM HOOK
// --------------------
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
