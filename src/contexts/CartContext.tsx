// CartContext.tsx
"use client"; // needed for Next.js App Router

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  productImage: string;
  title: string;
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

// Using undefined as the default value is a robust pattern
export const CartContext = createContext<
  | {
      state: CartState;
      dispatch: React.Dispatch<CartAction>;
    }
  | undefined
>(undefined);

// Utility to calculate total
const calculateTotal = (items: CartItem[]) =>
  items.reduce((acc, item) => acc + item.price * item.quantity, 0);

// Reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "LOAD_CART":
      return action.state;

    case "ADD_TO_CART": {
      const exists = state.items.find((item) => item.id === action.product.id);
      let updatedItems: CartItem[];
      if (exists) {
        updatedItems = state.items.map((item) =>
          item.id === action.product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        updatedItems = [...state.items, { ...action.product, quantity: 1 }];
      }
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
        .filter((item) => item.quantity > 0); // <-- THE FIX IS HERE
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

const initialData = () => {
  // This function only runs on the client
  if (typeof window === "undefined") {
    return { items: [], total: 0 };
  }

  try {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      return JSON.parse(storedCart); // The stored state is our initial state
    }
  } catch (error) {
    console.error("Failed to parse cart from localStorage", error);
  }

  return { items: [], total: 0 }; // Default initial state if nothing is stored
};

// Provider
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, undefined, initialData);

  // Save to localStorage on change
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("cart", JSON.stringify(state));
      }
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [state]);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook with check for provider
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  const { dispatch, state } = context;
  return { dispatch, state };
};
