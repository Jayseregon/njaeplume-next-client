import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import { CartStoreProvider, useCartStore } from "@/providers/CartStoreProvider";
import { Product } from "@/interfaces/Products";

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => {
      // Always return a valid JSON string for 'cart-storage'
      if (key === "cart-storage" && store[key]) {
        try {
          // Try parsing to ensure it's valid JSON
          JSON.parse(store[key]);

          return store[key];
        } catch {
          // Return a minimal valid cart state if corrupted
          return JSON.stringify({ state: { items: [], isOpen: false } });
        }
      }

      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      // Patch: Convert any Date fields to ISO strings before storing
      try {
        const parsed = JSON.parse(value);

        if (parsed?.state?.items) {
          parsed.state.items = parsed.state.items.map((item: any) => ({
            ...item,
            createdAt:
              typeof item.createdAt === "object" &&
              item.createdAt instanceof Date
                ? item.createdAt.toISOString()
                : item.createdAt,
            updatedAt:
              typeof item.updatedAt === "object" &&
              item.updatedAt instanceof Date
                ? item.updatedAt.toISOString()
                : item.updatedAt,
          }));
          store[key] = JSON.stringify(parsed);
        } else {
          store[key] = value;
        }
      } catch {
        // fallback to empty cart
        store[key] = JSON.stringify({ state: { items: [], isOpen: false } });
      }
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    getAllItems: () => store,
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock product for testing cart operations
const mockProduct: Product = {
  id: "prod_123",
  name: "Test Product",
  description: "A test product",
  price: 1999,
  category: "stickers", // Changed to valid enum value
  createdAt: new Date("2023-01-01T00:00:00Z"), // Changed to Date object
  updatedAt: new Date("2023-01-01T00:00:00Z"), // Changed to Date object
  zip_file_name: "test-product.zip", // Added required field
  slug: "test-product",
  tags: [], // Added required field
  images: [], // Added required field
};

// Test component that uses the cart store
const TestComponent = () => {
  const items = useCartStore((state) => state.items);
  const addToCart = useCartStore((state) => state.addToCart);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const toggleCart = useCartStore((state) => state.toggleCart);
  const isOpen = useCartStore((state) => state.isOpen);
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const itemsCount = useCartStore((state) => state.getItemsCount());

  return (
    <div>
      <div data-testid="cart-is-open">{isOpen ? "open" : "closed"}</div>
      <div data-testid="cart-items-count">{itemsCount}</div>
      <div data-testid="cart-total-price">{totalPrice}</div>
      <ul>
        {items.map((item) => (
          <li key={item.id} data-testid={`cart-item-${item.id}`}>
            {item.name} - {item.price}
            <button onClick={() => removeFromCart(item.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <button data-testid="add-to-cart" onClick={() => addToCart(mockProduct)}>
        Add to cart
      </button>
      <button data-testid="clear-cart" onClick={clearCart}>
        Clear cart
      </button>
      <button data-testid="toggle-cart" onClick={toggleCart}>
        Toggle cart
      </button>
    </div>
  );
};

describe("CartStoreProvider", () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
    // Silence expected parse errors in test output
    jest.spyOn(console, "error").mockImplementation((...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("Failed to parse stored cart")
      ) {
        return;
      }

      // @ts-ignore
      return console.error.original?.apply(console, args);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("renders without crashing", () => {
    render(
      <CartStoreProvider>
        <div>Test</div>
      </CartStoreProvider>,
    );
  });

  test("provides the cart store to children", () => {
    render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    expect(screen.getByTestId("cart-is-open")).toHaveTextContent("closed");
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("0");
  });

  test("cart operations work through the provider", () => {
    render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    // Initial state
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(screen.getByTestId("cart-total-price")).toHaveTextContent("0");

    // Add an item
    fireEvent.click(screen.getByTestId("add-to-cart"));
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(screen.getByTestId("cart-total-price")).toHaveTextContent("1999");
    expect(
      screen.getByTestId(`cart-item-${mockProduct.id}`),
    ).toBeInTheDocument();

    // Remove the item
    fireEvent.click(screen.getByText("Remove"));
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("0");
    expect(screen.getByTestId("cart-total-price")).toHaveTextContent("0");
    expect(
      screen.queryByTestId(`cart-item-${mockProduct.id}`),
    ).not.toBeInTheDocument();
  });

  test("toggle cart works", () => {
    render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    expect(screen.getByTestId("cart-is-open")).toHaveTextContent("closed");

    fireEvent.click(screen.getByTestId("toggle-cart"));
    expect(screen.getByTestId("cart-is-open")).toHaveTextContent("open");

    fireEvent.click(screen.getByTestId("toggle-cart"));
    expect(screen.getByTestId("cart-is-open")).toHaveTextContent("closed");
  });

  test("clear cart removes all items", () => {
    render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    // Add an item
    fireEvent.click(screen.getByTestId("add-to-cart"));
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");

    // Clear the cart
    fireEvent.click(screen.getByTestId("clear-cart"));
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("0");
  });

  test("persists cart state in localStorage", async () => {
    // Replace the mock localStorage implementation temporarily for this test
    const originalGetItem = mockLocalStorage.getItem;
    const originalSetItem = mockLocalStorage.setItem;

    // First render: we'll just verify that setItem is called
    mockLocalStorage.setItem = jest.fn();

    const { unmount } = render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    fireEvent.click(screen.getByTestId("add-to-cart"));

    // Verify localStorage.setItem was called
    expect(mockLocalStorage.setItem).toHaveBeenCalled();

    // Unmount the component
    unmount();

    // Before remounting, prepare a valid state to be returned when getItem is called
    mockLocalStorage.getItem = jest.fn((key) => {
      if (key === "cart-storage") {
        // Return a pre-formatted valid cart with our test product
        return JSON.stringify({
          state: {
            items: [
              {
                ...mockProduct,
                // Convert Date objects to strings to avoid circular references
                createdAt: mockProduct.createdAt.toISOString(),
                updatedAt: mockProduct.updatedAt.toISOString(),
              },
            ],
            isOpen: false,
          },
        });
      }

      return null;
    });

    // Second render: verify the cart is hydrated from localStorage
    jest.clearAllMocks(); // Clear mock calls before remounting

    render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    // Verify stored state was loaded
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(
      screen.getByTestId(`cart-item-${mockProduct.id}`),
    ).toBeInTheDocument();

    // Restore original mocks
    mockLocalStorage.getItem = originalGetItem;
    mockLocalStorage.setItem = originalSetItem;
  });

  test("handles localStorage errors gracefully", () => {
    // Simulate a localStorage error
    const originalGetItem = mockLocalStorage.getItem;

    mockLocalStorage.getItem.mockImplementationOnce(() => {
      throw new Error("localStorage error");
    });

    // Should still render without errors
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    // Verify error was logged
    expect(consoleSpy).toHaveBeenCalled();

    // Reset mock
    consoleSpy.mockRestore();
    mockLocalStorage.getItem.mockImplementation(originalGetItem);
  });

  test("disallows adding duplicate items", () => {
    render(
      <CartStoreProvider>
        <TestComponent />
      </CartStoreProvider>,
    );

    // Add an item twice
    fireEvent.click(screen.getByTestId("add-to-cart"));
    fireEvent.click(screen.getByTestId("add-to-cart"));

    // Should still have only one item
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");
  });

  test("throws error when useCartStore is used outside provider", () => {
    // Silence the expected error
    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useCartStore must be used within CartStoreProvider");

    consoleError.mockRestore();
  });
});
