import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { Category } from "@/generated/client";
import FreebiesPage from "@/app/shop/freebies/page";

// Mock the PageTitle component
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
}));

// Mock the CategoryGallery component with special attention to showAsFreebies prop
jest.mock("@/components/product/CategoryGallery", () => ({
  CategoryGallery: ({
    products,
    showAsFreebies,
  }: {
    products: any[];
    showAsFreebies?: boolean;
  }) => (
    <div
      data-show-as-freebies={showAsFreebies ? "true" : "false"}
      data-testid="category-gallery"
    >
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id} data-testid={`product-${product.id}`}>
              {product.name} - {showAsFreebies ? "FREE" : `$${product.price}`}
            </li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

// Mock the action function
const mockGetProductsByCategory = jest.fn();

jest.mock("@/actions/prisma/action", () => ({
  getProductsByCategory: (category: string) =>
    mockGetProductsByCategory(category),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key, // Simple mock returning the key
}));

// Sample freebie product data
const mockProducts = [
  {
    id: "prod_1",
    name: "Free Watercolor Brush",
    price: 0,
    description: "A free watercolor brush for digital art",
    category: Category.freebies,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
    zip_file_name: "free_watercolor_brush.zip",
    slug: "free-watercolor-brush",
    tags: [],
    images: [],
  },
  {
    id: "prod_2",
    name: "Free Sticker Pack",
    price: 0,
    description: "Free digital stickers for your projects",
    category: Category.freebies,
    createdAt: new Date("2023-01-02"),
    updatedAt: new Date("2023-01-02"),
    zip_file_name: "free_stickers.zip",
    slug: "free-sticker-pack",
    tags: [],
    images: [],
  },
];

// Mock console.error to prevent test output noise
const originalConsoleError = console.error;

describe("FreebiesPage", () => {
  beforeEach(() => {
    console.error = jest.fn();
    mockGetProductsByCategory.mockReset();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("renders the page title correctly using translation key", async () => {
    mockGetProductsByCategory.mockResolvedValue(mockProducts);

    render(<FreebiesPage />);
    // Check PageTitle receives the correct key
    expect(screen.getByTestId("page-title")).toHaveTextContent("title");
  });

  it("renders loading state initially with empty products", async () => {
    // Setup a delayed promise to simulate loading
    mockGetProductsByCategory.mockImplementation(
      () =>
        new Promise((resolve) => setTimeout(() => resolve(mockProducts), 100)),
    );

    render(<FreebiesPage />);

    // Initially, products array should be empty (loading state)
    expect(screen.getByTestId("category-gallery")).toHaveTextContent(
      "No products found",
    );

    // After data loads, products should appear
    await waitFor(() => {
      expect(screen.getByTestId("product-prod_1")).toBeInTheDocument();
    });
  });

  it("displays freebies correctly when loaded", async () => {
    mockGetProductsByCategory.mockResolvedValue(mockProducts);

    render(<FreebiesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("product-prod_1")).toHaveTextContent(
        "Free Watercolor Brush",
      );
      expect(screen.getByTestId("product-prod_2")).toHaveTextContent(
        "Free Sticker Pack",
      );
    });
  });

  it("passes showAsFreebies prop to CategoryGallery", async () => {
    mockGetProductsByCategory.mockResolvedValue(mockProducts);

    render(<FreebiesPage />);

    await waitFor(() => {
      const gallery = screen.getByTestId("category-gallery");

      expect(gallery).toHaveAttribute("data-show-as-freebies", "true");
    });
  });

  it("handles error when products fail to load", async () => {
    mockGetProductsByCategory.mockRejectedValue(new Error("Failed to fetch"));

    render(<FreebiesPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch products"),
        expect.any(Error),
      );
    });

    expect(screen.getByTestId("category-gallery")).toHaveTextContent(
      "No products found",
    );
  });

  it("calls getProductsByCategory with correct category", async () => {
    mockGetProductsByCategory.mockResolvedValue(mockProducts);

    render(<FreebiesPage />);

    await waitFor(() => {
      expect(mockGetProductsByCategory).toHaveBeenCalledWith("freebies");
    });
  });
});
