import { render, screen, fireEvent } from "@testing-library/react";

import { TextInput } from "@/components/contact/TextInput";

// Mock translation function
const mockT = Object.assign((key: string) => `Translated ${key}`, {
  rich: (key: string) => key,
  markup: (key: string) => key,
  raw: (key: string) => key,
  has: (_key: string) => true,
});

describe("TextInput", () => {
  const defaultProps = {
    fieldTarget: "message",
    t: mockT,
    value: "",
    onChange: jest.fn(),
  };

  it("renders label with translated text", () => {
    render(<TextInput {...defaultProps} />);

    const label = screen.getByText("Translated message");

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("block", "text-sm", "font-medium", "text-start");
  });

  it("renders textarea with correct attributes", () => {
    render(<TextInput {...defaultProps} />);

    const textarea = screen.getByRole("textbox");

    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute("id", "message");
    expect(textarea).toHaveAttribute("name", "message");
  });

  it("applies correct styling to textarea", () => {
    render(<TextInput {...defaultProps} />);

    const textarea = screen.getByRole("textbox");

    expect(textarea).toHaveClass(
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

  it("handles value changes correctly", () => {
    render(<TextInput {...defaultProps} />);

    const textarea = screen.getByRole("textbox");

    fireEvent.change(textarea, { target: { value: "Test message content" } });

    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("displays provided value correctly", () => {
    const value = "Test message content";

    render(<TextInput {...defaultProps} value={value} />);

    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

    expect(textarea.value).toBe(value);
  });

  it("associates label with textarea using htmlFor", () => {
    render(<TextInput {...defaultProps} />);

    const label = screen.getByText("Translated message");
    const textarea = screen.getByRole("textbox");

    expect(label).toHaveAttribute("for", "message");
    expect(textarea).toHaveAttribute("id", "message");
  });

  it("renders with correct wrapper div structure", () => {
    render(<TextInput {...defaultProps} />);

    const wrapper = screen.getByRole("textbox").closest("div");

    expect(wrapper).toBeInTheDocument();
  });
});
