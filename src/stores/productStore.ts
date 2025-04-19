import { create } from "zustand";

import { Product } from "@/interfaces/Products";

// Separate state interface for better type safety
interface ProductState {
  selectedProduct: Product | null;
  isDialogOpen: boolean;
}

// Separate actions interface
interface ProductActions {
  setSelectedProduct: (product: Product | null) => void;
  openDialog: () => void;
  closeDialog: () => void;
}

// Combined type
type ProductStore = ProductState & ProductActions;

// Create the store with organized structure
export const useProductStore = create<ProductStore>((set) => ({
  // State
  selectedProduct: null,
  isDialogOpen: false,

  // Actions
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false }),
}));
