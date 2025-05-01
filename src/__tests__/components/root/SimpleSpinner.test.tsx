import { render, screen } from "@testing-library/react";

import { SimpleSpinner } from "../../../components/root/SimpleSpinner";

// Mock the Lucide icon component to make it easier to test
jest.mock("lucide-react", () => ({
  Loader2: (props: any) => (
    <div data-testid="loader-icon" {...props}>
      Loader2 Icon
    </div>
  ),
}));

// Mock the cn utility
jest.mock("@/lib/utils", () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(" "),
}));

describe("SimpleSpinner", () => {
  it("renders the component", () => {
    const { container } = render(<SimpleSpinner />);

    expect(container).toBeInTheDocument();
  });

  it("contains the Loader2 icon", () => {
    render(<SimpleSpinner />);
    const loaderIcon = screen.getByTestId("loader-icon");

    expect(loaderIcon).toBeInTheDocument();
  });

  it("applies the animate-spin class", () => {
    render(<SimpleSpinner />);
    const spinnerElement = screen.getByTestId("loader-icon");

    expect(spinnerElement).toHaveClass("animate-spin");
  });

  it("accepts and applies custom className", () => {
    render(<SimpleSpinner className="w-12 h-12 text-blue-500" />);
    const spinnerElement = screen.getByTestId("loader-icon");

    expect(spinnerElement).toHaveClass("animate-spin");
    expect(spinnerElement).toHaveClass("w-12");
    expect(spinnerElement).toHaveClass("h-12");
    expect(spinnerElement).toHaveClass("text-blue-500");
  });
});
