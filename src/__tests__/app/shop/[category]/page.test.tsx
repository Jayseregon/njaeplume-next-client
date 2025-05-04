import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

import { Category } from "@/generated/client";
import CategoryPage from "@/app/shop/[category]/page";

// Mock useParams and notFound
jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
  notFound: jest.fn(),
}));

// Mock PageTitle component
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
}));

// Mock CategoryGallery component
jest.mock("@/components/product/CategoryGallery", () => ({
  CategoryGallery: ({ products }: { products: any[] }) => (
    <div data-testid="category-gallery">
      {products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id} data-testid={`product-${product.id}`}>
              {product.name} - ${product.price}
            </li>
          ))}
        </ul>
      )}
    </div>
  ),
}));

// Mock SimpleSpinner component
jest.mock("@/components/root/SimpleSpinner", () => ({
  SimpleSpinner: () => <div data-testid="spinner">Loading spinner</div>,
}));

// Mock getProductsByCategory
const mockGetProductsByCategory = jest.fn();

jest.mock("@/actions/prisma/action", () => ({
  getProductsByCategory: (category: string) =>
    mockGetProductsByCategory(category),
}));

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key, // Simple mock returning the key
}));

// Sample product data for different categories
const mockProductsByCategory = {
  brushes: [
    {
      id: "prod_1",
      name: "Watercolor Brush Set",
      price: 12.99,
      category: Category.brushes,
      // ...other product properties
    },
  ],
  stickers: [
    {
      id: "prod_2",
      name: "Nature Stickers Pack",
      price: 8.99,
      category: Category.stickers,
      // ...other product properties
    },
  ],
  // Define products for other categories as needed
};

// Mock console.error to prevent test output noise
const originalConsoleError = console.error;

describe("Dynamic CategoryPage", () => {
  beforeEach(() => {
    console.error = jest.fn();
    mockGetProductsByCategory.mockReset();
    (notFound as unknown as jest.Mock).mockReset();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it.each(Object.keys(Category))(
    "renders page for valid category: %s",
    async (category) => {
      // Setup mocks for this category
      (useParams as jest.Mock).mockReturnValue({ category });
      mockGetProductsByCategory.mockResolvedValue(
        mockProductsByCategory[
          category as keyof typeof mockProductsByCategory
        ] || [],
      );

      render(<CategoryPage />);

      // Verify the page title uses the category key (mock returns the key)
      expect(screen.getByTestId("page-title")).toHaveTextContent(category);

      // Initially shows loading state with spinner
      expect(screen.getByTestId("spinner")).toBeInTheDocument();

      // After loading completes, should show products or empty state
      await waitFor(() => {
        expect(screen.getByTestId("category-gallery")).toBeInTheDocument();
      });

      // Verify API was called with correct category
      expect(mockGetProductsByCategory).toHaveBeenCalledWith(category);
    },
  );

  it("calls notFound() for invalid category parameter", () => {
    (useParams as jest.Mock).mockReturnValue({ category: "invalid-category" });

    render(<CategoryPage />);

    expect(notFound).toHaveBeenCalled();
  });

  it("handles API errors gracefully", async () => {
    (useParams as jest.Mock).mockReturnValue({ category: "brushes" });
    mockGetProductsByCategory.mockRejectedValue(new Error("API Error"));

    render(<CategoryPage />);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Failed to fetch brushes products:"),
        expect.any(Error),
      );
    });

    // Should still render the page title with the key despite the error
    expect(screen.getByTestId("page-title")).toHaveTextContent("brushes");
  });
});
