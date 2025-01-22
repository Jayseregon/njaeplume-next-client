import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import LocaleSwitcher from "@/src/components/root/LocaleSwitcher";

/**
 * Mock Setup Section
 * -----------------
 */

// Mock next-intl hook to control locale state
const mockLocale = "en";

jest.mock("next-intl", () => ({
  useLocale: () => mockLocale,
}));

// Mock framer-motion to prevent animation-related issues
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock localStorage
const mockSetItem = jest.spyOn(Storage.prototype, "setItem");

// Mock document.cookie
Object.defineProperty(document, "cookie", {
  writable: true,
  value: "",
});

// Mock setUserLocale function
jest.mock("@/lib/locale", () => ({
  setUserLocale: jest.fn(),
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mockSetItem.mockClear();
    document.cookie = "";
  });

  it("renders language toggle button with correct accessibility label", () => {
    render(<LocaleSwitcher />);
    expect(
      screen.getByRole("button", { name: /toggle language/i }),
    ).toBeInTheDocument();
  });

  it("displays current locale in uppercase", () => {
    render(<LocaleSwitcher />);
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("applies custom className when provided", () => {
    const testClass = "test-class";

    render(<LocaleSwitcher className={testClass} />);

    const button = screen.getByRole("button", { name: /toggle language/i });

    expect(button).toHaveClass(testClass);
  });

  it("applies nonce attribute when provided", () => {
    const testNonce = "test-nonce-123";

    render(<LocaleSwitcher nonce={testNonce} />);

    const button = screen.getByRole("button", { name: /toggle language/i });

    expect(button).toHaveAttribute("nonce", testNonce);
  });

  it("handles locale toggle correctly", async () => {
    const user = userEvent.setup();

    render(<LocaleSwitcher />);

    const button = screen.getByRole("button", { name: /toggle language/i });

    await user.click(button);

    // Verify localStorage was updated
    expect(mockSetItem).toHaveBeenCalledWith("preferredLocale", "fr");

    // Verify cookie was set
    expect(document.cookie).toContain("NEXT_LOCALE=fr");
  });

  it("starts with empty content when not mounted", () => {
    // Override useState to always return false for mounted state
    const useStateSpy = jest.spyOn(React, "useState");

    useStateSpy.mockImplementationOnce(() => [false, jest.fn()]);

    render(<LocaleSwitcher />);
    const button = screen.queryByRole("button", { name: /toggle language/i });

    expect(button).not.toBeInTheDocument();

    useStateSpy.mockRestore();
  });

  it("renders after mounting", () => {
    render(<LocaleSwitcher />);

    // Component should be visible after mounting
    const button = screen.getByRole("button", { name: /toggle language/i });

    expect(button).toBeInTheDocument();
    expect(screen.getByText(mockLocale.toUpperCase())).toBeInTheDocument();
  });
});
