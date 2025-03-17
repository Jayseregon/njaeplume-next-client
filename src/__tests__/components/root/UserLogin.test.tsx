import { render, screen } from "@testing-library/react";
import * as clerk from "@clerk/nextjs";

import { getCastleNavItemByKey } from "@/config/site";
import { UserLogin } from "@/components/root/UserLogin";

// Mock the Lucide icons
jest.mock("lucide-react", () => ({
  CircleUserRound: () => (
    <div data-testid="circle-user-icon">CircleUserRound Icon</div>
  ),
  LayoutDashboard: () => (
    <div data-testid="dashboard-icon">LayoutDashboard Icon</div>
  ),
  Mail: () => <div data-testid="mail-icon">Mail Icon</div>,
}));

// Mock the Clerk components and hooks with correct structure
jest.mock("@clerk/nextjs", () => {
  const UserButtonComponent = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-button">{children}</div>
  );

  // Add the MenuItems and Link as properties of UserButton
  UserButtonComponent.MenuItems = ({
    children,
  }: {
    children: React.ReactNode;
  }) => <div data-testid="user-button-menu-items">{children}</div>;

  UserButtonComponent.Link = ({
    label,
    labelIcon,
    href,
  }: {
    label: string;
    labelIcon: React.ReactNode;
    href: string;
  }) => (
    <div data-href={href} data-label={label} data-testid="user-button-link">
      {labelIcon}
    </div>
  );

  return {
    SignInButton: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="sign-in-button">{children}</div>
    ),
    SignedIn: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="signed-in">{children}</div>
    ),
    SignedOut: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="signed-out">{children}</div>
    ),
    UserButton: UserButtonComponent,
    useUser: jest.fn(() => ({ isSignedIn: false, user: null })),
  };
});

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
  getSubItemByKey: jest.fn().mockImplementation((key) => {
    if (key === "contact") {
      return { href: "/contact", label: "Contact" };
    }

    return null;
  }),
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
    const mockCastleItem = { href: "/castle", key: "castle", label: "Castle" };

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

    render(<UserLogin />);

    expect(screen.getByTestId("signed-in")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();

    // Check for both links - Castle and Contact
    const links = screen.getAllByTestId("user-button-link");

    expect(links).toHaveLength(2);

    // Find Castle link
    const castleLink = links.find(
      (link) => link.getAttribute("data-label") === "Castle",
    );

    expect(castleLink).toBeTruthy();
    expect(castleLink).toHaveAttribute("data-href", "/castle");
    expect(screen.getByTestId("dashboard-icon")).toBeInTheDocument();

    // Find Contact link
    const contactLink = links.find(
      (link) => link.getAttribute("data-label") === "Contact",
    );

    expect(contactLink).toBeTruthy();
    expect(contactLink).toHaveAttribute("data-href", "/contact");
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
  });

  it("renders contact option for regular users without castle admin role", () => {
    // Mock the castle nav item
    (getCastleNavItemByKey as jest.Mock).mockReturnValue(null);

    // Mock the useUser hook for regular user
    jest.spyOn(clerk, "useUser").mockReturnValue({
      isSignedIn: true,
      user: {
        publicMetadata: {}, // No castle admin role
      },
    } as any);

    render(<UserLogin />);

    expect(screen.getByTestId("signed-in")).toBeInTheDocument();
    expect(screen.getByTestId("user-button")).toBeInTheDocument();

    // Should only have Contact link, not Castle link
    const userButtonLinks = screen.getAllByTestId("user-button-link");

    expect(userButtonLinks).toHaveLength(1);
    expect(userButtonLinks[0]).toHaveAttribute("data-label", "Contact");
    expect(userButtonLinks[0]).toHaveAttribute("data-href", "/contact");
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
    expect(screen.queryByTestId("dashboard-icon")).not.toBeInTheDocument();
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
