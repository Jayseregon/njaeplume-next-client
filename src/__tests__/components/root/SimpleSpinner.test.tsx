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
    const { container } = render(<SimpleSpinner />);
    // Since the Loader2 is mocked, we need to check the first child element
    const spinnerElement = container.firstChild;

    expect(spinnerElement).toHaveClass("animate-spin");
  });
});
