import { act } from "@testing-library/react";

import { useProductStore } from "@/stores/productStore";
import { Product } from "@/interfaces/Products";
import { Category } from "@/generated/client";

// Create mock product for testing
const mockProduct: Product = {
  id: "prod_123",
  name: "Test Product",
  description: "A test product for store testing",
  price: 1999,
  category: Category.stickers,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
  zip_file_name: "test-product.zip",
  slug: "test-product",
  tags: [],
  images: [],
};

describe("Product Store", () => {
  // Clear store state between tests
  beforeEach(() => {
    act(() => {
      useProductStore.setState({
        selectedProduct: null,
        isDialogOpen: false,
      });
    });
  });

  test("should initialize with default values", () => {
    const state = useProductStore.getState();

    expect(state.selectedProduct).toBeNull();
    expect(state.isDialogOpen).toBe(false);
  });

  test("should set selected product", () => {
    act(() => {
      useProductStore.getState().setSelectedProduct(mockProduct);
    });

    const state = useProductStore.getState();

    expect(state.selectedProduct).toEqual(mockProduct);
  });

  test("should clear selected product", () => {
    // First set a product
    act(() => {
      useProductStore.getState().setSelectedProduct(mockProduct);
    });

    // Then clear it
    act(() => {
      useProductStore.getState().setSelectedProduct(null);
    });

    const state = useProductStore.getState();

    expect(state.selectedProduct).toBeNull();
  });

  test("should open dialog", () => {
    act(() => {
      useProductStore.getState().openDialog();
    });

    const state = useProductStore.getState();

    expect(state.isDialogOpen).toBe(true);
  });

  test("should close dialog", () => {
    // First open the dialog
    act(() => {
      useProductStore.getState().openDialog();
    });

    // Then close it
    act(() => {
      useProductStore.getState().closeDialog();
    });

    const state = useProductStore.getState();

    expect(state.isDialogOpen).toBe(false);
  });

  test("should handle a typical product selection workflow", () => {
    // Initial state
    const initialState = useProductStore.getState();

    expect(initialState.selectedProduct).toBeNull();
    expect(initialState.isDialogOpen).toBe(false);

    // Select a product
    act(() => {
      useProductStore.getState().setSelectedProduct(mockProduct);
    });

    // Open the dialog to show product details
    act(() => {
      useProductStore.getState().openDialog();
    });

    // Verify dialog is open with the right product
    const midState = useProductStore.getState();

    expect(midState.selectedProduct).toEqual(mockProduct);
    expect(midState.isDialogOpen).toBe(true);

    // User closes the dialog
    act(() => {
      useProductStore.getState().closeDialog();
    });

    // Verify dialog closed but product still selected
    const endState = useProductStore.getState();

    expect(endState.selectedProduct).toEqual(mockProduct);
    expect(endState.isDialogOpen).toBe(false);

    // User navigates away, product selection cleared
    act(() => {
      useProductStore.getState().setSelectedProduct(null);
    });

    // Verify cleared state
    const finalState = useProductStore.getState();

    expect(finalState.selectedProduct).toBeNull();
    expect(finalState.isDialogOpen).toBe(false);
  });

  test("should maintain product selection when toggling dialog", () => {
    // Set a product
    act(() => {
      useProductStore.getState().setSelectedProduct(mockProduct);
    });

    // Toggle dialog multiple times
    act(() => {
      useProductStore.getState().openDialog();
    });

    act(() => {
      useProductStore.getState().closeDialog();
    });

    act(() => {
      useProductStore.getState().openDialog();
    });

    // Verify product selection persists
    const state = useProductStore.getState();

    expect(state.selectedProduct).toEqual(mockProduct);
    expect(state.isDialogOpen).toBe(true);
  });

  test("state properties should be independent", () => {
    // Setting product shouldn't affect dialog state
    act(() => {
      useProductStore.getState().setSelectedProduct(mockProduct);
    });

    expect(useProductStore.getState().isDialogOpen).toBe(false);

    // Opening dialog shouldn't affect product selection
    act(() => {
      useProductStore.getState().setSelectedProduct(null);
      useProductStore.getState().openDialog();
    });

    const state = useProductStore.getState();

    expect(state.selectedProduct).toBeNull();
    expect(state.isDialogOpen).toBe(true);
  });
});
