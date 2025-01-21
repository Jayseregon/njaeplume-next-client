import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";

import Navbar from "@/src/components/ui/Navbar";
import { siteConfig } from "@/config/site";

/**
 * Mock Setup Section
 * -----------------
 */

// Mock next/navigation to control pathname for testing different routes
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock translations object to simulate next-intl behavior
const mockTranslations: { [key: string]: string } = {
  "Portfolio.h1_title": "Portfolio",
  "Contact.title": "Contact Us",
};

// Update next-intl mock to use mockTranslations
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => mockTranslations[key] || key,
  useLocale: () => "en",
}));

// Mock next/image to avoid issues with Next.js image optimization in tests
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt="" />;
  },
}));

// Mock NonceContext to provide a consistent nonce value for CSP testing
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: () => "test-nonce",
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Search: () => <div data-testid="search-icon">Search</div>,
  Moon: () => <div data-testid="moon-icon">Moon</div>,
  Sun: () => <div data-testid="sun-icon">Sun</div>,
}));

// Mock icons
jest.mock("@/components/icons", () => ({
  Logo: () => <div data-testid="mock-logo">Logo</div>,
  SearchIcon: () => <div data-testid="mock-search-icon">Search</div>,
  SunIcon: (props: any) => (
    <div data-testid="mock-sun-icon" {...props}>
      Sun
    </div>
  ),
  MoonIcon: (props: any) => (
    <div data-testid="mock-moon-icon" {...props}>
      Moon
    </div>
  ),
}));

// Create test wrapper with required providers
const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui);
};

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Homepage Navbar", () => {
    beforeEach(() => {
      // Set pathname to root to test homepage-specific navbar
      (usePathname as jest.Mock).mockReturnValue("/");
    });

    it("renders minimal navbar on homepage", () => {
      renderWithProviders(<Navbar />);

      // Homepage should only show essential elements:
      // 1. No brand/logo
      // 2. Only theme switcher
      // 3. Only locale switcher
      expect(screen.queryByText(siteConfig.name)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /toggle theme/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("EN")).toBeInTheDocument();
    });
  });

  describe("Regular pages Navbar", () => {
    beforeEach(() => {
      // Set pathname to non-root to test regular page navbar
      (usePathname as jest.Mock).mockReturnValue("/some-page");
    });

    it("renders full navbar with brand and navigation", () => {
      renderWithProviders(<Navbar />);

      // Test 1: Brand section visibility
      // Verify logo and site name are present
      expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: new RegExp(siteConfig.name, "i") }),
      ).toBeInTheDocument();

      // Test 2: Navigation items
      // Verify all configured nav items are present
      // getAllByText used because items appear in both desktop and mobile menus
      siteConfig.navItems.forEach((item) => {
        const elements = screen.getAllByText(item.label);

        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it("renders search input", () => {
      renderWithProviders(<Navbar />);
      // Verify search functionality is available
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("renders theme switch and locale switcher", () => {
      renderWithProviders(<Navbar />);
      // Verify theme switching and language selection features
      expect(
        screen.getByRole("button", { name: /toggle theme/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("EN")).toBeInTheDocument();
    });

    it("toggles mobile menu when menu button is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(<Navbar />);

      // Test mobile menu interaction
      // 1. Find and click the menu toggle
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      await user.click(menuButton);

      // 2. Verify menu state changed
      expect(
        screen.getByRole("button", { name: /close menu/i }),
      ).toBeInTheDocument();

      // 3. Verify all navigation items are visible in mobile menu
      siteConfig.navItems.forEach((item) => {
        expect(screen.getAllByText(item.label).length).toBeGreaterThan(0);
      });
    });

    it("applies nonce to all relevant elements", () => {
      renderWithProviders(<Navbar />);
      // Verify Content Security Policy nonce is properly applied
      const nonceElements = document.querySelectorAll("[nonce='test-nonce']");

      expect(nonceElements.length).toBeGreaterThan(0);
    });
  });

  describe("Navigation and Content Tests", () => {
    beforeEach(() => {
      (usePathname as jest.Mock).mockReturnValue("/some-page");
    });

    it("displays correct site information from siteConfig", () => {
      renderWithProviders(<Navbar />);

      // Test site name display
      expect(screen.getByText(siteConfig.name)).toBeInTheDocument();

      // Verify logo links to homepage
      const homeLink = screen.getByRole("link", {
        name: new RegExp(siteConfig.name, "i"),
      });

      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("renders all navigation items with correct href attributes", () => {
      renderWithProviders(<Navbar />);

      siteConfig.navItems.forEach((item) => {
        // Check both desktop and mobile menu links
        const links = screen.getAllByText(item.label);

        links.forEach((link) => {
          const closestLink = link.closest("a");

          expect(closestLink).toHaveAttribute("href", item.href);
        });
      });
    });

    it("highlights current navigation item based on pathname", async () => {
      // Mock pathname to match a nav item
      (usePathname as jest.Mock).mockReturnValue("/portfolio");

      renderWithProviders(<Navbar />);

      // Find links with the portfolio text
      const portfolioLinks = screen.getAllByText("Portfolio");

      // In the desktop menu, find the link that's styled as active
      const desktopLink = portfolioLinks.find((link) => {
        const anchor = link.closest("a");

        // Check for any active state indicators in the class
        return (
          anchor?.className.includes("text-primary") ||
          anchor?.className.includes("font-medium")
        );
      });

      expect(desktopLink).toBeTruthy();
    });

    it("maintains consistent navigation structure between desktop and mobile views", () => {
      renderWithProviders(<Navbar />);

      // Get all nav items from desktop menu
      const desktopItems = siteConfig.navItems.map((item) => item.label);

      // Get all nav items from mobile menu
      const mobileMenuItems = screen.getAllByText((content, _) =>
        desktopItems.includes(content),
      );

      // Verify each item appears at least twice (desktop + mobile menu)
      desktopItems.forEach((item) => {
        const instances = mobileMenuItems.filter(
          (element) => element.textContent === item,
        );

        expect(instances.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("handles search input visibility correctly in desktop and mobile views", async () => {
      const user = userEvent.setup();

      renderWithProviders(<Navbar />);

      // Check desktop search
      const desktopSearch = screen.getByRole("searchbox");

      expect(desktopSearch).toBeInTheDocument();

      // Open mobile menu
      const menuButton = screen.getByRole("button", { name: /open menu/i });

      await user.click(menuButton);

      // Wait for any potential animations or state updates
      // Check if at least one search input exists
      const searchInputs = screen.getAllByRole("searchbox");

      expect(searchInputs.length).toBeGreaterThanOrEqual(1);

      // If your design shows only one search input at a time, update the test:
      // expect(searchInputs.length).toBe(1);
    });
  });
});
