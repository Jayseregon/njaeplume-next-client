import { createStore } from "zustand/vanilla";

import { Product } from "@/interfaces/Products";

export interface CartState {
  items: Product[];
  isOpen: boolean;
}

export interface CartActions {
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  getTotalPrice: () => number;
  getItemsCount: () => number;
}

export type CartStore = CartState & CartActions;

export const defaultInitState: CartState = {
  items: [],
  isOpen: false,
};

export const createCartStore = (initState: CartState = defaultInitState) => {
  return createStore<CartStore>()((set, get) => ({
    ...initState,
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
  }));
};
