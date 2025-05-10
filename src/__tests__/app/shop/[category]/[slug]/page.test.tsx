import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";

import { Category } from "@/generated/client";
import { generateMetadata } from "@/app/shop/[category]/[slug]/page";
import ProductPage from "@/app/shop/[category]/[slug]/page";
import { getProductBySlug } from "@/actions/prisma/action";

// Mock implementations - must be after imports
// Mock Next.js notFound
jest.mock("next/navigation", () => ({
  notFound: jest.fn(),
}));

// Mock the ProductDetail component
jest.mock("@/components/product/ProductDetail", () => ({
  ProductDetail: ({ product }: { product: any }) => (
    <div data-testid="product-detail">
      <h1 data-testid="product-name">{product.name}</h1>
      <p data-testid="product-price">${product.price}</p>
      <p data-testid="product-category">{product.category}</p>
    </div>
  ),
}));

// Mock the getProductBySlug function
jest.mock("@/actions/prisma/action", () => ({
  getProductBySlug: jest.fn(),
}));

// Sample product data
const mockProduct = {
  id: "prod_123",
  name: "Sample Product",
  price: 29.99,
  description:
    "A sample product description that is long enough for testing metadata.",
  category: Category.brushes,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
  zip_file_name: "sample.zip",
  slug: "sample-product",
  tags: [],
  images: [],
};

describe("Dynamic Product Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getProductBySlug as jest.Mock).mockResolvedValue(mockProduct);
  });

  describe("Page Component", () => {
    it("renders the product detail for valid category and slug", async () => {
      // Mock params with a valid category and slug
      const params = Promise.resolve({
        category: "brushes",
        slug: "sample-product",
      });

      const page = await ProductPage({ params });

      render(page);

      expect(screen.getByTestId("product-detail")).toBeInTheDocument();
      expect(screen.getByTestId("product-name")).toHaveTextContent(
        "Sample Product",
      );
      expect(screen.getByTestId("product-price")).toHaveTextContent("$29.99");
      expect(screen.getByTestId("product-category")).toHaveTextContent(
        "brushes",
      );

      expect(getProductBySlug).toHaveBeenCalledWith("sample-product");
    });

    it("calls notFound() for invalid category", async () => {
      // Mock params with an invalid category
      const params = Promise.resolve({
        category: "invalid-category",
        slug: "sample-product",
      });

      await ProductPage({ params });
      expect(notFound).toHaveBeenCalled();
    });

    it("calls notFound() when product is not found", async () => {
      // Mock product not found
      (getProductBySlug as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({
        category: "brushes",
        slug: "nonexistent-product",
      });

      await ProductPage({ params });
      expect(notFound).toHaveBeenCalled();
    });

    it("calls notFound() when product category does not match URL category", async () => {
      // Mock a product that has a different category than the URL
      const params = Promise.resolve({
        category: "stickers", // URL says stickers
        slug: "sample-product",
      });

      // But the product is a brush
      (getProductBySlug as jest.Mock).mockResolvedValue({
        ...mockProduct,
        category: Category.brushes,
      });

      await ProductPage({ params });
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("generateMetadata", () => {
    it("returns correct metadata for a valid product", async () => {
      const params = Promise.resolve({
        category: "brushes",
        slug: "sample-product",
      });

      const metadata = await generateMetadata({ params });

      expect(metadata).toEqual({
        title: "Sample Product | Brushes",
        description:
          "A sample product description that is long enough for testing metadata.",
      });
    });

    it('returns "Product Not Found" title when product is not found', async () => {
      (getProductBySlug as jest.Mock).mockResolvedValue(null);

      const params = Promise.resolve({
        category: "brushes",
        slug: "nonexistent-product",
      });

      const metadata = await generateMetadata({ params });

      expect(metadata).toEqual({
        title: "Product Not Found",
      });
    });

    it('returns "Category Not Found" title for invalid category', async () => {
      const params = Promise.resolve({
        category: "invalid-category",
        slug: "sample-product",
      });

      const metadata = await generateMetadata({ params });

      expect(metadata).toEqual({
        title: "Category Not Found",
      });
    });

    it("correctly formats category name in the title", async () => {
      // Test with different categories to ensure capitalization works
      const categories = [
        { param: "brushes", expected: "Brushes" },
        { param: "stickers", expected: "Stickers" },
        { param: "templates", expected: "Templates" },
        { param: "planners", expected: "Planners" },
      ];

      for (const { param, expected } of categories) {
        const params = Promise.resolve({
          category: param,
          slug: "sample-product",
        });

        const metadata = await generateMetadata({ params });

        expect(metadata.title).toBe(`Sample Product | ${expected}`);
      }
    });

    it("truncates description to 160 characters for SEO", async () => {
      // Create a product with a very long description
      const longDesc =
        "This is a very long description that exceeds 160 characters. ".repeat(
          5,
        );

      (getProductBySlug as jest.Mock).mockResolvedValue({
        ...mockProduct,
        description: longDesc,
      });

      const params = Promise.resolve({
        category: "brushes",
        slug: "sample-product",
      });

      const metadata = await generateMetadata({ params });

      expect(metadata.description?.length).toBeLessThanOrEqual(160);
      expect(metadata.description).toBe(longDesc.substring(0, 160));
    });
  });
});
