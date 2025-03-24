import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import { toast } from "sonner";
import { Category } from "@prisma/client";

import { ProductEditDialog } from "@/components/castle/ProductEditDialog";
import { useProductStore } from "@/stores/productStore"; // Fixed path
import { updateProduct } from "@/actions/prisma/action";
import { deleteProductWithFiles } from "@/actions/bunny/action"; // Fixed path
import * as imageUploadHook from "@/hooks/useImageUpload"; // Fixed path
import * as zipUploadHook from "@/hooks/useZipFileUpload"; // Fixed path

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

// Mock the product store hooks
jest.mock("@/stores/productStore", () => ({
  // Fixed path
  useProductStore: jest.fn(),
}));

// Mock the server actions
jest.mock("@/actions/prisma/action", () => ({
  updateProduct: jest.fn(),
}));

jest.mock("@/actions/bunny/action", () => ({
  // Fixed path
  deleteProductWithFiles: jest.fn(),
}));

// Mock the custom hooks
jest.mock("@/hooks/useImageUpload", () => ({
  // Fixed path
  useImageUpload: jest.fn(),
}));

jest.mock("@/hooks/useZipFileUpload", () => ({
  // Fixed path
  useZipFileUpload: jest.fn(),
}));

// Mock the toast notifications
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock the UI components
jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div
      data-open={open}
      data-testid="dialog"
      role="dialog"
      tabIndex={0}
      onClick={() => onOpenChange && onOpenChange(false)}
      onKeyDown={(e) =>
        e.key === "Escape" && onOpenChange && onOpenChange(false)
      }
    >
      {open ? children : null}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div className={className} data-testid="dialog-content">
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children, className }: any) => (
    <h2 className={className} data-testid="dialog-title">
      {children}
    </h2>
  ),
  DialogFooter: ({ children, className }: any) => (
    <div className={className} data-testid="dialog-footer">
      {children}
    </div>
  ),
}));

// Update the button mock to properly handle the disabled attribute
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, type, disabled, variant, size }: any) => (
    <button
      data-disabled={disabled ? "true" : "false"}
      data-size={size}
      data-testid={`button-${variant || "default"}`}
      disabled={disabled ? true : undefined}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/castle/TagInput", () => ({
  // Fixed path
  TagInput: ({ selectedTags, onChange }: any) => (
    <div data-testid="tag-input">
      <div>
        {selectedTags.map((tag: any) => (
          <span key={tag.id} data-testid="selected-tag">
            {tag.name}
          </span>
        ))}
      </div>
      <button
        data-testid="add-tag-btn"
        onClick={() => {
          const newTag = { id: "new-tag", name: "New Tag", slug: "new-tag" };

          onChange([...selectedTags, newTag]);
        }}
      >
        Add Tag
      </button>
      <button
        data-testid="remove-tag-btn"
        onClick={() => {
          if (selectedTags.length > 0) {
            onChange(selectedTags.slice(0, -1));
          }
        }}
      >
        Remove Tag
      </button>
    </div>
  ),
}));

jest.mock("@/components/castle/FormField", () => ({
  // Fixed path
  FormField: ({ id, label, name, inputType, inputProps, className }: any) => (
    <div className={className} data-testid={`form-field-${name}`}>
      <label htmlFor={id}>{label}</label>
      {inputType === "textarea" ? (
        <textarea
          data-testid={`input-${name}`}
          id={id}
          name={name}
          {...inputProps}
        />
      ) : (
        <input
          data-testid={`input-${name}`}
          id={id}
          name={name}
          type={inputType}
          {...inputProps}
        />
      )}
    </div>
  ),
}));

jest.mock("@/components/castle/CategoryField", () => ({
  // Fixed path
  CategoryField: ({ selectedCategory, onChange, readOnly }: any) => (
    <div data-readonly={readOnly} data-testid="category-field">
      <select
        data-testid="category-select"
        disabled={readOnly}
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="brushes">Brushes</option>
        <option value="stickers">Stickers</option>
        <option value="templates">Templates</option>
      </select>
    </div>
  ),
}));

jest.mock("@/components/castle/ProductImageUploader", () => ({
  // Fixed path
  ProductImageUploader: ({ productName, category, imageUploadHook }: any) => (
    <div
      data-category={category}
      data-product-name={productName}
      data-testid="image-uploader"
    >
      <button
        data-testid="upload-images-btn"
        onClick={() => imageUploadHook.uploadAllImages(productName, category)}
      >
        Upload All Images
      </button>
    </div>
  ),
}));

jest.mock("@/components/castle/ProductZipUploader", () => ({
  // Fixed path
  ProductZipUploader: ({ productName, category, zipUploadHook }: any) => (
    <div
      data-category={category}
      data-product-name={productName}
      data-testid="zip-uploader"
    >
      <button
        data-testid="upload-zip-btn"
        onClick={() =>
          zipUploadHook.uploadZipFileToBunny(productName, category)
        }
      >
        Upload Zip File
      </button>
    </div>
  ),
}));

jest.mock("@/components/root/SimpleSpinner", () => ({
  SimpleSpinner: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Save: () => <span data-testid="save-icon">Save</span>,
  Trash2: () => <span data-testid="trash-icon">Delete</span>,
}));

// Mock lib util functions
jest.mock("@/lib/actionHelpers", () => ({
  // Fixed path
  slugifyProductName: jest.fn((name, category) => `${name}-${category}-slug`),
}));

describe("ProductEditDialog", () => {
  // Sample product data
  const mockProduct = {
    id: "product-1",
    name: "Test Product",
    price: 19.99,
    description: "This is a test product",
    category: "brushes" as Category,
    zip_file_name: "products/test-product.zip",
    slug: "test-product-slug",
    tags: [
      { id: "tag1", name: "Tag 1", slug: "tag-1" },
      { id: "tag2", name: "Tag 2", slug: "tag-2" },
    ],
    images: [
      {
        id: "img1",
        productId: "product-1",
        url: "test-image-1.jpg",
        alt_text: "Test Image 1",
      },
      {
        id: "img2",
        productId: "product-1",
        url: "test-image-2.jpg",
        alt_text: "Test Image 2",
      },
    ],
  };

  // Mock hooks return values
  const mockCloseDialog = jest.fn();
  const mockSetProductImages = jest.fn();
  const mockResetImages = jest.fn();
  const mockPrepareImageDataForSubmission = jest.fn(() => [
    {
      id: "img1",
      url: "test-image-1.jpg",
      path: "test-image-1.jpg",
      alt_text: "Test Image 1",
    },
    {
      id: "img2",
      url: "test-image-2.jpg",
      path: "test-image-2.jpg",
      alt_text: "Test Image 2",
    },
  ]);
  const mockUploadAllImages = jest.fn(() => Promise.resolve(true));

  const mockSetUploadedZipPath = jest.fn();
  const mockSetShowZipUpload = jest.fn();
  const mockUploadZipFileToBunny = jest.fn(() => Promise.resolve(true));

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up useProductStore mock
    (useProductStore as unknown as jest.Mock).mockReturnValue({
      selectedProduct: mockProduct,
      isDialogOpen: true,
      closeDialog: mockCloseDialog,
    });

    // Set up useImageUpload mock
    (imageUploadHook.useImageUpload as jest.Mock).mockReturnValue({
      productImages: [
        {
          id: "img1",
          preview: "url1",
          altText: "Test Image 1",
          status: "existing",
          progress: 100,
          path: "test-image-1.jpg",
        },
        {
          id: "img2",
          preview: "url2",
          altText: "Test Image 2",
          status: "existing",
          progress: 100,
          path: "test-image-2.jpg",
        },
      ],
      isUploadingImages: false,
      setProductImages: mockSetProductImages,
      resetImages: mockResetImages,
      prepareImageDataForSubmission: mockPrepareImageDataForSubmission,
      uploadAllImages: mockUploadAllImages,
      removeImage: jest.fn(),
      handleImageUpload: jest.fn(),
      handleAltTextChange: jest.fn(),
    });

    // Set up useZipFileUpload mock
    (zipUploadHook.useZipFileUpload as jest.Mock).mockReturnValue({
      productZip: null,
      isUploadingZip: false,
      uploadProgress: 0,
      uploadedZipPath: "products/test-product.zip",
      showZipUpload: false,
      handleZipUpload: jest.fn(),
      uploadZipFileToBunny: mockUploadZipFileToBunny,
      handleRemoveExistingZip: jest.fn(),
      setUploadedZipPath: mockSetUploadedZipPath,
      resetZip: jest.fn(),
      setShowZipUpload: mockSetShowZipUpload,
    });

    // Set up server action mocks
    (updateProduct as jest.Mock).mockResolvedValue({ id: "product-1" });
    (deleteProductWithFiles as jest.Mock).mockResolvedValue({ success: true });

    // Mock environment variables
    process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL =
      "https://example.com/cdn";

    // Mock console.error to suppress error messages during tests
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("renders when dialog is open", () => {
    render(<ProductEditDialog />);

    expect(screen.getByTestId("dialog")).toHaveAttribute("data-open", "true");
    expect(screen.getByTestId("dialog-title")).toHaveTextContent(
      "Edit Product",
    );
  });

  it("does not render when no product is selected", () => {
    // Update useProductStore mock to return null for selectedProduct
    (useProductStore as unknown as jest.Mock).mockReturnValue({
      selectedProduct: null,
      isDialogOpen: true,
      closeDialog: mockCloseDialog,
    });

    const { container } = render(<ProductEditDialog />);

    expect(container).toBeEmptyDOMElement();
  });

  it("initializes form fields with selected product data", () => {
    render(<ProductEditDialog />);

    // Check form fields are initialized
    expect(screen.getByTestId("input-name")).toHaveValue("Test Product");
    expect(screen.getByTestId("input-price")).toHaveValue(19.99);
    expect(screen.getByTestId("input-description")).toHaveValue(
      "This is a test product",
    );
    expect(screen.getByTestId("category-select")).toHaveValue("brushes");

    // Check that image uploader is initialized with product images
    expect(mockSetProductImages).toHaveBeenCalled();

    // Check that zip uploader is initialized with product zip
    expect(mockSetUploadedZipPath).toHaveBeenCalledWith(
      "products/test-product.zip",
    );
    expect(mockSetShowZipUpload).toHaveBeenCalledWith(false);
  });

  it("updates form data when input values change", () => {
    render(<ProductEditDialog />);

    // Change name
    fireEvent.change(screen.getByTestId("input-name"), {
      target: { value: "Updated Product" },
    });

    // Change price
    fireEvent.change(screen.getByTestId("input-price"), {
      target: { value: "29.99" },
    });

    // Change description
    fireEvent.change(screen.getByTestId("input-description"), {
      target: { value: "Updated description" },
    });

    // Submit the form to check updated values
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Check that updateProduct was called with updated values
    expect(updateProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated Product",
        price: 29.99,
        description: "Updated description",
      }),
    );
  });

  it("handles tag changes correctly", () => {
    render(<ProductEditDialog />);

    // Initially should have 2 tags
    expect(screen.getAllByTestId("selected-tag").length).toBe(2);

    // Add a tag
    fireEvent.click(screen.getByTestId("add-tag-btn"));

    // Check that tag was added
    expect(screen.getAllByTestId("selected-tag").length).toBe(3);

    // Submit form to check updated tags
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Should include the new tag
    expect(updateProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        tags: expect.arrayContaining([
          expect.objectContaining({ id: "tag1" }),
          expect.objectContaining({ id: "tag2" }),
          expect.objectContaining({ id: "new-tag" }),
        ]),
      }),
    );
  });

  it("submits the form and updates the product", async () => {
    render(<ProductEditDialog />);

    // Submit the form
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Should call updateProduct with correct data
    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "product-1",
          name: "Test Product",
          price: 19.99,
          description: "This is a test product",
          category: "brushes",
          zip_file_name: "products/test-product.zip",
          slug: "test-product-slug",
          tags: mockProduct.tags,
          images: expect.arrayContaining([
            expect.objectContaining({ id: "img1" }),
            expect.objectContaining({ id: "img2" }),
          ]),
        }),
      );
    });

    // Should show success toast
    expect(toast.success).toHaveBeenCalledWith("Product updated successfully!");

    // Should close the dialog
    expect(mockCloseDialog).toHaveBeenCalled();
  });

  it("validates zip file exists before submission", async () => {
    // Mock zip file path to be null
    (zipUploadHook.useZipFileUpload as jest.Mock).mockReturnValue({
      ...zipUploadHook.useZipFileUpload(),
      uploadedZipPath: null,
    });

    render(<ProductEditDialog />);

    // Submit the form
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Should show error toast
    expect(toast.error).toHaveBeenCalledWith(
      "Please upload a zip file for the product",
    );

    // Should not call updateProduct
    expect(updateProduct).not.toHaveBeenCalled();
  });

  it("uploads pending images before submission", async () => {
    // Mock having pending images
    (imageUploadHook.useImageUpload as jest.Mock).mockReturnValue({
      ...imageUploadHook.useImageUpload(),
      productImages: [
        {
          id: "img1",
          preview: "url1",
          altText: "Test Image 1",
          status: "existing",
          progress: 100,
          path: "test-image-1.jpg",
        },
        {
          preview: "url3",
          altText: "New Image",
          status: "pending",
          progress: 0,
          file: new File([""], "new-image.jpg"),
        },
      ],
    });

    render(<ProductEditDialog />);

    // Submit the form
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Should show info toast
    expect(toast.info).toHaveBeenCalledWith(
      "Uploading pending images first...",
    );

    // Should call uploadAllImages
    expect(mockUploadAllImages).toHaveBeenCalledWith("Test Product", "brushes");

    // Should then submit the form if upload is successful
    await waitFor(() => {
      expect(updateProduct).toHaveBeenCalled();
    });
  });

  it("handles image upload failure", async () => {
    // Mock having pending images with failed upload
    (imageUploadHook.useImageUpload as jest.Mock).mockReturnValue({
      ...imageUploadHook.useImageUpload(),
      productImages: [
        {
          id: "img1",
          preview: "url1",
          altText: "Test Image 1",
          status: "existing",
          progress: 100,
          path: "test-image-1.jpg",
        },
        {
          preview: "url3",
          altText: "New Image",
          status: "pending",
          progress: 0,
          file: new File([""], "new-image.jpg"),
        },
      ],
      uploadAllImages: jest.fn(() => Promise.resolve(false)),
    });

    render(<ProductEditDialog />);

    // Submit the form
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Wait for the upload to fail
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to upload all images");
    });

    // Should not call updateProduct
    expect(updateProduct).not.toHaveBeenCalled();
  });

  it("handles server errors during form submission", async () => {
    // Mock server error
    (updateProduct as jest.Mock).mockRejectedValue(new Error("Server error"));

    render(<ProductEditDialog />);

    // Submit the form
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Should show error toast
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to update product: Server error",
      );
    });

    // Should not close the dialog
    expect(mockCloseDialog).not.toHaveBeenCalled();
  });

  it("deletes the product when delete button is clicked", async () => {
    render(<ProductEditDialog />);

    // Click delete button
    fireEvent.click(screen.getByTestId("button-destructive"));

    // Should call deleteProductWithFiles
    await waitFor(() => {
      expect(deleteProductWithFiles).toHaveBeenCalledWith("product-1");
    });

    // Should show success toast
    expect(toast.success).toHaveBeenCalledWith("Product deleted successfully");

    // Should close the dialog
    expect(mockCloseDialog).toHaveBeenCalled();
  });

  it("handles errors during product deletion", async () => {
    // Create a special dialog mock for this test that doesn't auto-trigger onOpenChange
    const originalDialog = jest.requireMock("@/components/ui/dialog").Dialog;

    jest.requireMock("@/components/ui/dialog").Dialog = ({
      children,
      open,
      onOpenChange,
    }: any) => (
      <div data-open={open} data-testid="dialog">
        {open ? children : null}
        {/* Add button to manually trigger onOpenChange */}
        <button
          data-testid="trigger-dialog-close"
          onClick={() => onOpenChange && onOpenChange(false)}
        >
          Trigger Close
        </button>
      </div>
    );

    // Mock the product store for this test
    const newMockCloseDialog = jest.fn();

    (useProductStore as unknown as jest.Mock).mockReturnValue({
      selectedProduct: mockProduct,
      isDialogOpen: true,
      closeDialog: newMockCloseDialog,
    });

    // Mock deletion failure
    (deleteProductWithFiles as jest.Mock).mockResolvedValue({
      success: false,
      error: "Failed to delete",
    });

    render(<ProductEditDialog />);

    // Clear any previous calls to the mock
    newMockCloseDialog.mockClear();

    // Click delete button to trigger deletion failure
    fireEvent.click(screen.getByTestId("button-destructive"));

    // Wait for error toast to be called
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to delete product: Failed to delete",
      );
    });

    // Ensure all state updates are processed
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Try to close dialog by clicking the manual trigger button
    fireEvent.click(screen.getByTestId("trigger-dialog-close"));

    // Verify closeDialog wasn't called (because of hasError state)
    expect(newMockCloseDialog).not.toHaveBeenCalled();

    // Restore original Dialog implementation
    jest.requireMock("@/components/ui/dialog").Dialog = originalDialog;
  });

  it("closes dialog when onOpenChange is triggered", () => {
    render(<ProductEditDialog />);

    // Click dialog to trigger onOpenChange
    fireEvent.click(screen.getByTestId("dialog"));

    // Should call closeDialog
    expect(mockCloseDialog).toHaveBeenCalled();
  });

  it("disables save button when submitting", async () => {
    // Mock form submission to set isSubmitting state
    (updateProduct as jest.Mock).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: "product-1" });
        }, 1000);
      });
    });

    render(<ProductEditDialog />);

    // Submit form to trigger isSubmitting state change
    fireEvent.submit(
      screen.getByTestId("dialog-content").querySelector("form")!,
    );

    // Check for disabled button and spinner
    await waitFor(() => {
      const saveButton = screen.getByTestId("button-success");

      // Verify it's disabled
      expect(saveButton).toHaveAttribute("data-disabled", "true");

      // Use within to search for spinner inside the save button specifically
      const spinnerInsideButton = within(saveButton).queryByTestId("spinner");

      expect(spinnerInsideButton).toBeInTheDocument();
    });
  });
});
