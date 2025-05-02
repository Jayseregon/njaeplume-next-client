import { createCartStore, defaultInitState } from "@/stores/cartStore";
import { Product } from "@/interfaces/Products";

// Mock product for testing
const createMockProduct = (id: string): Product => ({
  id,
  name: `Test Product ${id}`,
  description: "Test description",
  price: 1000 + parseInt(id),
  category: "stickers",
  createdAt: new Date(),
  updatedAt: new Date(),
  zip_file_name: `test-${id}.zip`,
  slug: `test-product-${id}`,
  tags: [],
  images: [],
});

describe("Cart Store", () => {
  test("initializes with default state", () => {
    const store = createCartStore();
    const state = store.getState();

    expect(state.items).toEqual([]);
    expect(state.isOpen).toBe(false);
  });

  test("initializes with custom state", () => {
    const customState = {
      items: [createMockProduct("1")],
      isOpen: true,
    };

    const store = createCartStore(customState);
    const state = store.getState();

    expect(state.items).toEqual(customState.items);
    expect(state.isOpen).toBe(true);
  });

  test("adds item to cart", () => {
    const store = createCartStore();
    const product = createMockProduct("1");

    store.getState().addToCart(product);

    expect(store.getState().items).toEqual([product]);
  });

  test("prevents adding duplicate items", () => {
    const store = createCartStore();
    const product = createMockProduct("1");

    store.getState().addToCart(product);
    store.getState().addToCart(product);

    expect(store.getState().items).toHaveLength(1);
  });

  test("removes item from cart", () => {
    const product1 = createMockProduct("1");
    const product2 = createMockProduct("2");

    const store = createCartStore({
      ...defaultInitState,
      items: [product1, product2],
    });

    store.getState().removeFromCart(product1.id);

    expect(store.getState().items).toEqual([product2]);
  });

  test("clears all items from cart", () => {
    const store = createCartStore({
      ...defaultInitState,
      items: [createMockProduct("1"), createMockProduct("2")],
    });

    store.getState().clearCart();

    expect(store.getState().items).toEqual([]);
  });

  test("toggles cart open state", () => {
    const store = createCartStore();

    // Initial state is closed (false)
    expect(store.getState().isOpen).toBe(false);

    // Toggle to open
    store.getState().toggleCart();
    expect(store.getState().isOpen).toBe(true);

    // Toggle back to closed
    store.getState().toggleCart();
    expect(store.getState().isOpen).toBe(false);
  });

  test("sets cart open state directly", () => {
    const store = createCartStore();

    store.getState().setCartOpen(true);
    expect(store.getState().isOpen).toBe(true);

    store.getState().setCartOpen(false);
    expect(store.getState().isOpen).toBe(false);
  });

  test("calculates total price correctly", () => {
    const product1 = createMockProduct("1"); // price: 1001
    const product2 = createMockProduct("2"); // price: 1002

    const store = createCartStore({
      ...defaultInitState,
      items: [product1, product2],
    });

    const totalPrice = store.getState().getTotalPrice();

    expect(totalPrice).toBe(1001 + 1002);
  });

  test("returns zero total price when cart is empty", () => {
    const store = createCartStore();

    const totalPrice = store.getState().getTotalPrice();

    expect(totalPrice).toBe(0);
  });

  test("counts items correctly", () => {
    const store = createCartStore({
      ...defaultInitState,
      items: [
        createMockProduct("1"),
        createMockProduct("2"),
        createMockProduct("3"),
      ],
    });

    const itemCount = store.getState().getItemsCount();

    expect(itemCount).toBe(3);
  });

  test("returns zero item count when cart is empty", () => {
    const store = createCartStore();

    const itemCount = store.getState().getItemsCount();

    expect(itemCount).toBe(0);
  });

  test("state updates properly with actions", () => {
    const store = createCartStore();
    const product1 = createMockProduct("1");
    const product2 = createMockProduct("2");

    // Add items and check state
    store.getState().addToCart(product1);
    store.getState().addToCart(product2);
    expect(store.getState().items).toHaveLength(2);
    expect(store.getState().getItemsCount()).toBe(2);

    // Remove an item and check state
    store.getState().removeFromCart(product1.id);
    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().items[0].id).toBe(product2.id);

    // Toggle cart and check state
    store.getState().toggleCart();
    expect(store.getState().isOpen).toBe(true);

    // Clear cart and check state
    store.getState().clearCart();
    expect(store.getState().items).toHaveLength(0);
    expect(store.getState().getItemsCount()).toBe(0);
    expect(store.getState().getTotalPrice()).toBe(0);
  });
});
