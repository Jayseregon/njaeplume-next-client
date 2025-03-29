import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Product } from "@/interfaces/Products";

interface CartState {
  items: Product[];
  isOpen: boolean;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotalPrice: () => number;
  getItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addToCart: (product) =>
        set((state) => {
          if (state.items.find((item) => item.id === product.id)) return state;

          return { items: [...state.items, product] };
        }),
      removeFromCart: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      clearCart: () => set({ items: [] }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open) => set({ isOpen: open }),
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.price, 0);
      },
      getItemsCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
