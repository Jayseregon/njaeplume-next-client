import React from "react";
import {
  render,
  screen,
  waitFor,
  within as rtlWithin,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import DownloadsPage from "@/src/app/(secured)/account/downloads/page";
import { getUserOrders } from "@/src/actions/prisma/action";
import { useProductDownload } from "@/src/hooks/useProductDownload";
import { OrderWithItems } from "@/src/interfaces/Products";
import { Category } from "@/generated/client"; // Ensure this path is correct

// Mock Clerk's useUser
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
}));

// Mock sonner
jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock server actions
jest.mock("@/src/actions/prisma/action", () => ({
  getUserOrders: jest.fn(),
}));

// Mock the useProductDownload hook
const mockHandleDownloadBase = jest.fn();
let mockDownloadingItemsState: Record<string, boolean> = {};
let capturedOnDownloadSuccessCallback:
  | ((item: any, orderId: string) => void)
  | undefined;

jest.mock("@/src/hooks/useProductDownload", () => ({
  useProductDownload: jest.fn((onSuccessCallbackFromComponent) => {
    capturedOnDownloadSuccessCallback = onSuccessCallbackFromComponent;

    return {
      downloadingItems: mockDownloadingItemsState,
      handleDownload: mockHandleDownloadBase, // This is the function the component will call
    };
  }),
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a data-testid={`link-${href.replace(/\//g, "-")}`} href={href}>
      {children}
    </a>
  );
});

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left">ArrowLeft</span>,
  Download: () => <span data-testid="icon-download">Download</span>,
  CalendarDays: () => <span data-testid="icon-calendar">CalendarDays</span>,
}));

// Mock UI Components
jest.mock("@/src/components/root/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
}));
jest.mock("@/src/components/root/ErrorBoundary", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock("@/src/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => (
    <div data-testid="error-default-display">Error Display</div>
  ),
}));
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    size,
    asChild,
    className,
  }: any) => {
    if (asChild)
      return React.cloneElement(children, {
        "data-testid": "button-link",
        className,
        variant,
        size,
      });

    return (
      <button
        className={className}
        data-size={size}
        data-testid="button"
        data-variant={variant}
        disabled={disabled}
        onClick={onClick}
      >
        {children}
      </button>
    );
  },
}));
jest.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children, ...props }: any) => (
    <div data-testid="accordion" {...props}>
      {children}
    </div>
  ),
  AccordionItem: ({ children, value, ...props }: any) => (
    <div data-testid={`accordion-item-${value}`} {...props}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children, ...props }: any) => (
    <button data-testid="accordion-trigger" {...props}>
      {children}
    </button>
  ),
  AccordionContent: ({ children, ...props }: any) => (
    <div data-testid="accordion-content" {...props}>
      {children}
    </div>
  ),
}));
jest.mock("@/components/root/SimpleSpinner", () => ({
  SimpleSpinner: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock next-intl (already globally mocked in jest.setup.ts, but ensure it's used)
// useTranslations will return the key itself.

const mockUser = { id: "user_123", firstName: "Test", lastName: "User" };

const mockOrders: OrderWithItems[] = [
  {
    id: "order1",
    displayId: "ORD-001",
    amount: 1000,
    status: "COMPLETED",
    createdAt: new Date("2023-01-01T10:00:00Z"),
    userId: mockUser.id,
    updatedAt: new Date("2023-01-01T10:00:00Z"),
    stripeCheckoutSessionId: "cs_test_123",
    stripeChargeId: "ch_test_123",
    stripeCustomerId: "cus_test_123",
    items: [
      {
        id: "item1_1",
        orderId: "order1",
        productId: "prod1",
        quantity: 1,
        price: 1000,
        downnloadCount: 0, // Typo 'downnloadCount' matches component
        downloadedAt: null,
        product: {
          id: "prod1",
          name: "Product Alpha",
          price: 1000,
          description: "Alpha desc",
          description_fr: "Alpha desc FR",
          category: Category.brushes,
          createdAt: new Date(),
          updatedAt: new Date(),
          zip_file_name: "alpha/alpha.zip",
          slug: "product-alpha",
          tags: [],
          images: [],
        },
      },
      {
        id: "item1_2",
        orderId: "order1",
        productId: "prod2",
        quantity: 1,
        price: 500,
        downnloadCount: 1, // Already downloaded
        downloadedAt: new Date("2023-01-02T12:00:00Z"),
        product: {
          id: "prod2",
          name: "Product Beta (Downloaded)",
          price: 500,
          description: "Beta desc",
          description_fr: "Beta desc FR",
          category: Category.templates,
          createdAt: new Date(),
          updatedAt: new Date(),
          zip_file_name: "beta/beta.zip",
          slug: "product-beta",
          tags: [],
          images: [],
        },
      },
    ],
  },
  {
    id: "order2",
    displayId: "ORD-002",
    amount: 700,
    status: "COMPLETED",
    createdAt: new Date("2023-02-01T10:00:00Z"),
    userId: mockUser.id,
    updatedAt: new Date("2023-02-01T10:00:00Z"),
    stripeCheckoutSessionId: "cs_test_456",
    stripeChargeId: "ch_test_456",
    stripeCustomerId: "cus_test_456",
    items: [
      {
        id: "item2_1",
        orderId: "order2",
        productId: "prod3",
        quantity: 1,
        price: 700,
        downnloadCount: 0,
        downloadedAt: null,
        product: {
          id: "prod3",
          name: "Product Gamma",
          price: 700,
          description: "Gamma desc",
          description_fr: "Gamma desc FR",
          category: Category.stickers,
          createdAt: new Date(),
          updatedAt: new Date(),
          zip_file_name: "gamma/gamma.zip",
          slug: "product-gamma",
          tags: [],
          images: [],
        },
      },
    ],
  },
];

describe("DownloadsPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnDownloadSuccessCallback = undefined; // Reset captured callback
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: mockUser,
    });
    (getUserOrders as jest.Mock).mockResolvedValue(
      JSON.parse(JSON.stringify(mockOrders)),
    ); // Use deep copy for orders

    mockDownloadingItemsState = {};
    // Default mock for handleDownloadBase (the hook's download function)
    // Specific tests will override this implementation.
    mockHandleDownloadBase.mockResolvedValue(undefined);

    // Re-initialize the useProductDownload mock for each test to correctly capture the callback
    (useProductDownload as jest.Mock).mockImplementation(
      (onSuccessCallbackFromComponent) => {
        capturedOnDownloadSuccessCallback = onSuccessCallbackFromComponent;

        return {
          downloadingItems: mockDownloadingItemsState,
          handleDownload: mockHandleDownloadBase,
        };
      },
    );
  });

  test("should show loading state when auth is loading", () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: false,
      isSignedIn: undefined,
      user: null,
    });
    render(<DownloadsPage />);
    expect(screen.getByText("loading")).toBeInTheDocument();
  });

  test("should show sign-in required message when not signed in", () => {
    (useUser as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: false,
      user: null,
    });
    render(<DownloadsPage />);
    expect(screen.getByText("signInRequired")).toBeInTheDocument();
  });

  test("should show no downloads message when no orders are found", async () => {
    (getUserOrders as jest.Mock).mockResolvedValue([]);
    render(<DownloadsPage />);
    await waitFor(() => {
      expect(screen.getByText("noDownloadsTitle")).toBeInTheDocument();
      expect(screen.getByText("noDownloadsMessage")).toBeInTheDocument();
      expect(screen.getByText("goShopping")).toBeInTheDocument();
    });
  });

  test("should handle error when fetching orders", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    (getUserOrders as jest.Mock).mockRejectedValue(
      new Error("Failed to fetch"),
    );
    render(<DownloadsPage />);
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("errorLoading");
      // Fallback UI might show no downloads message
      expect(screen.getByText("noDownloadsTitle")).toBeInTheDocument();
    });
    consoleErrorSpy.mockRestore();
  });

  test("should display orders and downloadable items", async () => {
    render(<DownloadsPage />);
    await waitFor(() => {
      expect(screen.getByTestId("page-title")).toHaveTextContent("title");
      expect(screen.getByTestId("link--account")).toBeInTheDocument(); // Back to dashboard
    });

    expect(screen.getByTestId("accordion-item-order1")).toBeInTheDocument();
    expect(screen.getByText("ORD-001")).toBeInTheDocument();

    const productAlphaItem = screen.getByText("Product Alpha").closest("li");

    expect(productAlphaItem).toBeInTheDocument();
    // Item1_1 is downloadable
    const downloadButtonAlpha = rtlWithin(productAlphaItem!).getByRole(
      "button",
      { name: "Download downloadButton" },
    );

    expect(downloadButtonAlpha).toBeInTheDocument();

    expect(screen.getByText("Product Beta (Downloaded)")).toBeInTheDocument();
    // Item1_2 is already downloaded
    expect(screen.getByText(/downloadedOn/)).toBeInTheDocument();
    expect(screen.getAllByTestId("icon-calendar").length).toBeGreaterThan(0);

    expect(screen.getByTestId("accordion-item-order2")).toBeInTheDocument();
    expect(screen.getByText("ORD-002")).toBeInTheDocument();
    expect(screen.getByText("Product Gamma")).toBeInTheDocument();
    const productGammaItem = screen.getByText("Product Gamma").closest("li");

    expect(productGammaItem).toBeInTheDocument();
    const downloadButtonGamma = rtlWithin(productGammaItem!).getByRole(
      "button",
      { name: "Download downloadButton" },
    );

    expect(downloadButtonGamma).toBeInTheDocument();
  });

  test("should handle successful download", async () => {
    mockHandleDownloadBase.mockImplementation(async (item, orderId) => {
      // Simulate hook's success path
      toast.success("Thank you for downloading!", expect.any(Object));
      if (capturedOnDownloadSuccessCallback) {
        capturedOnDownloadSuccessCallback(item, orderId); // Call the component's success handler
      }

      return Promise.resolve();
    });

    render(<DownloadsPage />);
    await waitFor(() => {
      expect(screen.getByText("Product Alpha")).toBeInTheDocument();
    });

    const productAlphaItemPreClick = screen
      .getByText("Product Alpha")
      .closest("li");
    const downloadButton = rtlWithin(productAlphaItemPreClick!).getByRole(
      "button",
      { name: "Download downloadButton" },
    );

    await user.click(downloadButton);

    expect(mockHandleDownloadBase).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item1_1" }),
      "order1",
    );

    await waitFor(() => {
      const productAlphaItemPostClick = screen
        .getByText("Product Alpha")
        .closest("li");

      expect(productAlphaItemPostClick).toHaveTextContent(/downloadedOn/); // UI updated by callback
      expect(toast.success).toHaveBeenCalledWith(
        "Thank you for downloading!",
        expect.any(Object),
      );
    });
  });

  test("should show spinner when item is downloading", async () => {
    mockDownloadingItemsState = { item1_1: true };
    (useProductDownload as jest.Mock).mockImplementation(() => ({
      downloadingItems: mockDownloadingItemsState,
      handleDownload: mockHandleDownloadBase,
    }));

    render(<DownloadsPage />);

    await waitFor(() => {
      expect(screen.getByText("Product Alpha")).toBeInTheDocument();
    });

    const productAlphaItem = screen.getByText("Product Alpha").closest("li");
    const downloadButton = rtlWithin(productAlphaItem!).getByRole("button", {
      name: "Loading...",
    });

    expect(downloadButton).toBeDisabled();
    expect(
      rtlWithin(downloadButton).getByTestId("spinner"),
    ).toBeInTheDocument();
  });

  test("should handle download failure", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockHandleDownloadBase.mockImplementation(async () => {
      // Simulate hook's failure path
      console.error(
        "Download error:",
        new Error("Simulated internal download error from mock"),
      );
      toast.error("Unable to download file", expect.any(Object));

      // DO NOT call capturedOnDownloadSuccessCallback here
      return Promise.resolve();
    });

    render(<DownloadsPage />);
    await waitFor(() => {
      expect(screen.getByText("Product Alpha")).toBeInTheDocument();
    });

    const productAlphaItem = screen.getByText("Product Alpha").closest("li");
    const downloadButton = rtlWithin(productAlphaItem!).getByRole("button", {
      name: "Download downloadButton",
    });

    await user.click(downloadButton);

    expect(mockHandleDownloadBase).toHaveBeenCalledWith(
      expect.objectContaining({ id: "item1_1" }),
      "order1",
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Unable to download file",
        expect.any(Object),
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Download error:",
        expect.objectContaining({
          message: "Simulated internal download error from mock",
        }),
      );

      const productAlphaItemAfterClick = screen
        .getByText("Product Alpha")
        .closest("li");

      // Crucially, the UI should NOT update to "downloadedOn"
      expect(
        rtlWithin(productAlphaItemAfterClick!).getByRole("button", {
          name: "Download downloadButton",
        }),
      ).toBeInTheDocument();
      expect(
        rtlWithin(productAlphaItemAfterClick!).getByRole("button", {
          name: "Download downloadButton",
        }),
      ).not.toBeDisabled();
      expect(productAlphaItemAfterClick).not.toHaveTextContent(/downloadedOn/);
    });
    consoleErrorSpy.mockRestore();
  });

  test("item already downloaded should show downloaded status", async () => {
    render(<DownloadsPage />);
    await waitFor(() => {
      expect(screen.getByText("Product Beta (Downloaded)")).toBeInTheDocument();
    });

    const downloadedItemEntry = screen
      .getByText("Product Beta (Downloaded)")
      .closest("li");

    expect(downloadedItemEntry).toHaveTextContent(/downloadedOn/);
    // Use rtlWithin for scoped query
    expect(
      rtlWithin(downloadedItemEntry!).queryByRole("button", {
        name: "Download downloadButton",
      }),
    ).not.toBeInTheDocument();
    expect(
      rtlWithin(downloadedItemEntry!).getByTestId("icon-calendar"),
    ).toBeInTheDocument();
  });
});
