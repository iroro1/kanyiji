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
import { toast } from "react-hot-toast";

// --------------------
// TYPES
// --------------------
type Product = {
  id: string;
  name: string;
  price: number;
  title?: string;
  vendor_id?: string;
  stock_quantity?: number;
  product_images: {
    id: string;
    image_url: string;
  }[];
  selectedVariant?: {
    size?: string;
    color?: string;
    variantId?: string;
  };
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

      const maxStock = action.product.stock_quantity ?? Infinity;
      
      // Check if product is out of stock (only if stock_quantity is explicitly 0)
      if (action.product.stock_quantity === 0) {
        toast.error("This product is out of stock");
        return state;
      }

      // Check if item with same ID and variant already exists
      const existingItemWithVariant = state.items.find(
        (item) => {
          const sameId = item.id === action.product.id;
          const sameVariant = 
            (!item.selectedVariant && !action.product.selectedVariant) ||
            (item.selectedVariant?.size === action.product.selectedVariant?.size &&
             item.selectedVariant?.color === action.product.selectedVariant?.color &&
             item.selectedVariant?.variantId === action.product.selectedVariant?.variantId);
          return sameId && sameVariant;
        }
      );

      const updatedItems = existingItemWithVariant
        ? state.items.map((item) => {
            const isSameItem = item.id === action.product.id &&
              ((!item.selectedVariant && !action.product.selectedVariant) ||
               (item.selectedVariant?.size === action.product.selectedVariant?.size &&
                item.selectedVariant?.color === action.product.selectedVariant?.color &&
                item.selectedVariant?.variantId === action.product.selectedVariant?.variantId));
            
            if (isSameItem) {
              const newQuantity = Math.min(item.quantity + 1, maxStock);
              if (newQuantity > maxStock) {
                toast.error(`Only ${maxStock} items available in stock`);
                return item;
              }
              return { 
                ...item, 
                quantity: newQuantity,
                stock_quantity: action.product.stock_quantity ?? item.stock_quantity,
                selectedVariant: action.product.selectedVariant ?? item.selectedVariant
              };
            }
            return item;
          })
        : [...state.items, { ...action.product, quantity: Math.min(1, maxStock) }];

      return { items: updatedItems, total: calculateTotal(updatedItems) };
    }

    case "INCREASE_QUANTITY": {
      const updatedItems = state.items.map((item) => {
        if (item.id === action.id) {
          const maxStock = item.stock_quantity || Infinity;
          if (item.quantity >= maxStock) {
            toast.error(`Only ${maxStock} items available in stock`);
            return item;
          }
          return { 
            ...item, 
            quantity: Math.min(item.quantity + 1, maxStock)
          };
        }
        return item;
      });
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
