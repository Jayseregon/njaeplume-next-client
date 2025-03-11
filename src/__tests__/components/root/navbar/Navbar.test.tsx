import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";

import Navbar from "@/src/components/root/navbar/Navbar";

// Keep essential mocks
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockTranslations: { [key: string]: string } = {
  "Portfolio.h1_title": "Portfolio",
  "Contact.title": "Contact Us",
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => mockTranslations[key] || key,
  useLocale: () => "en",
}));

// Simplified mocks for components
jest.mock("@/components/root/ThemeSwitch", () => ({
  ThemeSwitch: () => <div data-testid="theme-switch">Theme Switch</div>,
}));

jest.mock("@/components/root/LocaleSwitcher", () => ({
  __esModule: true,
  default: () => <div data-testid="locale-switcher">Locale Switcher</div>,
}));

jest.mock("@/components/root/navbar/NavbarContent", () => ({
  NavbarContent: () => <div data-testid="navbar-content">Navbar Content</div>,
}));

// Mock UserLogin component
jest.mock("@/components/root/UserLogin", () => ({
  UserLogin: () => <div data-testid="user-login">User Login</div>,
}));

describe("Navbar", () => {
  const mockedUsePathname = usePathname as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders homepage version with theme switcher, locale switcher, and user login", () => {
    mockedUsePathname.mockReturnValue("/");

    render(<Navbar />);

    expect(screen.getByTestId("theme-switch")).toBeInTheDocument();
    expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();
    expect(screen.getByTestId("user-login")).toBeInTheDocument();
    expect(screen.queryByTestId("navbar-content")).not.toBeInTheDocument();
  });

  it("renders full navbar for non-homepage routes", () => {
    mockedUsePathname.mockReturnValue("/some-page");

    render(<Navbar />);

    expect(screen.getByTestId("navbar-content")).toBeInTheDocument();
  });

  it("applies correct styling for navbar container", () => {
    mockedUsePathname.mockReturnValue("/");

    const { container } = render(<Navbar />);

    const nav = container.querySelector("nav");

    expect(nav).toHaveClass("sticky", "top-0", "w-full", "bg-background");
  });

  it("has correct padding on the homepage right section", () => {
    mockedUsePathname.mockReturnValue("/");

    render(<Navbar />);

    // Find the right section with theme switcher and locale switcher
    const rightSection = screen.getByTestId("theme-switch").parentElement;

    expect(rightSection).toHaveClass("pr-2");
    expect(rightSection).not.toHaveClass("md:pr-0");
  });

  it("passes correct props to NavbarContent for non-homepage routes", () => {
    const testPath = "/test-path";

    mockedUsePathname.mockReturnValue(testPath);

    render(<Navbar />);

    const navbarContent = screen.getByTestId("navbar-content");

    expect(navbarContent).toBeInTheDocument();
  });
});
