import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";

import { useImageUpload, ImageUploadState } from "@/hooks/useImageUpload";
import * as bunnyActions from "@/actions/bunny/action";
import * as actionHelpers from "@/lib/actionHelpers";

// Mock toast
jest.mock("sonner", () => ({
  toast: {
    info: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock the Bunny actions
jest.mock("@/actions/bunny/action", () => ({
  generateBunnyUploadUrl: jest.fn(),
  verifyBunnyUpload: jest.fn(),
  deleteFileFromBunny: jest.fn(),
}));

// Mock the action helpers
jest.mock("@/lib/actionHelpers", () => ({
  createFilePreview: jest.fn(),
  revokeFilePreview: jest.fn(),
}));

// Mock XMLHttpRequest
const xhrMock = {
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  upload: {
    onprogress: jest.fn(),
  },
  onload: jest.fn(),
  onerror: jest.fn(),
  status: 200,
};

global.XMLHttpRequest = jest.fn(() => xhrMock) as any;

describe("useImageUpload", () => {
  // Helper to create a File mock
  const createFileMock = (
    name: string = "test.jpg",
    type: string = "image/jpeg",
  ): File => {
    return new File(["dummy content"], name, { type });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Also spy on console.error to suppress actual error logs
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Setup default mocks
    (actionHelpers.createFilePreview as jest.Mock).mockImplementation(
      (file: File) => `mock-preview-url-${file.name}`,
    );
    (bunnyActions.generateBunnyUploadUrl as jest.Mock).mockResolvedValue({
      success: true,
      uploadUrl: "https://bunny.net/upload",
      filePath: "product-images/test/file-1.jpg",
      authHeaders: { AccessKey: "mock-key" },
      expiresAt: Date.now() + 900000,
    });
    (bunnyActions.verifyBunnyUpload as jest.Mock).mockResolvedValue({
      success: true,
    });
    (bunnyActions.deleteFileFromBunny as jest.Mock).mockResolvedValue({
      success: true,
    });
  });

  afterEach(() => {
    // Restore console.error after each test
    jest.restoreAllMocks();
  });

  it("should initialize with empty state when no initial images provided", () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.productImages).toEqual([]);
    expect(result.current.isUploadingImages).toBe(false);
  });

  it("should initialize with provided initial images", () => {
    const initialImages: ImageUploadState[] = [
      {
        preview: "https://example.com/image1.jpg",
        altText: "Image 1",
        status: "existing",
        progress: 100,
        path: "product-images/test/image1.jpg",
        id: "1",
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));

    expect(result.current.productImages).toEqual(initialImages);
  });

  it("should handle image upload", () => {
    const { result } = renderHook(() => useImageUpload());
    const file = createFileMock();
    const event = {
      target: {
        files: [file],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleImageUpload(event);
    });

    expect(result.current.productImages.length).toBe(1);
    expect(result.current.productImages[0].file).toBe(file);
    expect(result.current.productImages[0].status).toBe("pending");
    expect(toast.info).toHaveBeenCalledWith(
      "1 image(s) added. Don't forget to upload them.",
    );
  });

  it("should update alt text for an image", () => {
    const initialImages: ImageUploadState[] = [
      {
        preview: "mock-preview-url",
        altText: "",
        status: "pending",
        progress: 0,
        file: createFileMock(),
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));

    act(() => {
      result.current.handleAltTextChange(0, "New alt text");
    });

    expect(result.current.productImages[0].altText).toBe("New alt text");
  });

  it("should remove an image and revoke object URL", async () => {
    const file = createFileMock();
    const initialImages: ImageUploadState[] = [
      {
        preview: "mock-preview-url",
        altText: "",
        status: "pending",
        progress: 0,
        file,
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));

    await act(async () => {
      await result.current.removeImage(0);
    });

    expect(result.current.productImages.length).toBe(0);
    expect(actionHelpers.revokeFilePreview).toHaveBeenCalledWith(
      "mock-preview-url",
    );
  });

  it("should delete existing image from storage when removed", async () => {
    const initialImages: ImageUploadState[] = [
      {
        preview: "https://example.com/image1.jpg",
        altText: "Image 1",
        status: "existing",
        progress: 100,
        path: "product-images/test/image1.jpg",
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));

    await act(async () => {
      await result.current.removeImage(0);
    });

    expect(bunnyActions.deleteFileFromBunny).toHaveBeenCalledWith(
      "product-images/test/image1.jpg",
    );
    expect(toast.success).toHaveBeenCalledWith("Image deleted successfully");
    expect(result.current.productImages.length).toBe(0);
  });

  it("should prepare image data for submission", () => {
    const initialImages: ImageUploadState[] = [
      {
        preview: "https://example.com/image1.jpg",
        altText: "Image 1",
        status: "existing",
        progress: 100,
        path: "product-images/test/image1.jpg",
        id: "1",
      },
      {
        preview: "https://example.com/image2.jpg",
        altText: "Image 2",
        status: "success",
        progress: 100,
        path: "product-images/test/image2.jpg",
      },
      // Image without path should be excluded
      {
        preview: "mock-preview-url",
        altText: "Pending image",
        status: "pending",
        progress: 0,
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));
    const preparedData = result.current.prepareImageDataForSubmission();

    expect(preparedData).toEqual([
      {
        id: "1",
        url: "product-images/test/image1.jpg",
        path: "product-images/test/image1.jpg",
        alt_text: "Image 1",
      },
      {
        url: "product-images/test/image2.jpg",
        path: "product-images/test/image2.jpg",
        alt_text: "Image 2",
      },
    ]);
    // Should only include images with paths
    expect(preparedData.length).toBe(2);
  });

  it("should upload images to Bunny storage", async () => {
    const file = createFileMock();
    const initialImages: ImageUploadState[] = [
      {
        preview: "mock-preview-url",
        altText: "Test image",
        status: "pending",
        progress: 0,
        file,
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));

    // Setup XMLHttpRequest mock for successful upload
    Object.defineProperty(xhrMock, "status", { value: 200 });

    // When send is called, trigger the onload handler with success
    (xhrMock.send as jest.Mock).mockImplementation(() => {
      if (xhrMock.onload) {
        setTimeout(() => {
          xhrMock.onload();
        }, 10);
      }
    });

    await act(async () => {
      const success = await result.current.uploadAllImages(
        "test-product",
        "test",
      );

      expect(success).toBe(true);
    });

    expect(bunnyActions.generateBunnyUploadUrl).toHaveBeenCalled();
    expect(bunnyActions.verifyBunnyUpload).toHaveBeenCalled();
    expect(result.current.productImages[0].status).toBe("success");
    expect(toast.success).toHaveBeenCalledWith(
      "All images uploaded successfully",
    );
  });

  it("should handle upload error", async () => {
    const file = createFileMock();
    const initialImages: ImageUploadState[] = [
      {
        preview: "mock-preview-url",
        altText: "Test image",
        status: "pending",
        progress: 0,
        file,
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));

    // Mock upload failure
    (bunnyActions.generateBunnyUploadUrl as jest.Mock).mockRejectedValue(
      new Error("Upload URL generation failed"),
    );

    await act(async () => {
      const success = await result.current.uploadAllImages(
        "test-product",
        "test",
      );

      expect(success).toBe(false);
    });

    // Verify console.error was called without actually logging to console
    expect(console.error).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });

  it("should reset all images", () => {
    const file1 = createFileMock("file1.jpg");
    const file2 = createFileMock("file2.jpg");
    const initialImages: ImageUploadState[] = [
      {
        preview: "mock-preview-url-1",
        altText: "Image 1",
        status: "pending",
        progress: 0,
        file: file1,
      },
      {
        preview: "mock-preview-url-2",
        altText: "Image 2",
        status: "pending",
        progress: 0,
        file: file2,
      },
    ];

    const { result } = renderHook(() => useImageUpload(initialImages));

    act(() => {
      result.current.resetImages();
    });

    expect(result.current.productImages).toEqual([]);
    expect(actionHelpers.revokeFilePreview).toHaveBeenCalledTimes(2);
    expect(actionHelpers.revokeFilePreview).toHaveBeenCalledWith(
      "mock-preview-url-1",
    );
    expect(actionHelpers.revokeFilePreview).toHaveBeenCalledWith(
      "mock-preview-url-2",
    );
  });

  it("should clean up previews when unmounting", () => {
    const file = createFileMock();
    const initialImages: ImageUploadState[] = [
      {
        preview: "mock-preview-url",
        altText: "",
        status: "pending",
        progress: 0,
        file,
      },
    ];

    const { unmount } = renderHook(() => useImageUpload(initialImages));

    unmount();

    expect(actionHelpers.revokeFilePreview).toHaveBeenCalledWith(
      "mock-preview-url",
    );
  });
});
