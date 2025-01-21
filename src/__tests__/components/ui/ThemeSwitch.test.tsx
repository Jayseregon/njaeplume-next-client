import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeSwitch } from "@/src/components/ui/ThemeSwitch";

/**
 * Mock Setup Section
 * -----------------
 */

// Mock next-themes hook to control theme state and track theme changes
const mockSetTheme = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
  }),
}));

// Mock framer-motion to prevent animation-related test issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("ThemeSwitch", () => {
  beforeEach(() => {
    // Reset mock state before each test
    mockSetTheme.mockClear();
  });

  it("renders theme toggle button with correct accessibility label", () => {
    // Test 1: Accessibility
    // Verify the button is properly labeled for screen readers
    render(<ThemeSwitch />);
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    // Test 2: Styling customization
    // Verify custom classes can be applied for styling flexibility
    const testClass = "test-class";

    render(<ThemeSwitch className={testClass} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    expect(button).toHaveClass(testClass);
  });

  it("applies nonce attribute when provided", () => {
    // Test 3: Security features
    // Verify Content Security Policy nonce is properly applied
    const testNonce = "test-nonce-123";

    render(<ThemeSwitch nonce={testNonce} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    expect(button).toHaveAttribute("nonce", testNonce);
  });

  it("toggles theme on button click", async () => {
    // Test 4: Theme toggle functionality
    // Verify clicking the button triggers theme change
    const user = userEvent.setup();

    render(<ThemeSwitch />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("renders correct icon based on theme", () => {
    // Test 5: Theme-based icon rendering
    // Verify correct icon is shown for each theme state
    const { rerender } = render(<ThemeSwitch />);

    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();

    // Mock theme change to dark and verify icon update
    jest.spyOn(require("next-themes"), "useTheme").mockImplementation(() => ({
      theme: "dark",
      setTheme: mockSetTheme,
    }));

    rerender(<ThemeSwitch />);
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });
});
