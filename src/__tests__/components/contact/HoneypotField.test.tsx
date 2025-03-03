import { render, screen, fireEvent } from "@testing-library/react";

import { HoneypotField } from "@/components/contact/HoneypotField";

// Mock translation function
const mockT = Object.assign((key: string) => `Translated ${key}`, {
  rich: (key: string) => key,
  markup: (key: string) => key,
  raw: (key: string) => key,
  has: (_key: string) => true,
});

describe("HoneypotField", () => {
  const defaultProps = {
    t: mockT,
    value: "",
    onChange: jest.fn(),
  };

  it("renders in a hidden container", () => {
    render(<HoneypotField {...defaultProps} />);
    const container = screen
      .getByLabelText("Translated honeypot")
      .closest("div");

    expect(container).toHaveClass("hidden");
  });

  it("renders label with translated text", () => {
    render(<HoneypotField {...defaultProps} />);
    const label = screen.getByText("Translated honeypot");

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("block", "text-sm", "font-medium", "text-start");
  });

  it("renders input with correct attributes", () => {
    render(<HoneypotField {...defaultProps} />);
    const input = screen.getByRole("textbox");

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("id", "honeypot");
    expect(input).toHaveAttribute("name", "honeypot");
  });

  it("handles value changes", () => {
    render(<HoneypotField {...defaultProps} />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "test" } });
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("displays provided value", () => {
    const value = "test-value";

    render(<HoneypotField {...defaultProps} value={value} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;

    expect(input.value).toBe(value);
  });

  it("applies correct styling to input", () => {
    render(<HoneypotField {...defaultProps} />);
    const input = screen.getByRole("textbox");

    expect(input).toHaveClass(
      "mt-1",
      "block",
      "w-full",
      "bg-white",
      "text-black",
      "border",
      "border-foreground",
      "rounded-md",
      "py-2",
      "px-3",
    );
  });

  it("associates label with input using htmlFor", () => {
    render(<HoneypotField {...defaultProps} />);

    const label = screen.getByText("Translated honeypot");
    const input = screen.getByRole("textbox");

    expect(label).toHaveAttribute("for", "honeypot");
    expect(input).toHaveAttribute("id", "honeypot");
  });
});
