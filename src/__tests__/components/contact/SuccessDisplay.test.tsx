import { render, screen } from "@testing-library/react";

import { SuccessDisplay } from "@/components/contact/SuccessDisplay";

// Mock the EmailSuccessIcon component
jest.mock("@/components/icons", () => ({
  EmailSuccessIcon: (props: any) => (
    <div data-testid="mock-email-success-icon" {...props}>
      EmailSuccessIcon
    </div>
  ),
}));

// Mock translation function
const mockT = Object.assign(
  (key: string) => {
    const translations: { [key: string]: string } = {
      title: "Success Title",
      success: "Success Message",
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

describe("SuccessDisplay", () => {
  beforeEach(() => {
    render(<SuccessDisplay t={mockT} />);
  });

  it("renders the success title", () => {
    expect(screen.getByText("Success Title")).toBeInTheDocument();
    expect(screen.getByText("Success Title")).toHaveClass(
      "text-5xl",
      "font-bold",
      "mb-5",
    );
  });

  it("renders the EmailSuccessIcon with correct size", () => {
    const icon = screen.getByTestId("mock-email-success-icon");

    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute("size", "65");
  });

  it("displays the success message", () => {
    expect(screen.getByText("Success Message")).toBeInTheDocument();
  });

  it("has the correct styling classes for the alert container", () => {
    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass(
      "p-4",
      "mb-4",
      "grid",
      "grid-cols-1",
      "gap-4",
      "text-success-700",
      "bg-success-100",
      "rounded-lg",
      "dark:bg-success-200",
      "dark:text-success-800",
    );
  });

  it("renders success message in a paragraph with correct styling", () => {
    const paragraph = screen.getByText("Success Message").closest("p");

    expect(paragraph).toHaveClass("font-medium");
  });

  it("renders with correct layout wrapper classes", () => {
    const wrapper = screen.getByText("Success Title").closest("div");

    expect(wrapper).toHaveClass("max-w-fit", "mx-auto", "p-4");
  });
});
