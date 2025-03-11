import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import * as navigation from "next/navigation";

import {
  AdminSidebar,
  AdminSidebarProvider,
  AdminSidebarTrigger,
  useAdminSidebar,
} from "@/components/castle/AdminSidebar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock next/link to properly handle legacyBehavior
jest.mock("next/link", () => {
  const Link = ({ children, legacyBehavior, href, ...props }: any) => {
    if (legacyBehavior) {
      // If legacyBehavior is true, pass the href to children
      return React.cloneElement(React.Children.only(children), {
        href,
        ...props,
      });
    }

    // Otherwise render a normal link
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };

  return Link;
});

// Mock icons
jest.mock("lucide-react", () => ({
  Package: () => <div data-testid="icon-package">Package</div>,
  PanelLeftIcon: () => <div data-testid="icon-panel-left">PanelLeftIcon</div>,
  Users: () => <div data-testid="icon-users">Users</div>,
  Cat: () => <div data-testid="icon-cat">Cat</div>,
  PackagePlus: () => <div data-testid="icon-package-plus">PackagePlus</div>,
}));

// Mock the site config module
jest.mock("@/config/site", () => ({
  siteConfig: {
    name: "NJAE Plume",
    castleNavItems: [
      {
        key: "castle",
        label: "Castle",
        href: "/castle",
        icon: "Cat",
      },
      {
        key: "products",
        label: "Products",
        href: "/castle/products",
        icon: "Package",
      },
    ],
  },
  getCastleNavItemByKey: (key: string) =>
    [
      {
        key: "castle",
        label: "Castle",
        href: "/castle",
        icon: "Cat",
      },
      {
        key: "products",
        label: "Products",
        href: "/castle/products",
        icon: "Package",
      },
    ].find((item) => item.key === key),
}));

// Helper component to test the context
const TestComponent = () => {
  const { isCollapsed, toggleSidebar } = useAdminSidebar();

  return (
    <div>
      <span data-testid="collapsed-state">
        {isCollapsed ? "collapsed" : "expanded"}
      </span>
      <button data-testid="toggle-button" onClick={toggleSidebar}>
        Toggle
      </button>
    </div>
  );
};

describe("AdminSidebar Components", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default pathname
    jest.spyOn(navigation, "usePathname").mockReturnValue("/castle");
  });

  describe("AdminSidebarProvider", () => {
    it("provides context with default values", () => {
      render(
        <AdminSidebarProvider>
          <TestComponent />
        </AdminSidebarProvider>,
      );

      expect(screen.getByTestId("collapsed-state")).toHaveTextContent(
        "expanded",
      );
    });

    it("toggles sidebar state when toggleSidebar is called", () => {
      render(
        <AdminSidebarProvider>
          <TestComponent />
        </AdminSidebarProvider>,
      );

      // Initially expanded
      expect(screen.getByTestId("collapsed-state")).toHaveTextContent(
        "expanded",
      );

      // Click to collapse
      fireEvent.click(screen.getByTestId("toggle-button"));
      expect(screen.getByTestId("collapsed-state")).toHaveTextContent(
        "collapsed",
      );

      // Click to expand
      fireEvent.click(screen.getByTestId("toggle-button"));
      expect(screen.getByTestId("collapsed-state")).toHaveTextContent(
        "expanded",
      );
    });
  });

  describe("AdminSidebarTrigger", () => {
    it("renders a button with panel icon", () => {
      render(
        <AdminSidebarProvider>
          <AdminSidebarTrigger />
        </AdminSidebarProvider>,
      );

      const button = screen.getByRole("button");

      expect(button).toBeInTheDocument();
      expect(screen.getByTestId("icon-panel-left")).toBeInTheDocument();
    });

    it("toggles the sidebar when clicked", () => {
      render(
        <AdminSidebarProvider>
          <AdminSidebarTrigger />
          <TestComponent />
        </AdminSidebarProvider>,
      );

      // Initially expanded
      expect(screen.getByTestId("collapsed-state")).toHaveTextContent(
        "expanded",
      );

      // Click the trigger button - use button that contains the panel icon to be more specific
      const triggerButton = screen
        .getByTestId("icon-panel-left")
        .closest("button");

      fireEvent.click(triggerButton!);
      expect(screen.getByTestId("collapsed-state")).toHaveTextContent(
        "collapsed",
      );
    });
  });

  describe("AdminSidebar", () => {
    it("renders with nav items from site config", () => {
      render(
        <AdminSidebarProvider>
          <AdminSidebar />
        </AdminSidebarProvider>,
      );

      // Check that all menu items are rendered
      expect(screen.getByText("Castle")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();

      // Check icons are rendered
      expect(screen.getByTestId("icon-cat")).toBeInTheDocument();
      expect(screen.getByTestId("icon-package")).toBeInTheDocument();
    });

    it("highlights the current page in navigation", () => {
      jest.spyOn(navigation, "usePathname").mockReturnValue("/castle");

      render(
        <AdminSidebarProvider>
          <AdminSidebar />
        </AdminSidebarProvider>,
      );

      // The Castle link should have the active class (contains bg-primary)
      const castleLink = screen.getByText("Castle").closest("a");
      const productsLink = screen.getByText("Products").closest("a");

      expect(castleLink?.className).toContain("bg-primary");
      expect(productsLink?.className).not.toContain("bg-primary");
    });

    it("renders in collapsed state when context is collapsed", () => {
      const { container } = render(
        <AdminSidebarProvider>
          <AdminSidebar />
          <TestComponent />
        </AdminSidebarProvider>,
      );

      // Initially expanded, shows text labels
      expect(screen.getByText("Castle")).toBeInTheDocument();

      // Collapse the sidebar
      fireEvent.click(screen.getByTestId("toggle-button"));

      // In collapsed state, icons should still be visible
      expect(screen.getByTestId("icon-cat")).toBeInTheDocument();

      // The sidebar width should be reduced - get the root div of AdminSidebar
      const sidebar = container.querySelector(
        'div[class*="border-r bg-background"]',
      );

      expect(sidebar).toHaveClass("w-16");
    });

    it("renders in expanded state when context is expanded", () => {
      const { container } = render(
        <AdminSidebarProvider>
          <AdminSidebar />
        </AdminSidebarProvider>,
      );

      // In expanded state, the sidebar should have more width
      const sidebar = container.querySelector(
        'div[class*="border-r bg-background"]',
      );

      expect(sidebar).toHaveClass("w-64");

      // Text labels should be visible
      expect(screen.getByText("Castle")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
    });
  });
});
