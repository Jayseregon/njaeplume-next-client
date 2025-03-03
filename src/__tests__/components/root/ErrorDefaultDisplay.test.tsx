import { render, screen, fireEvent } from "@testing-library/react";

import { ErrorDefaultDisplay } from "@/components/root/ErrorDefaultDisplay";

// Mock next/navigation
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

// Mock translations
const mockT = Object.assign((key: string) => `Translated ${key}`, {
  rich: (key: string) => key,
  markup: (key: string) => key,
  raw: (key: string) => key,
  has: (_key: string) => true,
});

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

describe("ErrorDefaultDisplay", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with correct structure", () => {
    const { container } = render(<ErrorDefaultDisplay />);

    const outerDiv = container.firstChild as HTMLElement;

    expect(outerDiv).toHaveClass(
      "min-h-[50vh]",
      "flex",
      "flex-col",
      "items-center",
      "justify-center",
      "p-4",
      "space-y-4",
    );
  });

  it("displays translated title and message in Alert component", () => {
    render(<ErrorDefaultDisplay />);

    expect(screen.getByText("Translated title")).toBeInTheDocument();
    expect(screen.getByText("Translated message")).toBeInTheDocument();
  });

  it("renders Alert component with correct variant and styling", () => {
    render(<ErrorDefaultDisplay />);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveClass("max-w-md");
    // Check for the destructive variant classes from the alertVariants cva
    expect(alert).toHaveClass(
      "border-red-500/50",
      "text-red-500",
      "[&>svg]:text-red-500",
    );
  });

  it("includes the TriangleAlert icon", () => {
    render(<ErrorDefaultDisplay />);

    const alertIcon = screen.getByRole("alert").querySelector("svg");

    expect(alertIcon).toBeInTheDocument();
    expect(alertIcon).toHaveClass("h-5", "w-5");
  });

  it("renders a back button with correct attributes", () => {
    render(<ErrorDefaultDisplay />);

    const button = screen.getByRole("button");

    expect(button).toHaveClass("mt-4");
    expect(button).toContainHTML("svg"); // Check for Undo2 icon
  });

  it("calls router.back when the button is clicked", () => {
    render(<ErrorDefaultDisplay />);

    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("applies destructive variant to the button", () => {
    render(<ErrorDefaultDisplay />);

    const button = screen.getByRole("button");

    // shadcn applies these classes for destructive variant
    expect(button).toHaveClass(
      "bg-red-500",
      "text-neutral-50",
      "hover:bg-red-500/90",
    );
  });
});
