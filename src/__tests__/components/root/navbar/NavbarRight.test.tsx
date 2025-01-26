import { render, screen } from "@testing-library/react";

import { NavbarRight } from "@/components/root/navbar/NavbarRight";

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

describe("NavbarRight", () => {
  const mockNonce = "test-nonce-123";

  it("renders all child components", () => {
    render(<NavbarRight nonce={mockNonce} />);

    expect(screen.getByTestId("search-input")).toBeInTheDocument();
    expect(screen.getByTestId("theme-switch")).toBeInTheDocument();
    expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();
  });

  it("passes nonce prop to all child components", () => {
    render(<NavbarRight nonce={mockNonce} />);

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
  });

  it("has correct responsive classes", () => {
    const { container } = render(<NavbarRight nonce={mockNonce} />);

    const wrapper = container.firstChild as HTMLElement;

    expect(wrapper).toHaveClass("hidden", "md:flex", "items-center", "gap-1");
  });

  it("renders in the correct order", () => {
    render(<NavbarRight nonce={mockNonce} />);

    const elements = screen.getAllByTestId(
      /search-input|theme-switch|locale-switcher/,
    );

    expect(elements[0]).toHaveAttribute("data-testid", "search-input");
    expect(elements[1]).toHaveAttribute("data-testid", "theme-switch");
    expect(elements[2]).toHaveAttribute("data-testid", "locale-switcher");
  });
});
