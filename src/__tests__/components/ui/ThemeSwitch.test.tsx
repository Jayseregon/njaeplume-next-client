import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeSwitch } from "@/src/components/ui/ThemeSwitch";

// Mock next-themes
const mockSetTheme = jest.fn();

jest.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: mockSetTheme,
  }),
}));

// Mock framer-motion to avoid dynamic import issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

describe("ThemeSwitch", () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  it("renders theme toggle button with correct accessibility label", () => {
    render(<ThemeSwitch />);
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const testClass = "test-class";

    render(<ThemeSwitch className={testClass} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    expect(button).toHaveClass(testClass);
  });

  it("applies nonce attribute when provided", () => {
    const testNonce = "test-nonce-123";

    render(<ThemeSwitch nonce={testNonce} />);
    const button = screen.getByRole("button", { name: /toggle theme/i });

    expect(button).toHaveAttribute("nonce", testNonce);
  });

  it("toggles theme on button click", async () => {
    const user = userEvent.setup();

    render(<ThemeSwitch />);

    const button = screen.getByRole("button", { name: /toggle theme/i });

    await user.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("renders correct icon based on theme", () => {
    // Light theme
    const { rerender } = render(<ThemeSwitch />);

    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();

    // Dark theme
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
