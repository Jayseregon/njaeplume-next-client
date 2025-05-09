import React from "react";
import { render, screen } from "@testing-library/react";

import { CategoryGallery } from "@/src/components/product/CategoryGallery";
import { Category } from "@/generated/client";

// Mock dependencies
jest.mock("@/src/components/root/ErrorBoundary", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => <div data-testid="error-default-display" />,
}));

jest.mock("@/src/components/product/ProductCard", () => ({
  ProductCard: ({ product, onWishlistChange }: any) => (
    <div
      data-has-wishlist-callback={Boolean(onWishlistChange).toString()}
      data-product-category={product.category}
      data-product-id={product.id}
      data-product-name={product.name}
      data-testid="product-card"
      role="button"
      tabIndex={0}
      onClick={() => {
        if (onWishlistChange) {
          onWishlistChange(product.id);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          if (onWishlistChange) {
            onWishlistChange(product.id);
          }
        }
      }}
    >
      ProductCard: {product.name}
    </div>
  ),
}));

jest.mock("@/src/components/product/FreebieCard", () => ({
  FreebieCard: ({ product }: any) => (
    <div
      data-product-category={product.category}
      data-product-id={product.id}
      data-product-name={product.name}
      data-testid="freebie-card"
    >
      FreebieCard: {product.name}
    </div>
  ),
}));

// Create mock products with different categories
const mockProducts = [
  {
    id: "product-1",
    name: "Test Brush Pack",
    price: 19.99,
    description: "Description for brush pack",
    description_fr: "Description FR for brush pack",
    category: Category.brushes,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-brush-pack.zip",
    slug: "test-brush-pack",
    tags: [],
    images: [],
  },
  {
    id: "product-2",
    name: "Test Sticker Pack",
    price: 9.99,
    description: "Description for sticker pack",
    description_fr: "Description FR for sticker pack",
    category: Category.stickers,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-sticker-pack.zip",
    slug: "test-sticker-pack",
    tags: [],
    images: [],
  },
  {
    id: "product-3",
    name: "Test Freebie",
    price: 0,
    description: "Description for freebie",
    description_fr: "Description FR for freebie",
    category: Category.freebies,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-15"),
    zip_file_name: "test-freebie.zip",
    slug: "test-freebie",
    tags: [],
    images: [],
  },
];

describe("CategoryGallery", () => {
  it("renders loading spinner when products array is empty", () => {
    render(<CategoryGallery products={[]} />);

    // Check for loading spinner
    const loadingSpinner = screen.getByRole("status", { hidden: true });

    expect(loadingSpinner).toHaveClass("animate-spin");
  });

  it("renders products in a grid layout", () => {
    render(<CategoryGallery products={mockProducts} />);

    // Check for grid container
    const grid = screen.getByTestId("error-boundary").firstChild;

    expect(grid).toHaveClass("grid");

    // Check that all products are rendered
    expect(screen.getAllByTestId(/product-card|freebie-card/)).toHaveLength(
      mockProducts.length,
    );
  });

  it("renders ProductCard for non-freebies when showAsFreebies is false", () => {
    render(<CategoryGallery products={mockProducts} showAsFreebies={false} />);

    // Check that brushes and stickers are rendered as ProductCard
    const productCards = screen.getAllByTestId("product-card");

    expect(productCards).toHaveLength(2);

    // Check specific products
    expect(
      screen.getByText("ProductCard: Test Brush Pack"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ProductCard: Test Sticker Pack"),
    ).toBeInTheDocument();

    // Check that freebies are rendered as FreebieCard
    const freebieCards = screen.getAllByTestId("freebie-card");

    expect(freebieCards).toHaveLength(1);
    expect(screen.getByText("FreebieCard: Test Freebie")).toBeInTheDocument();
  });

  it("renders FreebieCard for all products when showAsFreebies is true", () => {
    render(<CategoryGallery products={mockProducts} showAsFreebies={true} />);

    // Check that all products are rendered as FreebieCard
    const freebieCards = screen.getAllByTestId("freebie-card");

    expect(freebieCards).toHaveLength(mockProducts.length);

    // Verify no ProductCard components
    expect(screen.queryByTestId("product-card")).not.toBeInTheDocument();
  });

  it("renders FreebieCard for products with 'freebies' category regardless of showAsFreebies prop", () => {
    render(<CategoryGallery products={mockProducts} showAsFreebies={false} />);

    // Check that the freebie product is rendered as FreebieCard
    const freebieProduct = screen.getByTestId("freebie-card");

    expect(freebieProduct).toHaveAttribute("data-product-category", "freebies");
    expect(screen.getByText("FreebieCard: Test Freebie")).toBeInTheDocument();
  });

  it("passes onWishlistItemRemoved callback to ProductCard components", () => {
    const mockOnWishlistItemRemoved = jest.fn();

    render(
      <CategoryGallery
        products={mockProducts}
        onWishlistItemRemoved={mockOnWishlistItemRemoved}
      />,
    );

    // Check that ProductCard components have the callback
    const productCards = screen.getAllByTestId("product-card");

    productCards.forEach((card) => {
      expect(card).toHaveAttribute("data-has-wishlist-callback", "true");
    });

    // Trigger the callback from the first card
    productCards[0].click();

    // Check if callback was called with correct product ID
    expect(mockOnWishlistItemRemoved).toHaveBeenCalledWith("product-1");
  });

  it("does not pass onWishlistItemRemoved to FreebieCard components", () => {
    // Using only freebies category products
    const freebieMockProducts = [
      {
        ...mockProducts[2],
        id: "freebie-1",
        name: "Another Freebie",
      },
    ];

    const mockOnWishlistItemRemoved = jest.fn();

    render(
      <CategoryGallery
        products={freebieMockProducts}
        onWishlistItemRemoved={mockOnWishlistItemRemoved}
      />,
    );

    // FreebieCard doesn't receive the callback in the implementation,
    // so clicking it shouldn't trigger the callback
    const freebieCard = screen.getByTestId("freebie-card");

    freebieCard.click();

    // Callback should not be called
    expect(mockOnWishlistItemRemoved).not.toHaveBeenCalled();
  });

  it("works with a mix of different category products", () => {
    // Create products with all categories
    const mixedProducts = [
      mockProducts[0], // brushes
      mockProducts[1], // stickers
      mockProducts[2], // freebies
      {
        id: "product-4",
        name: "Test Template",
        price: 29.99,
        description: "Description for template",
        description_fr: "Description FR for template",
        category: Category.templates,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-15"),
        zip_file_name: "test-template.zip",
        slug: "test-template",
        tags: [],
        images: [],
      },
      {
        id: "product-5",
        name: "Test Planner",
        price: 14.99,
        description: "Description for planner",
        description_fr: "Description FR for planner",
        category: Category.planners,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-15"),
        zip_file_name: "test-planner.zip",
        slug: "test-planner",
        tags: [],
        images: [],
      },
    ];

    render(<CategoryGallery products={mixedProducts} />);

    // Check counts of each card type
    const productCards = screen.getAllByTestId("product-card");

    expect(productCards).toHaveLength(4); // All categories except freebies

    const freebieCards = screen.getAllByTestId("freebie-card");

    expect(freebieCards).toHaveLength(1); // Only freebies category
  });
});
