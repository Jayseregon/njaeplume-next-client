"use client";

import { createContext, useContext, useRef, type ReactNode, useEffect } from "react";
import { useStore } from "zustand";

import { type CartStore, createCartStore } from "@/stores/cartStore";

export type CartStoreApi = ReturnType<typeof createCartStore>;

export const CartStoreContext = createContext<CartStoreApi | undefined>(
  undefined,
);

export interface CartStoreProviderProps {
  children: ReactNode;
}

// Initialize from localStorage if available (client-side only)
const getInitialState = () => {
  if (typeof window !== "undefined") {
    try {
      const savedCart = localStorage.getItem("cart-storage");

      if (savedCart) {
        const parsed = JSON.parse(savedCart);

        if (parsed.state) {
          return parsed.state;
        }
      }
    } catch (error) {
      console.error("Failed to parse stored cart", error);
    }
  }

  return undefined;
};

export const CartStoreProvider = ({ children }: CartStoreProviderProps) => {
  const storeRef = useRef<CartStoreApi | null>(null);

  if (storeRef.current === null) {
    storeRef.current = createCartStore(getInitialState());
  }

  // Save to localStorage whenever store changes
  useEffect(() => {
    if (storeRef.current) {
      const unsubscribe = storeRef.current.subscribe((state) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("cart-storage", JSON.stringify({ state }));
        }
      });

      return () => unsubscribe();
    }
  }, []);

  return (
    <CartStoreContext.Provider value={storeRef.current}>
      {children}
    </CartStoreContext.Provider>
  );
};

export const useCartStore = <T,>(selector: (store: CartStore) => T): T => {
  const cartStoreContext = useContext(CartStoreContext);

  if (!cartStoreContext) {
    throw new Error(`useCartStore must be used within CartStoreProvider`);
  }

  return useStore(cartStoreContext, selector);
};
