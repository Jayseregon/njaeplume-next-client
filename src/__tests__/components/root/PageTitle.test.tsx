import { render, screen } from "@testing-library/react";

import { PageTitle } from "@/src/components/root/PageTitle";

describe("PageTitle", () => {
  it("renders the title text correctly", () => {
    const testTitle = "Test Page Title";

    render(<PageTitle title={testTitle} />);

    expect(screen.getByText(testTitle)).toBeInTheDocument();
  });

  it("renders as an h1 element", () => {
    render(<PageTitle title="Test Title" />);

    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(<PageTitle title="Test Title" />);

    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading).toHaveClass(
      "text-5xl",
      "font-bold",
      "mb-5",
      "text-foreground",
    );
  });
});
