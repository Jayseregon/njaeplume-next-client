import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

import { FreebieCard } from "@/src/components/product/FreebieCard";
import { Category } from "@/generated/client";
import { generateBunnySignedUrl } from "@/src/actions/bunny/action";

// Suppress specific console errors during tests
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    // Ignore specific Next.js Image attribute warnings
    if (
      typeof args[0] === "string" &&
      args[0].includes("Received `true` for a non-boolean attribute")
    ) {
      return;
    }

    // Identify and suppress React act() warnings
    if (typeof args[0] === "string") {
      const errorMessage = args[0];

      if (
        errorMessage.includes(
          "An update to FreebieCard inside a test was not wrapped in act",
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
    if (typeof imgProps.priority === "boolean") {
      imgProps.priority = imgProps.priority.toString();
    }

    return <img alt={props.alt} data-src={props.src} {...imgProps} />;
  },
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/src/actions/bunny/action", () => ({
  generateBunnySignedUrl: jest.fn(),
}));

// Mock framer-motion to avoid animation complexities in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      // Destructure actual framer-motion props and assign to underscored variables
      // to remove them from restProps and satisfy the linter for unused variables.
      whileHover: _whileHover,
      whileTap: _whileTap,
      onHoverEnd: _onHoverEnd,
      onHoverStart: _onHoverStart,
      variants: _variants,
      initial: _initial,
      animate: _animate,
      transition: _transition,
      ...restProps // restProps no longer contains the explicitly destructured framer-motion props
    }: any) => (
      <div data-testid="motion-div" {...restProps}>
        {children}
      </div>
    ),
  },
}));

// Mock document.createElement to track creation of anchor elements
const mockAnchorElement = {
  href: "",
  download: "",
  click: jest.fn(),
  __isMockAnchor: true, // Identifier for our mock anchor
};

// Capture originals
const originalCreateElement = document.createElement;
const originalAppendChild = document.body.appendChild;
const originalRemoveChild = document.body.removeChild;

beforeEach(() => {
  // mock only <a> creation
  document.createElement = jest
    .fn()
    .mockImplementation((tagName) =>
      tagName === "a"
        ? mockAnchorElement
        : originalCreateElement.call(document, tagName),
    );

  // Conditionally mock appendChild/removeChild
  document.body.appendChild = jest.fn().mockImplementation((nodeToAppend) => {
    if (nodeToAppend && nodeToAppend.__isMockAnchor) {
      // It's our mock anchor, don't call original DOM method
      return nodeToAppend;
    }

    // For RTL and other operations, use the original method
    return originalAppendChild.call(document.body, nodeToAppend);
  });

  document.body.removeChild = jest.fn().mockImplementation((nodeToRemove) => {
    if (nodeToRemove && nodeToRemove.__isMockAnchor) {
      // It's our mock anchor, don't call original DOM method
      return nodeToRemove;
    }

    // For RTL and other operations, use the original method
    return originalRemoveChild.call(document.body, nodeToRemove);
  });
});

afterEach(() => {
  // restore everything
  document.createElement = originalCreateElement;
  document.body.appendChild = originalAppendChild;
  document.body.removeChild = originalRemoveChild;
});

// Create mock product data
const mockProduct = {
  id: "freebie-123",
  name: "Free Brush Pack",
  price: 0,
  description: "Free brush pack for your projects",
  description_fr: "Pack de pinceaux gratuit pour vos projets",
  category: Category.brushes,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-15"),
  zip_file_name: "downloads/brushes/free-brush-pack.zip",
  slug: "free-brush-pack",
  tags: [{ id: "tag1", name: "Free", slug: "free" }],
  images: [
    {
      id: "img1",
      productId: "freebie-123",
      url: "product-images/free-brush-pack.jpg",
      alt_text: "Free Brush Pack Preview",
    },
  ],
};

describe("FreebieCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set environment variable for tests
    process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL =
      "https://test-cdn.bunny.net";

    // Reset anchor mock properties (click is cleared by jest.clearAllMocks)
    mockAnchorElement.href = "";
    mockAnchorElement.download = "";
    // mockAnchorElement.click.mockClear(); // This is handled by jest.clearAllMocks()
  });

  it("renders product information correctly", () => {
    render(<FreebieCard product={mockProduct} />);

    // Check product name
    expect(screen.getByText("Free Brush Pack")).toBeInTheDocument();

    // Check product category is displayed using the translation
    expect(screen.getByText("category.brushes")).toBeInTheDocument();

    // Check for the product image
    const image = screen.getByAltText("Free Brush Pack Preview");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "data-src",
      "https://test-cdn.bunny.net/product-images/free-brush-pack.jpg",
    );

    // Check download button
    const downloadButton = screen.getByTestId("download-button");

    expect(downloadButton).toHaveTextContent("downloadButtonText");
  });

  it("initiates download process when button is clicked", async () => {
    // Mock the successful signed URL generation
    (generateBunnySignedUrl as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://test-cdn.bunny.net/signed-url/free-brush-pack.zip?token=abc123",
    });

    const user = userEvent.setup(); // Ensure userEvent is setup

    render(<FreebieCard product={mockProduct} />);

    // Find and click the download button
    const downloadButton = screen.getByTestId("download-button");

    await user.click(downloadButton); // Use userEvent.click

    // Wait for the download to complete
    await waitFor(() => {
      // Check if generateBunnySignedUrl was called with the correct zip file name
      expect(generateBunnySignedUrl).toHaveBeenCalledWith(
        "downloads/brushes/free-brush-pack.zip",
      );

      // Check if anchor was created with the correct attributes
      expect(mockAnchorElement.href).toBe(
        "https://test-cdn.bunny.net/signed-url/free-brush-pack.zip?token=abc123",
      );
      expect(mockAnchorElement.download).toBe("free-brush-pack.zip");

      // Check if anchor was clicked
      expect(mockAnchorElement.click).toHaveBeenCalled();

      // Check if anchor was appended and removed from the document
      expect(document.body.appendChild).toHaveBeenCalledWith(mockAnchorElement);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockAnchorElement);

      // Check if success toast was shown
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it("shows spinner during download process", async () => {
    // Mock the signed URL generation with a delay to observe loading state
    (generateBunnySignedUrl as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                url: "https://test-cdn.bunny.net/signed-url/file.zip",
              }),
            100,
          ),
        ),
    );

    const user = userEvent.setup(); // Use userEvent for consistency

    render(<FreebieCard product={mockProduct} />);

    // Click download button
    const downloadButton = screen.getByTestId("download-button");

    await user.click(downloadButton); // Use userEvent.click

    // Check for spinner
    expect(screen.getByTestId("simple-spinner")).toBeInTheDocument();

    // Wait for download to complete
    await waitFor(() => {
      expect(screen.queryByTestId("simple-spinner")).not.toBeInTheDocument();
    });
  });

  it("handles download errors correctly", async () => {
    // Mock a failed signed URL generation
    (generateBunnySignedUrl as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to generate signed URL",
    });

    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    const user = userEvent.setup();

    render(<FreebieCard product={mockProduct} />);

    // Find and click the download button
    const downloadButton = screen.getByTitle("downloadButtonTitle");

    await user.click(downloadButton);

    // Wait for error handling
    await waitFor(() => {
      // Check if error toast was shown
      expect(toast.error).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it("extracts filename correctly from zip_file_name path", async () => {
    // Mock successful download
    (generateBunnySignedUrl as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://test-cdn.bunny.net/signed-url/file.zip",
    });

    const user = userEvent.setup();

    render(<FreebieCard product={mockProduct} />);

    // Find and click the download button
    const downloadButton = screen.getByTestId("download-button");

    await user.click(downloadButton);

    // Wait for download to complete and check filename extraction
    await waitFor(() => {
      expect(mockAnchorElement.download).toBe("free-brush-pack.zip");
    });
  });

  it("falls back to slug for filename when zip_file_name has no path segments", async () => {
    // Create product with simplified zip_file_name without path segments
    const productWithSimpleZipName = {
      ...mockProduct,
      zip_file_name: "no-path-segments.zip",
    };

    // Mock successful download
    (generateBunnySignedUrl as jest.Mock).mockResolvedValue({
      success: true,
      url: "https://test-cdn.bunny.net/signed-url/file.zip",
    });

    const user = userEvent.setup();

    render(<FreebieCard product={productWithSimpleZipName} />);

    // Find and click the download button
    const downloadButton = screen.getByTestId("download-button");

    await user.click(downloadButton);

    // Wait for download to complete and check filename
    await waitFor(() => {
      expect(mockAnchorElement.download).toBe("no-path-segments.zip");
    });
  });
});
