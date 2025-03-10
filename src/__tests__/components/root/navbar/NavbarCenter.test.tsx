import { render, screen } from "@testing-library/react";

import { NavbarCenter } from "@/components/root/navbar/NavbarCenter";
import { siteConfig } from "@/config/site";

// Mock Clerk authentication components
jest.mock("@clerk/nextjs", () => {
  // Default mock implementation
  const defaultMock = {
    useUser: () => ({ isSignedIn: false, user: null }),
    SignInButton: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sign-in-button">{children}</div>
    ),
    SignedIn: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="signed-in">{children}</div>
    ),
    SignedOut: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="signed-out">{children}</div>
    ),
    UserButton: () => <div data-testid="user-button">User Button</div>,
  };

  return defaultMock;
});

// Mock navigation menu components
jest.mock("@/components/ui/navigation-menu", () => ({
  NavigationMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="navigation-menu">{children}</div>
  ),
  NavigationMenuList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="navigation-menu-list">{children}</div>
  ),
  NavigationMenuItem: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="navigation-menu-item">{children}</div>
  ),
  NavigationMenuLink: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => (
    <div className={className} data-testid="navigation-menu-link">
      {children}
    </div>
  ),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a data-testid="next-link" href={href}>
      {children}
    </a>
  ),
}));

describe("NavbarCenter", () => {
  it("renders navigation menu with correct styling", () => {
    render(<NavbarCenter currentPath="/" />);

    expect(screen.getByTestId("navigation-menu")).toBeInTheDocument();
    const container = screen.getByTestId("navigation-menu").parentElement;

    expect(container).toHaveClass(
      "hidden",
      "md:flex",
      "flex-1",
      "justify-center",
    );
  });

  it("renders all navigation items from siteConfig", () => {
    render(<NavbarCenter currentPath="/" />);

    const items = screen.getAllByTestId("navigation-menu-item");

    expect(items).toHaveLength(siteConfig.navItems.length);

    siteConfig.navItems.forEach((item) => {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    });
  });

  it("highlights current path with correct styling", () => {
    // Use a valid path from siteConfig
    const currentPath = siteConfig.navItems[0].href;

    render(<NavbarCenter currentPath={currentPath} />);

    const links = screen.getAllByTestId("navigation-menu-link");

    // Find the link that matches the current path
    const currentLink = links.find((link) => {
      const nextLink = link.querySelector('[data-testid="next-link"]');

      return nextLink?.getAttribute("href") === currentPath;
    });

    expect(currentLink).toBeDefined();
    expect(currentLink?.className).toContain("text-primary");
    expect(currentLink?.className).toContain("font-medium");
  });

  it("applies hover styles to navigation links", () => {
    render(<NavbarCenter currentPath="/" />);

    const links = screen.getAllByTestId("navigation-menu-link");

    links.forEach((link) => {
      expect(link.className).toContain("hover:text-primary");
    });
  });

  it("renders navigation items with correct hrefs", () => {
    render(<NavbarCenter currentPath="/" />);

    const links = screen.getAllByTestId("next-link");

    siteConfig.navItems.forEach((item, index) => {
      expect(links[index]).toHaveAttribute("href", item.href);
    });
  });

  it("does not display castle nav item for non-authenticated users", () => {
    render(<NavbarCenter currentPath="/" />);

    // Count nav items - should only be the regular ones, no castle items
    const items = screen.getAllByTestId("navigation-menu-item");

    expect(items).toHaveLength(siteConfig.navItems.length);

    // Check castle item is not present
    const castleItem = siteConfig.castleNavItems.find(
      (item) => item.key === "castle",
    );

    if (castleItem) {
      expect(screen.queryByText(castleItem.label)).not.toBeInTheDocument();
    }
  });

  it("displays castle nav item for users with castleAdmin role", () => {
    // Mock the clerk auth to return a signed-in user with castleAdmin role
    jest.spyOn(require("@clerk/nextjs"), "useUser").mockReturnValue({
      isSignedIn: true,
      user: {
        publicMetadata: { role: "castleAdmin" },
      },
    });

    render(<NavbarCenter currentPath="/" />);

    // Count nav items - should include regular items plus castle item
    const items = screen.getAllByTestId("navigation-menu-item");
    const castleItem = siteConfig.castleNavItems.find(
      (item) => item.key === "castle",
    );

    if (castleItem) {
      expect(items).toHaveLength(siteConfig.navItems.length + 1);
      expect(screen.getByText(castleItem.label)).toBeInTheDocument();
    }

    // Clean up mock
    jest.restoreAllMocks();
  });

  it("does not display castle nav item for signed-in users without castleAdmin role", () => {
    // Mock the clerk auth to return a signed-in user without castleAdmin role
    jest.spyOn(require("@clerk/nextjs"), "useUser").mockReturnValue({
      isSignedIn: true,
      user: {
        publicMetadata: { role: "user" },
      },
    });

    render(<NavbarCenter currentPath="/" />);

    // Count nav items - should only be the regular ones, no castle items
    const items = screen.getAllByTestId("navigation-menu-item");

    expect(items).toHaveLength(siteConfig.navItems.length);

    const castleItem = siteConfig.castleNavItems.find(
      (item) => item.key === "castle",
    );

    if (castleItem) {
      expect(screen.queryByText(castleItem.label)).not.toBeInTheDocument();
    }

    // Clean up mock
    jest.restoreAllMocks();
  });
});
