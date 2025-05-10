import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import { ProductDetail } from "@/src/components/product/ProductDetail";
import { formatPrice } from "@/src/lib/utils";
import { Category } from "@/generated/client";

// Suppress specific console errors during tests
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    // Ignore specific Next.js Image attribute warnings - check if args[0] is a string first
    if (
      typeof args[0] === "string" &&
      args[0].includes("Received `true` for a non-boolean attribute")
    ) {
      return;
    }

    // More accurately identify and suppress React act() warnings
    if (typeof args[0] === "string") {
      const errorMessage = args[0];

      // Match the exact act warning pattern to avoid catching other errors
      if (
        errorMessage.includes(
          "An update to ProductDetail inside a test was not wrapped in act",
        ) ||
        errorMessage.includes(
          "When testing, code that causes React state updates should be wrapped into act",
        )
      ) {
        return;
      }
    }

    // Let other console errors through
    originalConsoleError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock dependencies
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // Convert boolean attributes to strings to avoid React warnings
    const imgProps = { ...props };

    // Handle boolean attributes properly
    if (typeof imgProps.fill === "boolean") {
      imgProps.fill = imgProps.fill.toString();
    }

    if (typeof imgProps.priority === "boolean") {
      imgProps.priority = imgProps.priority.toString();
    }

    return <img alt={props.alt} data-src={props.src} {...imgProps} />;
  },
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn().mockReturnValue({ isSignedIn: false }),
}));

jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("@/src/actions/prisma/action", () => ({
  addToWishlist: jest.fn().mockResolvedValue(true),
  removeFromWishlist: jest.fn().mockResolvedValue(true),
  isProductInWishlist: jest.fn().mockResolvedValue(false),
}));

// Create a more robust mock for CartStoreProvider
jest.mock("@/providers/CartStoreProvider", () => {
  // Create actual mock functions so they can be called
  const addToCartMock = jest.fn();
  const toggleCartMock = jest.fn();

  return {
    useCartStore: jest.fn().mockImplementation((selector) => {
      // If selector is a function (as in the component), call it with our mock state
      if (typeof selector === "function") {
        const mockState = {
          addToCart: addToCartMock,
          toggleCart: toggleCartMock,
          // Other state properties that might be needed
          items: [],
          isOpen: false,
          totalItems: 0,
          totalPrice: 0,
        };

        return selector(mockState);
      }

      // Otherwise return our mock functions directly (for tests)
      return {
        addToCart: addToCartMock,
        toggleCart: toggleCartMock,
      };
    }),
  };
});

jest.mock("next-intl", () => {
  // Create a mockT function that returns meaningful text based on the key
  const mockT = (key: string, params?: Record<string, any>) => {
    // Map specific keys to expected text outputs
    const translations: Record<string, string> = {
      addToCartButton: "Add to Cart",
      "backButton.stickers": "Back to Stickers",
      "backButton.brushes": "Back to Brushes",
      "backButton.templates": "Back to Templates",
      "backButton.planners": "Back to Planners",
      imageLoadError: "Failed to load image",
      prevImageAria: "Previous image",
      nextImageAria: "Next image",
      thumbnailAria: "View thumbnail {index}",
    };

    const result = translations[key] || key;

    if (params) {
      // Handle parameter replacement
      let processed = result;

      Object.entries(params).forEach(([paramKey, value]) => {
        processed = processed.replace(`{${paramKey}}`, String(value));
      });

      return processed;
    }

    return result;
  };

  // Add rich method to handle components in translations
  mockT.rich = (key: string, params?: Record<string, any>) => {
    return mockT(key, params);
  };

  // Add markup method
  mockT.markup = (key: string) => key;

  // Add raw method to return arrays for specs
  mockT.raw = (key: string) => {
    if (key.includes("specItems")) {
      return ["Item 1", "Item 2", "Item 3"];
    }

    return key;
  };

  // Create a namespace-aware translation function
  const getNamespacedT = (namespace: string) => {
    return (key: string, params?: Record<string, any>) => {
      // For Wishlist namespace, handle special translations
      if (namespace === "Wishlist") {
        const wishlistTranslations: Record<string, string> = {
          addToWishlist: "Add to Wishlist",
          removeFromWishlist: "Remove from Wishlist",
          added: "{productName} added to your wishlist!",
          removed: "{productName} removed from your wishlist.",
          error: "Failed to update wishlist. Please try again.",
          signInRequired: "Please sign in to manage your wishlist.",
        };

        const result = wishlistTranslations[key] || key;

        if (params) {
          let processed = result;

          Object.entries(params).forEach(([paramKey, value]) => {
            processed = processed.replace(`{${paramKey}}`, String(value));
          });

          return processed;
        }

        return result;
      }

      // Handle ProductCard namespace
      if (namespace === "ProductCard") {
        const cardTranslations: Record<string, string> = {
          addToCartSuccess: "{productName} has been added to your cart.",
        };

        const result = cardTranslations[key] || key;

        if (params) {
          let processed = result;

          Object.entries(params).forEach(([value]) => {
            processed = processed.replace(`{paramKey}`, String(value));
          });

          return processed;
        }

        return result;
      }

      // For other namespaces, use the general mockT function
      return mockT(key, params);
    };
  };

  // Define TranslationFunction interface to allow adding methods to functions
  interface TranslationFunction {
    (key: string, params?: Record<string, any>): string;
    rich: (key: string, params?: Record<string, any>) => any;
    markup: (key: string) => string;
    raw: (key: string) => string | string[];
  }

  // Modify the useTranslations implementation
  return {
    useLocale: jest.fn().mockReturnValue("en"),
    useTranslations: jest.fn().mockImplementation((namespace: string) => {
      const namespacedT = getNamespacedT(namespace) as TranslationFunction;

      // Add the same methods as the original mockT
      namespacedT.rich = mockT.rich;
      namespacedT.markup = mockT.markup;
      namespacedT.raw = mockT.raw;

      return namespacedT;
    }),
    useFormatter: jest.fn().mockReturnValue({
      dateTime: jest.fn().mockReturnValue("Jan 1, 2023"),
      number: jest.fn().mockReturnValue("1,000"),
    }),
  };
});

// Mock product data
const mockProduct = {
  id: "product-123",
  name: "Test Product",
  price: 19.99,
  description: "This is a test description",
  description_fr: "Ceci est une description de test",
  category: Category.stickers,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-15"),
  zip_file_name: "test-product.zip",
  slug: "test-product",
  tags: [{ id: "tag1", name: "Test Tag", slug: "test-tag" }],
  images: [
    {
      id: "img1",
      productId: "product-123",
      url: "image1.jpg",
      alt_text: "Test Image 1",
    },
    {
      id: "img2",
      productId: "product-123",
      url: "image2.jpg",
      alt_text: "Test Image 2",
    },
  ],
};

// Test suite
describe("ProductDetail", () => {
  // Reset mocks before each test
  beforeEach(async () => {
    jest.clearAllMocks();
    // Set environment variable for tests
    process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL =
      "https://test-cdn.bunny.net";

    // Ensure isProductInWishlist resolves synchronously to minimize act warnings
    require("@/src/actions/prisma/action").isProductInWishlist.mockImplementation(
      () => {
        return Promise.resolve(false);
      },
    );

    // We're removing the useEffect mock as it causes infinite re-renders
  });

  // Create a wrapper component to provide test context
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return children;
  };

  it("renders product information correctly", () => {
    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Check product name - use getAllByText since it appears in both mobile and desktop views
    const productNames = screen.getAllByText("Test Product");

    expect(productNames.length).toBeGreaterThan(0);

    // Check price formatting - use getAllByText since price appears twice (mobile and desktop)
    const prices = screen.getAllByText(formatPrice(19.99));

    expect(prices.length).toBeGreaterThan(0);

    // Check description
    expect(screen.getByText("This is a test description")).toBeInTheDocument();

    // Check back button with correct category
    expect(screen.getByText("Back to Stickers")).toBeInTheDocument();
  });

  it("renders product images and navigation controls", () => {
    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Check main image is rendered - use a more specific selector
    const images = screen.getAllByAltText("Test Image 1");
    const mainImage = images.find((img) =>
      img.className.includes("object-contain"),
    );

    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute(
      "data-src",
      "https://test-cdn.bunny.net/image1.jpg",
    );

    // Check navigation buttons exist
    const prevButton = screen.getByLabelText("Previous image");
    const nextButton = screen.getByLabelText("Next image");

    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it("navigates between images when clicking navigation buttons", async () => {
    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Initial image - use more specific selector to get the main image
    const initialImages = screen.getAllByAltText("Test Image 1");
    const mainImage = initialImages.find((img) =>
      img.className.includes("object-contain"),
    );

    expect(mainImage).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByLabelText("Next image");

    fireEvent.click(nextButton);

    // Should now show the second image
    await waitFor(() => {
      const images = screen.getAllByRole("img");
      const updatedMainImage = images.find(
        (img) =>
          img.getAttribute("alt") === "Test Image 2" &&
          img.className.includes("object-contain"),
      );

      expect(updatedMainImage).toBeInTheDocument();
    });

    // Click prev button
    const prevButton = screen.getByLabelText("Previous image");

    fireEvent.click(prevButton);

    // Should go back to the first image
    await waitFor(() => {
      const images = screen.getAllByRole("img");
      const returnedMainImage = images.find(
        (img) =>
          img.getAttribute("alt") === "Test Image 1" &&
          img.className.includes("object-contain"),
      );

      expect(returnedMainImage).toBeInTheDocument();
    });
  });

  it("does not render navigation controls for products with only one image", () => {
    const singleImageProduct = {
      ...mockProduct,
      images: [
        {
          id: "img1",
          productId: "product-123",
          url: "image1.jpg",
          alt_text: "Test Image 1",
        },
      ],
    };

    render(
      <TestWrapper>
        <ProductDetail product={singleImageProduct} />
      </TestWrapper>,
    );

    // Navigation buttons should not exist
    expect(screen.queryByLabelText("Previous image")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Next image")).not.toBeInTheDocument();
  });

  it("adds product to cart when clicking the Add to Cart button", async () => {
    const user = userEvent.setup();

    // Get direct access to the mock implementation's functions
    const cartStore = require("@/providers/CartStoreProvider");
    const addToCartMock = jest.fn();
    const toggleCartMock = jest.fn();

    // Update the mock implementation for this specific test
    cartStore.useCartStore.mockImplementation(
      (
        selector: (arg0: {
          addToCart: jest.Mock<any, any, any>;
          toggleCart: jest.Mock<any, any, any>;
          items: never[];
          isOpen: boolean;
          totalItems: number;
          totalPrice: number;
        }) => any,
      ) => {
        if (typeof selector === "function") {
          return selector({
            addToCart: addToCartMock,
            toggleCart: toggleCartMock,
            items: [],
            isOpen: false,
            totalItems: 0,
            totalPrice: 0,
          });
        }

        return { addToCart: addToCartMock, toggleCart: toggleCartMock };
      },
    );

    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Find Add to Cart button by its exact text
    const addToCartButtons = screen.getAllByText("Add to Cart");

    expect(addToCartButtons.length).toBeGreaterThan(0);

    // Click the first Add to Cart button
    await user.click(addToCartButtons[0]);

    // Verify toast was called
    expect(toast.info).toHaveBeenCalled();

    // Also verify our addToCart mock was called with the product
    expect(addToCartMock).toHaveBeenCalledWith(mockProduct);

    // Optionally check if toggleCart is called after the timeout
    // We would need to mock timers for this, but it might be overkill
  });

  it("does not show wishlist button when user is not signed in", () => {
    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Heart button should not be present
    const heartButton = screen.queryByTitle("Add to Wishlist");

    expect(heartButton).not.toBeInTheDocument();
  });

  it("shows wishlist button when user is signed in", () => {
    // Mock signed-in user
    require("@clerk/nextjs").useUser.mockReturnValue({ isSignedIn: true });

    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Get the wishlist button by its title attribute
    const heartButton = screen.getByTitle("Add to Wishlist");

    expect(heartButton).toBeInTheDocument();
  });

  it("toggles wishlist status when heart button is clicked", async () => {
    // Clear previous mock implementations
    jest.clearAllMocks();

    // Create specific mock implementations for this test
    const mockAddToWishlistFn = jest.fn().mockResolvedValue(true);
    const mockRemoveFromWishlistFn = jest.fn().mockResolvedValue(true);
    const mockIsProductInWishlistFn = jest.fn().mockResolvedValue(false);

    // Directly set mocks without calling jest.mock again (which won't work here)
    const prismaActions = require("@/src/actions/prisma/action");

    prismaActions.addToWishlist = mockAddToWishlistFn;
    prismaActions.removeFromWishlist = mockRemoveFromWishlistFn;
    prismaActions.isProductInWishlist = mockIsProductInWishlistFn;

    // Mock signed-in user
    require("@clerk/nextjs").useUser.mockReturnValue({ isSignedIn: true });

    // First render with initial wishlist state
    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Get the wishlist button by its title attribute
    const heartButton = screen.getByTitle("Add to Wishlist");

    expect(heartButton).toBeInTheDocument();

    // Use userEvent instead of fireEvent for more realistic interactions
    const user = userEvent.setup();

    await user.click(heartButton);

    // Wait for the async action to complete and verify addToWishlist was called
    await waitFor(() => {
      expect(mockAddToWishlistFn).toHaveBeenCalledWith(mockProduct.id);
    });

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalled();

    // Now update the mock to simulate the product being in the wishlist
    mockIsProductInWishlistFn.mockResolvedValue(true);

    // Re-render with updated wishlist state
    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Get the heart button with updated title
    const removeHeartButton = screen.getByTitle("Remove from Wishlist");

    expect(removeHeartButton).toBeInTheDocument();

    // Click to remove from wishlist
    await user.click(removeHeartButton);

    // Check if removeFromWishlist was called
    await waitFor(() => {
      expect(mockRemoveFromWishlistFn).toHaveBeenCalledWith(mockProduct.id);
    });

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalled();
  });

  it("shows French description when locale is fr", () => {
    // Mock French locale
    require("next-intl").useLocale.mockReturnValue("fr");

    render(
      <TestWrapper>
        <ProductDetail product={mockProduct} />
      </TestWrapper>,
    );

    // Should show French description
    expect(
      screen.getByText("Ceci est une description de test"),
    ).toBeInTheDocument();
  });
});
