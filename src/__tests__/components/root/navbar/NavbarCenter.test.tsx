import { render, screen } from "@testing-library/react";

import { NavbarCenter } from "@/components/root/navbar/NavbarCenter";
import { siteConfig } from "@/config/site";

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
});
