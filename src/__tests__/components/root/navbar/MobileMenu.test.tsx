import { render, screen } from "@testing-library/react";

import { MobileMenu } from "@/components/root/navbar/MobileMenu";
import { siteConfig } from "@/config/site";

// Mock Lucide icon
jest.mock("lucide-react", () => ({
  Menu: () => <div data-testid="menu-icon">Menu Icon</div>,
}));

// Mock UI components
jest.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children, open, onOpenChange }: any) => (
    <div
      data-open={open}
      data-testid="sheet"
      role="button"
      tabIndex={0}
      onClick={() => onOpenChange?.(!open)}
      onKeyDown={(e) => e.key === "Enter" && onOpenChange?.(!open)}
    >
      {children}
    </div>
  ),
  SheetContent: ({ children }: any) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: any) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: any) => (
    <div data-testid="sheet-title">{children}</div>
  ),
  SheetTrigger: ({ children }: any) => (
    <button data-testid="sheet-trigger">{children}</button>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="mobile-menu-button" {...props}>
      {children}
    </button>
  ),
}));

// Mock the child components with proper prop handling
jest.mock("@/components/root/SearchInput", () => ({
  SearchInput: ({
    nonce,
    alwaysExpanded,
  }: {
    nonce: string;
    alwaysExpanded: boolean;
  }) => (
    <div
      data-always-expanded={alwaysExpanded.toString()}
      data-nonce={nonce}
      data-testid="search-input"
    >
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

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, onClick, className }: any) => (
    <a
      className={className}
      data-testid="nav-link"
      href={href}
      onClick={onClick}
    >
      {children}
    </a>
  ),
}));

describe("MobileMenu", () => {
  const mockProps = {
    currentPath: siteConfig.navItems[0].href, // Use an actual path from config
    nonce: "test-nonce-123",
  };

  it("renders mobile menu trigger button", () => {
    render(<MobileMenu {...mockProps} />);

    expect(screen.getByTestId("mobile-menu-button")).toBeInTheDocument();
    expect(screen.getByTestId("menu-icon")).toBeInTheDocument();
  });

  it("has correct mobile-only classes", () => {
    const { container } = render(<MobileMenu {...mockProps} />);

    const mobileContainer = container.firstChild as HTMLElement;

    expect(mobileContainer).toHaveClass("md:hidden", "ml-auto");
  });

  it("renders all navigation items from siteConfig", () => {
    render(<MobileMenu {...mockProps} />);

    const navLinks = screen.getAllByTestId("nav-link");

    expect(navLinks).toHaveLength(siteConfig.navItems.length);

    siteConfig.navItems.forEach((item, index) => {
      expect(navLinks[index]).toHaveAttribute("href", item.href);
      expect(navLinks[index]).toHaveTextContent(item.label);
    });
  });

  it("highlights current path with correct styling", () => {
    render(<MobileMenu {...mockProps} />);

    const links = screen.getAllByTestId("nav-link");

    // Find the active link
    const currentLink = links.find(
      (link) => link.getAttribute("href") === mockProps.currentPath,
    );

    expect(currentLink).toBeDefined();
    expect(currentLink?.className).toContain("text-primary");
    expect(currentLink?.className).toContain("font-medium");

    // Verify other links don't have the active classes
    links
      .filter((link) => link.getAttribute("href") !== mockProps.currentPath)
      .forEach((link) => {
        expect(link.className).not.toContain("text-primary font-medium");
      });
  });

  it("renders search input with correct props", () => {
    render(<MobileMenu {...mockProps} />);

    const searchInput = screen.getByTestId("search-input");

    expect(searchInput).toHaveAttribute("data-always-expanded", "true");
    expect(searchInput).toHaveAttribute("data-nonce", mockProps.nonce);
  });

  it("renders theme switch and locale switcher", () => {
    render(<MobileMenu {...mockProps} />);

    expect(screen.getByTestId("theme-switch")).toBeInTheDocument();
    expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();
  });

  it("passes nonce to child components", () => {
    render(<MobileMenu {...mockProps} />);

    expect(screen.getByTestId("search-input")).toHaveAttribute(
      "data-nonce",
      mockProps.nonce,
    );
    expect(screen.getByTestId("theme-switch")).toHaveAttribute(
      "data-nonce",
      mockProps.nonce,
    );
    expect(screen.getByTestId("locale-switcher")).toHaveAttribute(
      "data-nonce",
      mockProps.nonce,
    );
  });
});
