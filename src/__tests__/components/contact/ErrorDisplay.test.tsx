import { render, screen } from "@testing-library/react";

import { ErrorDisplay } from "@/components/contact/ErrorDisplay";

// Mock the EmailErrorIcon component
jest.mock("@/components/icons", () => ({
  EmailErrorIcon: (props: any) => (
    <div data-testid="mock-email-error-icon" {...props}>
      EmailErrorIcon
    </div>
  ),
}));

// Mock translation function
const mockT = Object.assign(
  (key: string) => {
    const translations: { [key: string]: string } = {
      title: "Error Title",
      error1: "Primary Error Message",
      error2: "Secondary Error Message",
      error3: "Tertiary Error Message",
    };

    return translations[key] || key;
  },
  {
    rich: (key: string) => key,
    markup: (key: string) => key,
    raw: (key: string) => key,
    has: (_key: string) => true,
  },
);

describe("ErrorDisplay", () => {
  beforeEach(() => {
    render(<ErrorDisplay t={mockT} />);
  });

  it("renders the error title", () => {
    expect(screen.getByText("Error Title")).toBeInTheDocument();
    expect(screen.getByText("Error Title")).toHaveClass(
      "text-5xl",
      "font-bold",
      "mb-5",
    );
  });

  it("renders the EmailErrorIcon with correct size", () => {
    const icon = screen.getByTestId("mock-email-error-icon");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("size", "65");
  });

  it("displays all error messages", () => {
    expect(screen.getByText("Primary Error Message")).toBeInTheDocument();
    expect(screen.getByText("Secondary Error Message")).toBeInTheDocument();
    expect(screen.getByText("Tertiary Error Message")).toBeInTheDocument();
  });

  it("has the correct styling classes for the alert container", () => {
    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass(
      "p-4",
      "mb-4",
      "grid",
      "grid-cols-1",
      "gap-4",
      "text-danger-700",
      "bg-danger-100",
      "rounded-lg",
      "dark:bg-danger-200",
      "dark:text-danger-800",
    );
  });

  it("renders error messages in a paragraph with correct styling", () => {
    const paragraph = screen.getByText("Primary Error Message").closest("p");

    expect(paragraph).toHaveClass(
      "font-medium",
      "grid",
      "grid-cols-1",
      "gap-1",
    );
  });

  it("renders with correct layout wrapper classes", () => {
    const wrapper = screen.getByText("Error Title").closest("div");

    expect(wrapper).toHaveClass("max-w-fit", "mx-auto", "p-4");
  });
});
