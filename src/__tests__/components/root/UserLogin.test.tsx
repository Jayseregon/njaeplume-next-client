import { render, screen } from "@testing-library/react";
import * as clerk from "@clerk/nextjs";

import { getCastleNavItemByKey } from "@/config/site";

import { UserLogin } from "../../../components/root/UserLogin";

// Mock the Lucide icons
jest.mock("lucide-react", () => ({
  CircleUserRound: () => (
    <div data-testid="circle-user-icon">CircleUserRound Icon</div>
  ),
  LayoutDashboard: () => (
    <div data-testid="dashboard-icon">LayoutDashboard Icon</div>
  ),
}));

// Mock the Clerk components and hooks
jest.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-in-button">{children}</div>
  ),
  SignedIn: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-in">{children}</div>
  ),
  SignedOut: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="signed-out">{children}</div>
  ),
  UserButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-button">{children}</div>
  ),
  useUser: jest.fn(),
}));

// Mock the Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

// Mock the site config
jest.mock("@/config/site", () => ({
  getCastleNavItemByKey: jest.fn(),
}));

describe("UserLogin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders signed-out state correctly", () => {
    // Mock the useUser hook for signed-out state
    jest.spyOn(clerk, "useUser").mockReturnValue({
      isSignedIn: false,
      user: null,
    } as any);

    render(<UserLogin />);

    // Check that SignedOut component is rendered
    expect(screen.getByTestId("signed-out")).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-button")).toBeInTheDocument();
    expect(screen.getByTestId("button")).toBeInTheDocument();
    expect(screen.getByTestId("circle-user-icon")).toBeInTheDocument();
  });

  it("renders signed-in state correctly", () => {
    // Mock the useUser hook for signed-in state
    jest.spyOn(clerk, "useUser").mockReturnValue({
      isSignedIn: true,
      user: {
        publicMetadata: {},
      },
    } as any);

    render(<UserLogin />);

    // Check that SignedIn component is rendered
    expect(screen.getByTestId("signed-in")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
  });

  it("renders castle admin option when user has castleAdmin role", () => {
    // Mock the castle nav item
    const mockCastleItem = { href: "/castle", key: "castle" };

    (getCastleNavItemByKey as jest.Mock).mockReturnValue(mockCastleItem);

    // Mock the useUser hook for castle admin
    jest.spyOn(clerk, "useUser").mockReturnValue({
      isSignedIn: true,
      user: {
        publicMetadata: {
          role: "castleAdmin",
        },
      },
    } as any);

    // Mock the UserButton.MenuItems and UserButton.Link components
    (clerk.UserButton as any).MenuItems = ({
      children,
    }: {
      children: React.ReactNode;
    }) => <div data-testid="user-button-menu-items">{children}</div>;

    (clerk.UserButton as any).Link = ({
      label,
      labelIcon,
    }: {
      label: string;
      labelIcon: React.ReactNode;
    }) => (
      <div data-label={label} data-testid="user-button-link">
        {labelIcon}
      </div>
    );

    render(<UserLogin />);

    expect(screen.getByTestId("signed-in")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
    expect(screen.getByTestId("user-button-menu-items")).toBeInTheDocument();
    expect(screen.getByTestId("user-button-link")).toBeInTheDocument();
    expect(screen.getByTestId("user-button-link")).toHaveAttribute(
      "data-label",
      "Castle",
    );
    expect(screen.getByTestId("dashboard-icon")).toBeInTheDocument();
  });

  it("accepts and passes along nonce prop for CSP", () => {
    jest.spyOn(clerk, "useUser").mockReturnValue({
      isSignedIn: false,
      user: null,
    } as any);

    render(<UserLogin nonce="test-nonce" />);

    expect(screen.getByTestId("button")).toHaveAttribute("nonce", "test-nonce");
  });
});
