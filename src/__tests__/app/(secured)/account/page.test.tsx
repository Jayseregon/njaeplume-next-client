import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useUser } from "@clerk/nextjs";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
      <a href={href} data-testid="link" {...props}>
        {children}
      </a>
    ),
  };
});

// Mock Clerk useUser hook
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

// Mock getUserOrders action
jest.mock("@/actions/prisma/action", () => ({
  getUserOrders: jest.fn(),
}));

// Mock components
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => <h1 data-testid="page-title">{title}</h1>,
}));

jest.mock("@/components/root/ErrorBoundary", () => (props: any) => <>{props.children}</>);

jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => <div data-testid="error-display">Error</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, disabled, className, variant, ...props }: any) => (
    <button
      data-testid="button"
      data-as-child={asChild ? "true" : "false"}
      disabled={disabled}
      className={className}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

// Import utils directly for testing
import { formatPrice, formatDate } from "@/lib/utils";

// Import mocked action
import { getUserOrders } from "@/actions/prisma/action";

// Import after mocks
import AccountDashboard from "@/app/(secured)/account/page";

// Mock data
const mockUser = {
  id: "user_123",
  firstName: "John",
  lastName: "Doe",
};

const mockOrder = {
  id: "ord_123",
  displayId: "ORD-123456",
  amount: 2999,
  status: "completed",
  createdAt: new Date("2023-10-15T10:30:00Z"),
  userId: "user_123",
  items: [
    {
      id: "item_1",
      orderId: "ord_123",
      productId: "prod_1",
      quantity: 1,
      price: 2999,
      product: {
        id: "prod_1",
        name: "Digital Brush Set",
        price: 2999,
        description: "A set of digital brushes",
        slug: "digital-brush-set",
        category: { id: "cat_1", name: "Brushes" },
        createdAt: new Date("2023-09-01"),
        updatedAt: new Date("2023-09-01"),
        zip_file_name: "brushes.zip",
        tags: [],
        images: [],
      },
    },
  ],
};

describe("AccountDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks for loading state
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: false,
      user: null,
    });
    
    (getUserOrders as jest.Mock).mockResolvedValue([]);
  });

  it("renders loading state when user data is loading", () => {
    render(<AccountDashboard />);
    expect(screen.getByText("Loading your account information...")).toBeInTheDocument();
  });

  it("shows sign-in message when user is not authenticated", () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: null,
    });

    render(<AccountDashboard />);
    expect(screen.getByText("Please sign in to access your account")).toBeInTheDocument();
  });

  it("renders user dashboard with welcome message when user is logged in", async () => {
    // Mock authenticated user
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    render(<AccountDashboard />);
    
    // Wait for data loading to complete
    await waitFor(() => {
      expect(screen.getByText(`Welcome, ${mockUser.firstName}`)).toBeInTheDocument();
    });

    expect(screen.getByTestId("page-title")).toHaveTextContent("My Account");
  });

  it("displays user stats correctly with zero orders", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });
    
    // Mock no orders
    (getUserOrders as jest.Mock).mockResolvedValue([]);

    render(<AccountDashboard />);
    
    await waitFor(() => {
      const statsValues = screen.getAllByText("0");
      expect(statsValues.length).toBeGreaterThanOrEqual(1);
    });

    expect(screen.getByText("You haven't placed any orders yet.")).toBeInTheDocument();
  });

  it("displays latest order information when user has orders", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });
    
    // Mock orders - first call returns latest order, second call for count returns full list
    (getUserOrders as jest.Mock).mockImplementation(({ limit } = {}) => {
      if (limit === 1) {
        return Promise.resolve([mockOrder]);
      } else {
        return Promise.resolve([mockOrder]); // Just 1 order for count
      }
    });

    render(<AccountDashboard />);
    
    await waitFor(() => {
      // Check if order ID is displayed
      expect(screen.getByText(`Order ID: ${mockOrder.displayId}`)).toBeInTheDocument();
      
      // Check if date is displayed correctly using our formatDate function
      expect(screen.getByText(`Date: ${formatDate(mockOrder.createdAt)}`)).toBeInTheDocument();
      
      // Check if price is formatted correctly using our formatPrice function
      expect(screen.getByText(formatPrice(mockOrder.amount))).toBeInTheDocument();
      
      // Check if order status is displayed
      expect(screen.getByTestId("badge")).toHaveTextContent(mockOrder.status);
    });
  });

  it("renders the view all orders link", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    render(<AccountDashboard />);
    
    await waitFor(() => {
      const viewAllLink = screen.getByText("View All Orders");
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest('a')).toHaveAttribute("href", "/account/orders");
    });
  });

  it("displays the downloads section with coming soon button", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    render(<AccountDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText("Your Downloads")).toBeInTheDocument();
      const comingSoonButton = screen.getByText("Coming Soon");
      expect(comingSoonButton).toBeInTheDocument();
      expect(comingSoonButton.closest('button')).toBeDisabled();
    });
    
    expect(screen.getByText("You don't have any downloads yet.")).toBeInTheDocument();
  });

  it("calls getUserOrders with correct parameters", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    render(<AccountDashboard />);
    
    await waitFor(() => {
      // First call should get the latest order
      expect(getUserOrders).toHaveBeenCalledWith({ limit: 1 });
      // Second call should get all orders for counting
      expect(getUserOrders).toHaveBeenCalledWith();
    });
  });
});
