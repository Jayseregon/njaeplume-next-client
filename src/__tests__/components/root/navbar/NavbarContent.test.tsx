import { render, screen } from "@testing-library/react";

import { NavbarContent } from "@/components/root/navbar/NavbarContent";

// Mock child components
jest.mock("@/components/root/navbar/Brand", () => ({
  Brand: () => <div data-testid="brand">Brand Component</div>,
}));

jest.mock("@/components/root/navbar/NavbarCenter", () => ({
  NavbarCenter: ({ currentPath }: { currentPath: string }) => (
    <div data-current-path={currentPath} data-testid="navbar-center">
      Navbar Center
    </div>
  ),
}));

jest.mock("@/components/root/navbar/NavbarRight", () => ({
  NavbarRight: ({ nonce }: { nonce: string }) => (
    <div data-nonce={nonce} data-testid="navbar-right">
      Navbar Right
    </div>
  ),
}));

jest.mock("@/components/root/navbar/MobileMenu", () => ({
  MobileMenu: ({
    currentPath,
    nonce,
  }: {
    currentPath: string;
    nonce: string;
  }) => (
    <div
      data-current-path={currentPath}
      data-nonce={nonce}
      data-testid="mobile-menu"
    >
      Mobile Menu
    </div>
  ),
}));

describe("NavbarContent", () => {
  const mockProps = {
    currentPath: "/test-path",
    nonce: "test-nonce-123",
  };

  it("renders all child components", () => {
    render(<NavbarContent {...mockProps} />);

    expect(screen.getByTestId("brand")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-center")).toBeInTheDocument();
    expect(screen.getByTestId("navbar-right")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-menu")).toBeInTheDocument();
  });

  it("passes correct props to child components", () => {
    render(<NavbarContent {...mockProps} />);

    expect(screen.getByTestId("navbar-center")).toHaveAttribute(
      "data-current-path",
      mockProps.currentPath,
    );
    expect(screen.getByTestId("navbar-right")).toHaveAttribute(
      "data-nonce",
      mockProps.nonce,
    );
    expect(screen.getByTestId("mobile-menu")).toHaveAttribute(
      "data-current-path",
      mockProps.currentPath,
    );
    expect(screen.getByTestId("mobile-menu")).toHaveAttribute(
      "data-nonce",
      mockProps.nonce,
    );
  });

  it("applies correct container styling", () => {
    render(<NavbarContent {...mockProps} />);

    const container = screen.getByTestId("navbar-content");

    expect(container).toHaveClass(
      "container",
      "max-w-(--breakpoint-2xl)",
      "mx-auto",
      "flex",
      "h-16",
      "items-center",
      "px-0",
    );
  });

  it("sets correct test attributes", () => {
    render(<NavbarContent {...mockProps} />);

    const container = screen.getByTestId("navbar-content");

    expect(container).toHaveAttribute(
      "data-current-path",
      mockProps.currentPath,
    );
    expect(container).toHaveAttribute("data-nonce", mockProps.nonce);
  });

  it("maintains correct layout structure", () => {
    const { container } = render(<NavbarContent {...mockProps} />);

    const flexNoneDiv = container.querySelector(".flex-none");

    expect(flexNoneDiv).toBeInTheDocument();
    expect(flexNoneDiv?.firstChild).toHaveAttribute("data-testid", "brand");
  });
});
