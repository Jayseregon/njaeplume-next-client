import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";

import Navbar from "@/src/components/ui/Navbar";
import { siteConfig } from "@/config/site";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt="" />;
  },
}));

// Mock NonceContext
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
      (usePathname as jest.Mock).mockReturnValue("/");
    });

    it("renders minimal navbar on homepage", () => {
      renderWithProviders(<Navbar />);

      // Should only show theme switch and locale switcher
      expect(screen.queryByText(siteConfig.name)).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /toggle theme/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("EN")).toBeInTheDocument();
    });
  });

  describe("Regular pages Navbar", () => {
    beforeEach(() => {
      (usePathname as jest.Mock).mockReturnValue("/some-page");
    });

    it("renders full navbar with brand and navigation", () => {
      renderWithProviders(<Navbar />);

      // Check for brand elements
      expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: new RegExp(siteConfig.name, "i") }),
      ).toBeInTheDocument();

      // Check for nav items (using getAllByText to handle duplicates in mobile menu)
      siteConfig.navItems.forEach((item) => {
        const elements = screen.getAllByText(item.label);

        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it("renders search input", () => {
      renderWithProviders(<Navbar />);
      expect(screen.getByRole("searchbox")).toBeInTheDocument();
    });

    it("renders theme switch and locale switcher", () => {
      renderWithProviders(<Navbar />);
      expect(
        screen.getByRole("button", { name: /toggle theme/i }),
      ).toBeInTheDocument();
      // Update locale switcher test to match actual implementation
      const localeSwitcher = screen.getByText("EN");

      expect(localeSwitcher).toBeInTheDocument();
    });

    it("toggles mobile menu when menu button is clicked", async () => {
      const user = userEvent.setup();

      renderWithProviders(<Navbar />);

      const menuButton = screen.getByRole("button", { name: /open menu/i });

      await user.click(menuButton);

      // After clicking, menu should be open and button text should change
      expect(
        screen.getByRole("button", { name: /close menu/i }),
      ).toBeInTheDocument();

      // Check if mobile menu items are visible
      siteConfig.navItems.forEach((item) => {
        expect(screen.getAllByText(item.label).length).toBeGreaterThan(0);
      });
    });

    it("applies nonce to all relevant elements", () => {
      renderWithProviders(<Navbar />);

      // Check if nonce is applied to main elements
      const nonceElements = document.querySelectorAll("[nonce='test-nonce']");

      expect(nonceElements.length).toBeGreaterThan(0);
    });
  });
});
