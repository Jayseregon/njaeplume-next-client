import { create } from "zustand";

import { Product } from "@/interfaces/Products";

interface ProductStore {
  selectedProduct: Product | null;
  isDialogOpen: boolean;
  setSelectedProduct: (product: Product | null) => void;
  openDialog: () => void;
  closeDialog: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  selectedProduct: null,
  isDialogOpen: false,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  openDialog: () => set({ isDialogOpen: true }),
  closeDialog: () => set({ isDialogOpen: false }),
}));
