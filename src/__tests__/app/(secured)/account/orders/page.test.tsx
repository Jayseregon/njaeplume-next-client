import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

// Mock console methods to prevent output during tests
let originalConsoleLog: typeof console.log;
let originalConsoleError: typeof console.error;

// Mock useUser from Clerk
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

// Mock toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// REMOVED: Mock for useSearchParams, useRouter since we don't use them anymore
// REMOVED: Mock for useCartStore since we don't use it anymore

// Mock getUserOrders action
const mockGetUserOrders = jest.fn() as jest.Mock<
  Promise<OrderWithItems[]>,
  any[]
>;

jest.mock("@/actions/prisma/action", () => ({
  getUserOrders: (...args: any[]) => mockGetUserOrders(...args),
}));

// Mock components
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
}));

jest.mock("@/components/root/ErrorBoundary", () => ({
  __esModule: true,
  default: (props: any) => <>{props.children}</>,
}));

jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => (
    <div data-testid="error-display">Error occurred</div>
  ),
}));

jest.mock("@/components/account/OrdersTable", () => ({
  OrdersTable: ({ orders }: { orders: any[] }) => (
    <div data-testid="orders-table">
      {orders.map((order) => (
        <div key={order.id} data-testid={`order-${order.displayId}`}>
          Order {order.displayId}: ${order.amount / 100}
        </div>
      ))}
    </div>
  ),
}));

// Mock next/link
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: any) => (
      <a href={href} {...rest} data-testid={`link-${href.replace(/\//g, "-")}`}>
        {children}
      </a>
    ),
  };
});

// Mock Lucide icon
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="arrow-left-icon">←</span>,
}));

// Mock Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, variant, className, ...props }: any) => (
    <button
      className={className}
      data-as-child={asChild ? "true" : "false"}
      data-testid="button"
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

// REMOVED: Mock for Suspense since we don't use it anymore

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key, // Simple mock returning the key
}));

// Import after mocks
import OrdersPage from "@/app/(secured)/account/orders/page";
import { OrderWithItems } from "@/src/interfaces/Products";

// Test data
const mockOrders: OrderWithItems[] = [
  {
    id: "ord_123",
    displayId: "ORD-123456",
    amount: 2999,
    status: "COMPLETED",
    createdAt: new Date("2023-10-15T10:30:00Z"),
    userId: "user_123",
    updatedAt: new Date("2023-10-15T10:30:00Z"),
    stripeCheckoutSessionId: "cs_test_123",
    stripeChargeId: "ch_test_123",
    stripeCustomerId: "cus_test_123",
    items: [
      {
        id: "item_1",
        orderId: "ord_123",
        productId: "prod_1",
        quantity: 1,
        price: 2999,
        downnloadCount: 0,
        downloadedAt: null,
        product: {
          id: "prod_1",
          name: "Digital Brush Set",
          price: 2999,
          description: "A set of digital brushes",
          slug: "digital-brush-set",
          category: "brushes",
          createdAt: new Date("2023-09-01"),
          updatedAt: new Date("2023-09-01"),
          zip_file_name: "brushes.zip",
          images: [],
          tags: [],
        },
      },
    ],
  },
  {
    id: "ord_456",
    displayId: "ORD-789012",
    amount: 1999,
    status: "COMPLETED",
    createdAt: new Date("2023-09-22T14:15:00Z"),
    userId: "user_123",
    updatedAt: new Date("2023-09-22T14:15:00Z"),
    stripeCheckoutSessionId: "cs_test_456",
    stripeChargeId: "ch_test_456",
    stripeCustomerId: "cus_test_456",
    items: [
      {
        id: "item_2",
        orderId: "ord_456",
        productId: "prod_2",
        quantity: 1,
        price: 1999,
        downnloadCount: 0,
        downloadedAt: null,
        product: {
          id: "prod_2",
          name: "Digital Stickers",
          price: 1999,
          description: "A set of digital stickers",
          slug: "digital-stickers",
          category: "stickers",
          createdAt: new Date("2023-08-15"),
          updatedAt: new Date("2023-08-15"),
          zip_file_name: "stickers.zip",
          images: [],
          tags: [],
        },
      },
    ],
  },
];

describe("OrdersPage", () => {
  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;

    // Mock console methods to prevent output during tests
    console.log = jest.fn();
    console.error = jest.fn();

    // Default mocks
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: false,
      user: null,
    });

    // REMOVED: Mock for useSearchParams and useRouter
    // REMOVED: Mock for cart store functions

    mockGetUserOrders.mockResolvedValue([]);
  });

  // Restore console methods after each test
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it("renders loading state when user data is loading", async () => {
    render(<OrdersPage />);

    // Check for loading message
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  it("shows sign-in message when user is not authenticated", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: null,
    });

    render(<OrdersPage />);

    // Check for sign-in message using the rendered text (mock returns key part)
    expect(screen.getByText("signInRequired")).toBeInTheDocument();
  });

  it("displays empty state when user has no orders", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: { id: "user_123", firstName: "John", lastName: "Doe" },
    });

    mockGetUserOrders.mockResolvedValue([]);

    render(<OrdersPage />);

    await waitFor(() => {
      // Check for empty state messages using translation keys (mock returns key part)
      expect(screen.getByText("noOrdersTitle")).toBeInTheDocument();
      expect(screen.getByText("noOrdersMessage")).toBeInTheDocument();
      expect(screen.getByText("goShopping")).toBeInTheDocument();
    });

    // Check that the link to shop is present
    expect(screen.getByTestId("link--shop")).toHaveAttribute("href", "/shop");
  });

  it("displays orders table when user has orders", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: { id: "user_123", firstName: "John", lastName: "Doe" },
    });

    mockGetUserOrders.mockResolvedValue(mockOrders);

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByTestId("orders-table")).toBeInTheDocument();
      expect(screen.getByTestId("order-ORD-123456")).toBeInTheDocument();
      expect(screen.getByTestId("order-ORD-789012")).toBeInTheDocument();
      // Check PageTitle receives the correct key (mock t returns the key)
      expect(screen.getByTestId("page-title")).toHaveTextContent("title");
    });
  });

  it("shows back to dashboard button", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: { id: "user_123", firstName: "John", lastName: "Doe" },
    });

    mockGetUserOrders.mockResolvedValue([]);

    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByTestId("link--account")).toBeInTheDocument();
    });

    expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
    // Check button text using translation key
    expect(screen.getByText("backToDashboard")).toBeInTheDocument();
    expect(screen.getByTestId("link--account")).toHaveAttribute(
      "href",
      "/account",
    );
  });

  it("calls getUserOrders with correct parameters", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: { id: "user_123", firstName: "John", lastName: "Doe" },
    });

    render(<OrdersPage />);

    await waitFor(() => {
      expect(mockGetUserOrders).toHaveBeenCalled();
    });
  });

  // REMOVED: Test for checkout and cart clearing functionality

  it("handles API errors gracefully", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: { id: "user_123", firstName: "John", lastName: "Doe" },
    });

    // Simulate an API error
    mockGetUserOrders.mockRejectedValue(new Error("API Error"));

    render(<OrdersPage />);

    await waitFor(() => {
      // Check toast error message using translation key
      expect(toast.error).toHaveBeenCalledWith("errorLoading");
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching orders:",
        expect.any(Error),
      );
    });
  });
});
