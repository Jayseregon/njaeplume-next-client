import { render, screen, fireEvent } from "@testing-library/react";

import { FieldInput } from "@/components/contact/FieldInput";

// Mock translation function
const mockT = Object.assign((key: string) => `Translated ${key}`, {
  rich: (key: string) => `Rich ${key}`,
  markup: (key: string) => `Markup ${key}`,
  raw: (key: string) => `Raw ${key}`,
  has: (_key: string) => true,
});

describe("FieldInput", () => {
  const defaultProps = {
    fieldTarget: "email",
    t: mockT,
    type: "email",
    value: "",
    onChange: jest.fn(),
  };

  it("renders label with translated text", () => {
    render(<FieldInput {...defaultProps} />);

    const label = screen.getByText("Translated email");

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("block", "text-sm", "font-medium", "text-start");
  });

  it("renders input with correct attributes", () => {
    render(<FieldInput {...defaultProps} />);

    const input = screen.getByRole("textbox");

    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toBeRequired();
  });

  it("applies correct styling to input", () => {
    render(<FieldInput {...defaultProps} />);

    const input = screen.getByRole("textbox");

    expect(input).toHaveClass(
      "mt-1",
      "block",
      "w-full",
      "bg-neutral-50",
      "dark:bg-neutral-200",
      "text-foreground",
      "dark:text-background",
      "border",
      "border-foreground",
      "rounded-md",
      "py-2",
      "px-3",
    );
  });

  it("handles value changes correctly", () => {
    render(<FieldInput {...defaultProps} />);

    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "test@example.com" } });

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("renders different input types correctly", () => {
    render(<FieldInput {...defaultProps} fieldTarget="name" type="text" />);

    const input = screen.getByRole("textbox");

    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("id", "name");
  });

  it("displays provided value correctly", () => {
    const value = "test@example.com";

    render(<FieldInput {...defaultProps} value={value} />);

    const input = screen.getByRole("textbox") as HTMLInputElement;

    expect(input.value).toBe(value);
  });

  it("associates label with input using htmlFor", () => {
    render(<FieldInput {...defaultProps} />);

    const label = screen.getByText("Translated email");
    const input = screen.getByRole("textbox");

    expect(label).toHaveAttribute("for", "email");
    expect(input).toHaveAttribute("id", "email");
  });
});
