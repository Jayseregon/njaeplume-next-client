import { render, screen } from "@testing-library/react";

import { Brand } from "@/components/root/navbar/Brand";
import { siteConfig } from "@/config/site";

// Mock the Logo component
jest.mock("@/components/icons", () => ({
  Logo: (props: any) => (
    <div data-testid="mock-logo" {...props}>
      Logo
    </div>
  ),
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: any) => (
    <a data-testid="next-link" {...props}>
      {children}
    </a>
  ),
}));

// Mock NonceContext
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useContext: () => "test-nonce",
}));

describe("Brand", () => {
  it("renders with correct link to home", () => {
    render(<Brand />);

    const link = screen.getByTestId("next-link");

    expect(link).toHaveAttribute("href", "/");
  });

  it("renders the logo", () => {
    render(<Brand />);

    expect(screen.getByTestId("mock-logo")).toBeInTheDocument();
    expect(screen.getByTestId("mock-logo")).toHaveAttribute(
      "nonce",
      "test-nonce",
    );
  });

  it("displays the site name", () => {
    render(<Brand />);

    expect(screen.getByText(siteConfig.name)).toBeInTheDocument();
  });

  it("has correct styling classes", () => {
    render(<Brand />);

    const link = screen.getByTestId("next-link");

    expect(link).toHaveClass("flex", "items-center", "gap-4", "ml-6");
  });

  it("passes nonce to both Link and Logo", () => {
    render(<Brand />);

    const link = screen.getByTestId("next-link");
    const logo = screen.getByTestId("mock-logo");

    expect(link).toHaveAttribute("nonce", "test-nonce");
    expect(logo).toHaveAttribute("nonce", "test-nonce");
  });
});
