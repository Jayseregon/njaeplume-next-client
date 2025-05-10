import { render, screen } from "@testing-library/react";

import { NavbarRight } from "@/components/root/navbar/NavbarRight";
import { CartStoreProvider } from "@/providers/CartStoreProvider"; // Import the provider

// Mock the child components
jest.mock("@/components/root/SearchInput", () => ({
  SearchInput: ({ nonce }: { nonce: string }) => (
    <div data-nonce={nonce} data-testid="search-input">
      Search Input
    </div>
  ),
}));

jest.mock("@/components/root/ThemeSwitch", () => ({
  ThemeSwitch: ({ nonce }: { nonce: string }) => (
    <div data-nonce={nonce} data-testid="theme-switch">
      Theme Switch
    </div>
  ),
}));

jest.mock("@/components/root/LocaleSwitcher", () => ({
  __esModule: true,
  default: ({ nonce }: { nonce: string }) => (
    <div data-nonce={nonce} data-testid="locale-switcher">
      Locale Switcher
    </div>
  ),
}));

// Mock UserLogin component
jest.mock("@/components/root/UserLogin", () => ({
  UserLogin: ({ nonce }: { nonce: string }) => (
    <div data-nonce={nonce} data-testid="user-login">
      User Login
    </div>
  ),
}));

// Mock CartButton component
jest.mock("@/components/cart/CartButton", () => ({
  CartButton: ({ nonce }: { nonce?: string }) => (
    <div data-nonce={nonce} data-testid="cart-button">
      Cart Button
    </div>
  ),
}));

// Mock CartDrawer component
jest.mock("@/components/cart/CartDrawer", () => ({
  CartDrawer: () => <div data-testid="cart-drawer">Cart Drawer</div>,
}));

describe("NavbarRight", () => {
  const mockNonce = "test-nonce-123";

  // Helper function to render with provider
  const renderWithProvider = (ui: React.ReactElement) => {
    return render(<CartStoreProvider>{ui}</CartStoreProvider>);
  };

  it("renders all child components", () => {
    renderWithProvider(<NavbarRight nonce={mockNonce} />);

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("theme-switch")).toBeInTheDocument();
    expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("cart-button")).toBeInTheDocument(); // Check for cart button
    expect(screen.getByTestId("user-login")).toBeInTheDocument();
    expect(screen.getByTestId("cart-drawer")).toBeInTheDocument(); // Check for cart drawer
  });

  it("passes nonce prop to all child components", () => {
    renderWithProvider(<NavbarRight nonce={mockNonce} />);

    expect(screen.getByTestId("search-input")).toHaveAttribute(
      "data-nonce",
      mockNonce,
    );
    expect(screen.getByTestId("theme-switch")).toHaveAttribute(
      "data-nonce",
      mockNonce,
    );
    expect(screen.getByTestId("locale-switcher")).toHaveAttribute(
      "data-nonce",
      mockNonce,
    );
    expect(screen.getByTestId("cart-button")).toHaveAttribute(
      "data-nonce",
      mockNonce,
    );
    expect(screen.getByTestId("user-login")).toHaveAttribute(
      "data-nonce",
      mockNonce,
    );
  });

  it("has correct responsive classes", () => {
    const { container } = renderWithProvider(<NavbarRight nonce={mockNonce} />);

    // The wrapper is now a Fragment (<>), so we check the div inside
    const divWrapper = container.querySelector("div");

    expect(divWrapper).toHaveClass(
      "hidden",
      "md:flex",
      "items-center",
      "gap-1",
      "pr-2",
    );
  });

  it("renders in the correct order", () => {
    renderWithProvider(<NavbarRight nonce={mockNonce} />);

    // Query within the specific div container for NavbarRight items
    const container = screen.getByTestId("search-input").parentElement;
    const elements = Array.from(container?.children || []).map(
      (el) => el.getAttribute("data-testid") || el.nodeName.toLowerCase(),
    );

    // Expected order within the div
    expect(elements).toEqual([
      "search-input",
      "theme-switch",
      "locale-switcher",
      "cart-button",
      "user-login",
    ]);

    // Check CartDrawer is rendered outside the main div
    expect(screen.getByTestId("cart-drawer")).toBeInTheDocument();
  });
});
