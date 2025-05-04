import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { formatPrice, formatDate } from "@/lib/utils";
import { getUserOrders } from "@/actions/prisma/action";
import AccountDashboard from "@/app/(secured)/account/page";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
      <a data-testid="link" href={href} {...props}>
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
  PageTitle: ({ title }: { title: string }) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
}));

jest.mock("@/components/root/ErrorBoundary", () => (props: any) => (
  <>{props.children}</>
));

jest.mock("@/components/root/SimpleSpinner", () => ({
  SimpleSpinner: () => <div data-testid="spinner">Loading...</div>,
}));

jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => <div data-testid="error-display">Error</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild,
    disabled,
    className,
    variant,
    size,
    ...props
  }: any) => (
    <button
      className={className}
      data-as-child={asChild ? "true" : "false"}
      data-size={size}
      data-testid="button"
      data-variant={variant}
      disabled={disabled}
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

// Add new mocks for the updated component
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn().mockReturnValue(null),
  })),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
  })),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: any) => {
    // Simple mock returning the key or key with interpolated values
    if (values) {
      let result = key;

      for (const k in values) {
        result = result.replace(`{${k}}`, values[k]);
      }

      return result;
    }

    return key;
  },
}));

// Mock cart store
const mockClearCart = jest.fn();
const mockSetCartOpen = jest.fn();

jest.mock("@/providers/CartStoreProvider", () => ({
  useCartStore: jest.fn((selector) => {
    if (selector.toString().includes("clearCart")) return mockClearCart;
    if (selector.toString().includes("setCartOpen")) return mockSetCartOpen;

    return undefined;
  }),
}));

// Mock Suspense
jest.mock("react", () => {
  const actualReact = jest.requireActual("react");

  return {
    ...actualReact,
    Suspense: ({
      children,
      fallback,
    }: {
      children: React.ReactNode;
      fallback: React.ReactNode;
    }) => (
      <div data-testid="suspense-wrapper">
        {fallback}
        {children}
      </div>
    ),
  };
});

// Mock CalendarDays and Download icons
jest.mock("lucide-react", () => ({
  Download: () => <span data-testid="download-icon">Download Icon</span>,
  CalendarDays: () => <span data-testid="calendar-icon">Calendar Icon</span>,
}));

// Mock product download hook
jest.mock("@/hooks/useProductDownload", () => ({
  useProductDownload: jest.fn((callback) => ({
    downloadingItems: {},
    handleDownload: jest.fn((item) => {
      if (callback) callback(item);
    }),
  })),
}));

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
  status: "COMPLETED", // Updated to match enum
  createdAt: new Date("2023-10-15T10:30:00Z"),
  userId: "user_123",
  items: [
    {
      id: "item_1",
      orderId: "ord_123",
      productId: "prod_1",
      quantity: 1,
      price: 2999,
      downnloadCount: 0, // Added download count
      downloadedAt: null, // Added download date
      product: {
        id: "prod_1",
        name: "Digital Brush Set",
        price: 2999,
        description: "A set of digital brushes",
        slug: "digital-brush-set",
        category: "brushes", // Updated from object to string
        createdAt: new Date("2023-09-01"),
        updatedAt: new Date("2023-09-01"),
        zip_file_name: "brushes.zip",
        tags: [],
        images: [],
      },
    },
  ],
};

// Add a mock order with downloaded items
const mockOrderWithDownload = {
  ...mockOrder,
  id: "ord_456",
  displayId: "ORD-789012",
  items: [
    {
      ...mockOrder.items[0],
      id: "item_2",
      downnloadCount: 1,
      downloadedAt: new Date("2023-10-16T10:30:00Z"),
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
    // Check for Suspense wrapper
    expect(screen.getByTestId("suspense-wrapper")).toBeInTheDocument();
    // Use getAllByText instead of getByText since the text appears multiple times
    expect(screen.getAllByText("loading").length).toBeGreaterThan(0);
  });

  it("shows sign-in message when user is not authenticated", () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: null,
    });

    render(<AccountDashboard />);
    expect(screen.getByText("signInRequired")).toBeInTheDocument();
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
      expect(screen.getByText(`welcome`)).toBeInTheDocument();
    });

    expect(screen.getByTestId("page-title")).toHaveTextContent("title");
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

    expect(screen.getByText("noOrdersYet")).toBeInTheDocument();
  });

  it("displays latest order information when user has orders", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    // Mock orders
    (getUserOrders as jest.Mock).mockResolvedValue([mockOrder]);

    render(<AccountDashboard />);

    await waitFor(() => {
      // Check if order ID label is displayed (more specific selector)
      expect(screen.getByText("orderId")).toBeInTheDocument();

      // Use a more specific approach to find the order ID - look for it in the recent order section
      const recentOrderSection = screen
        .getByText("recentOrder") // Use the translation key
        .closest("div")?.parentElement;

      expect(recentOrderSection).not.toBeNull();

      // Now check within that section for the order ID
      const orderIdElement = within(
        recentOrderSection as HTMLElement,
      ).getByText(mockOrder.displayId);

      expect(orderIdElement).toBeInTheDocument();

      // Check if date is displayed correctly
      expect(
        screen.getByText(formatDate(mockOrder.createdAt)),
      ).toBeInTheDocument();

      // Check if price is formatted correctly
      expect(
        screen.getByText(formatPrice(mockOrder.amount)),
      ).toBeInTheDocument();

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
      const viewAllLink = screen.getByText("viewAllOrders");

      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest("a")).toHaveAttribute(
        "href",
        "/account/orders",
      );
    });
  });

  it("displays the downloads section with view all downloads link", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    render(<AccountDashboard />);

    await waitFor(() => {
      expect(screen.getByText("recentDownloads")).toBeInTheDocument();
      const viewAllLink = screen.getByText("viewAllDownloads");

      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest("a")).toHaveAttribute(
        "href",
        "/account/downloads",
      );
    });
  });

  it("displays download stats correctly", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    // Mock orders with downloaded and downloadable items
    (getUserOrders as jest.Mock).mockResolvedValue([
      mockOrder,
      mockOrderWithDownload,
    ]);

    render(<AccountDashboard />);

    await waitFor(() => {
      // Should see labels for the download stats
      expect(screen.getByText("downloadable")).toBeInTheDocument();
      expect(screen.getByText("totalFiles")).toBeInTheDocument();
    });
  });

  it("displays download buttons for non-downloaded items", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    (getUserOrders as jest.Mock).mockResolvedValue([mockOrder]);

    render(<AccountDashboard />);

    await waitFor(() => {
      // Check if download button exists
      expect(screen.getByText("downloadButton")).toBeInTheDocument();
      expect(screen.getByTestId("download-icon")).toBeInTheDocument();
    });
  });

  it("displays download date for downloaded items", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    (getUserOrders as jest.Mock).mockResolvedValue([mockOrderWithDownload]);

    render(<AccountDashboard />);

    await waitFor(() => {
      // Check if download date is shown
      expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
      expect(screen.getByText(/downloadedOn/)).toBeInTheDocument();
    });
  });

  it("processes checkout redirect and clears cart when session_id is present", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    // Mock session_id in URL
    const mockGet = jest.fn((param) =>
      param === "session_id" ? "test_session" : null,
    );

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
    });

    const mockReplace = jest.fn();

    (useRouter as jest.Mock).mockReturnValue({
      replace: mockReplace,
    });

    render(<AccountDashboard />);

    await waitFor(() => {
      // Check cart clearing and toast
      expect(mockClearCart).toHaveBeenCalled();
      expect(mockSetCartOpen).toHaveBeenCalledWith(false);
      expect(toast.success).toHaveBeenCalledWith("paymentSuccess");

      // Check URL replacement
      expect(mockReplace).toHaveBeenCalledWith("/account", { scroll: false });
    });
  });

  it("renders the view all downloads link", async () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      user: mockUser,
    });

    render(<AccountDashboard />);

    await waitFor(() => {
      const viewAllLink = screen.getByText("viewAllDownloads");

      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest("a")).toHaveAttribute(
        "href",
        "/account/downloads",
      );
    });
  });
});
