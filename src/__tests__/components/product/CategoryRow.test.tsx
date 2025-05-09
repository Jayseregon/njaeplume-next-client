import React from "react";
import { render, screen } from "@testing-library/react";

import { CategoryRow } from "@/src/components/product/CategoryRow";
import { Category } from "@/generated/client";
import { getNavItemByKey } from "@/src/config/site";

// Mock dependencies
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@/src/components/product/ProductCard", () => ({
  ProductCard: ({ product }: any) => (
    <div data-product-id={product.id} data-testid="product-card">
      {product.name}
    </div>
  ),
}));

jest.mock("@/src/config/site", () => ({
  getNavItemByKey: jest.fn().mockImplementation((key) => ({
    key: key,
    label: `${key} label`,
    href: `/shop/${key}`,
  })),
}));

// Mock LucideReact icon
jest.mock("lucide-react", () => ({
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
}));

// Create mock products
const mockProducts = [
  {
    id: "product-1",
    name: "Test Product 1",
    price: 19.99,
    description: "Description 1",
    description_fr: "Description FR 1",
    category: Category.brushes,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-product-1.zip",
    slug: "test-product-1",
    tags: [],
    images: [],
  },
  {
    id: "product-2",
    name: "Test Product 2",
    price: 29.99,
    description: "Description 2",
    description_fr: "Description FR 2",
    category: Category.brushes,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-product-2.zip",
    slug: "test-product-2",
    tags: [],
    images: [],
  },
  {
    id: "product-3",
    name: "Test Product 3",
    price: 39.99,
    description: "Description 3",
    description_fr: "Description FR 3",
    category: Category.brushes,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-product-3.zip",
    slug: "test-product-3",
    tags: [],
    images: [],
  },
  {
    id: "product-4",
    name: "Test Product 4",
    price: 49.99,
    description: "Description 4",
    description_fr: "Description FR 4",
    category: Category.brushes,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-product-4.zip",
    slug: "test-product-4",
    tags: [],
    images: [],
  },
  {
    id: "product-5",
    name: "Test Product 5", // This should not be rendered due to slice(0, 4)
    price: 59.99,
    description: "Description 5",
    description_fr: "Description FR 5",
    category: Category.brushes,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-product-5.zip",
    slug: "test-product-5",
    tags: [],
    images: [],
  },
];

describe("CategoryRow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders category title correctly", () => {
    render(<CategoryRow category={Category.brushes} products={mockProducts} />);

    // Check for the category title
    expect(screen.getByText("categoryTitles.brushes")).toBeInTheDocument();
  });

  it("limits product display to maximum of 4 products", () => {
    render(<CategoryRow category={Category.brushes} products={mockProducts} />);

    // Should only show 4 products even though 5 are provided
    const productCards = screen.getAllByTestId("product-card");

    expect(productCards).toHaveLength(4);

    // Verify specific products are displayed
    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    expect(screen.getByText("Test Product 3")).toBeInTheDocument();
    expect(screen.getByText("Test Product 4")).toBeInTheDocument();

    // The fifth product should not be displayed
    expect(screen.queryByText("Test Product 5")).not.toBeInTheDocument();
  });

  it("renders a 'See All' link with correct href", () => {
    render(<CategoryRow category={Category.brushes} products={mockProducts} />);

    // Check for the See All link
    const seeAllLink = screen.getByText("seeAllButton.brushes");

    expect(seeAllLink).toBeInTheDocument();

    // Check link has correct href
    expect(seeAllLink.closest("a")).toHaveAttribute("href", "/shop/brushes");

    // Verify getNavItemByKey was called with correct category
    expect(getNavItemByKey).toHaveBeenCalledWith(Category.brushes);
  });

  it("includes arrow icon in the See All link", () => {
    render(<CategoryRow category={Category.brushes} products={mockProducts} />);

    // Check for the arrow icon
    expect(screen.getByTestId("arrow-right-icon")).toBeInTheDocument();
  });

  it("works with an empty products array", () => {
    render(<CategoryRow category={Category.brushes} products={[]} />);

    // Should not crash but should not show any products
    const productCards = screen.queryAllByTestId("product-card");

    expect(productCards).toHaveLength(0);

    // The link and title should still be present
    expect(screen.getByText("categoryTitles.brushes")).toBeInTheDocument();
    expect(screen.getByText("seeAllButton.brushes")).toBeInTheDocument();
  });

  it("renders correctly with different category", () => {
    render(
      <CategoryRow
        category={Category.stickers}
        products={mockProducts.slice(0, 2)}
      />,
    );

    // Title should use the stickers category
    expect(screen.getByText("categoryTitles.stickers")).toBeInTheDocument();

    // See All link should use the stickers category
    const seeAllLink = screen.getByText("seeAllButton.stickers");

    expect(seeAllLink.closest("a")).toHaveAttribute("href", "/shop/stickers");

    // Verify getNavItemByKey was called with stickers category
    expect(getNavItemByKey).toHaveBeenCalledWith(Category.stickers);
  });

  it("passes correct product data to ProductCard components", () => {
    render(
      <CategoryRow
        category={Category.brushes}
        products={mockProducts.slice(0, 2)}
      />,
    );

    // Verify product IDs were passed correctly
    const productCards = screen.getAllByTestId("product-card");

    expect(productCards[0]).toHaveAttribute("data-product-id", "product-1");
    expect(productCards[1]).toHaveAttribute("data-product-id", "product-2");
  });
});
