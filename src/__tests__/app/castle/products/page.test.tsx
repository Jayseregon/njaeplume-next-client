import { render, screen } from "@testing-library/react";

import { getProducts } from "@/actions/prisma/action";

// Create mock components using jest.fn()
const mockProductsTable = jest.fn(() => (
  <div data-testid="products-table">Products Table Mock</div>
));
const mockPageTitle = jest.fn(() => <h1>Products Management</h1>);
const mockProductEditDialog = jest.fn(() => (
  <div data-testid="product-edit-dialog">Product Edit Dialog Mock</div>
));
const mockErrorDefaultDisplay = jest.fn(() => (
  <div data-testid="error-display">Error Display Mock</div>
));
const mockErrorBoundary = jest.fn(({ children }) => (
  <div data-testid="error-boundary">{children}</div>
));

// Helper function to safely get props from mock call with proper typing
function getMockProps<T>(mockFn: jest.Mock): T {
  if (mockFn.mock.calls.length === 0) {
    return {} as T;
  }

  return mockFn.mock.calls[0][0] as T;
}

// Mock the dependencies
jest.mock("@/actions/prisma/action", () => ({
  getProducts: jest.fn(),
}));

// Mock the ProductsTable component
jest.mock("@/components/castle/ProductsTable", () => ({
  ProductsTable: mockProductsTable,
}));

// Mock PageTitle
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: mockPageTitle,
}));

// Mock ProductEditDialog
jest.mock("@/components/castle/ProductEditDialog", () => ({
  ProductEditDialog: mockProductEditDialog,
}));

// Mock ErrorBoundary - Fixed path
jest.mock("@/components/root/ErrorBoundary", () => ({
  __esModule: true,
  default: mockErrorBoundary,
}));

// Mock ErrorDefaultDisplay - Fixed path
jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: mockErrorDefaultDisplay,
}));

describe("ProductsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls getProducts() and renders the page", async () => {
    // Setup mocks
    const mockProducts = [
      {
        id: "product1",
        name: "Test Product",
        price: 19.99,
        category: "PRESET",
        description: "A test product",
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "test-product",
        zip_file_name: "test.zip",
        tags: [],
        images: [],
      },
    ];

    (getProducts as jest.Mock).mockResolvedValue(mockProducts);

    // Import page component
    const Page = (await import("@/app/castle/products/page")).default;

    // Render the page
    render(await Page());

    // Assertions
    expect(getProducts).toHaveBeenCalled();
    expect(screen.getByText("Products Management")).toBeInTheDocument();
    expect(screen.getByTestId("products-table")).toBeInTheDocument();
    expect(screen.getByTestId("product-edit-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();

    // Check component props
    const productsTableProps = getMockProps<{ products: any[] }>(
      mockProductsTable,
    );

    expect(productsTableProps).toEqual({ products: mockProducts });

    const pageTitleProps = getMockProps<{ title: string }>(mockPageTitle);

    expect(pageTitleProps).toEqual({ title: "Products Management" });

    // Verify ErrorBoundary was called with correct fallback
    expect(mockErrorBoundary.mock.calls[0][0].fallback).toBeDefined();
  });

  it("renders the page with empty products array", async () => {
    // Setup mock to return empty array
    (getProducts as jest.Mock).mockResolvedValue([]);

    const Page = (await import("@/app/castle/products/page")).default;

    // Render the page
    render(await Page());

    // First ensure mock was called, then check the argument
    expect(mockProductsTable).toHaveBeenCalled();
    const props = getMockProps<{ products: any[] }>(mockProductsTable);

    expect(props).toEqual({ products: [] });
  });

  it("handles error from getProducts", async () => {
    // Setup mock to throw error
    const mockError = new Error("Failed to fetch products");

    (getProducts as jest.Mock).mockRejectedValue(mockError);

    const Page = (await import("@/app/castle/products/page")).default;

    // Expect the render to throw an error
    await expect(Page()).rejects.toThrow("Failed to fetch products");
  });

  it("sets up ErrorBoundary with ErrorDefaultDisplay as fallback", async () => {
    // Setup mock
    (getProducts as jest.Mock).mockResolvedValue([]);

    const Page = (await import("@/app/castle/products/page")).default;

    // Render the page
    render(await Page());

    // Get the fallback prop passed to ErrorBoundary
    const errorBoundaryProps = mockErrorBoundary.mock.calls[0][0];
    const fallbackElement = errorBoundaryProps.fallback;

    // Render the fallback element to verify it's an ErrorDefaultDisplay
    render(fallbackElement);
    expect(screen.getByTestId("error-display")).toBeInTheDocument();
  });
});
