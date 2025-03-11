import { renderHook, act } from "@testing-library/react";
import { toast } from "sonner";

import { useZipFileUpload } from "@/hooks/useZipFileUpload";
import * as bunnyActions from "@/actions/bunny/action";

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

// @ts-ignore - partial implementation
global.XMLHttpRequest = jest.fn(() => xhrMock) as any;

describe("useZipFileUpload", () => {
  // Helper to create a File mock
  const createZipFileMock = (name: string = "test.zip"): File => {
    return new File(["dummy zip content"], name, { type: "application/zip" });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.error to suppress actual error logs
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Setup default mocks
    (bunnyActions.generateBunnyUploadUrl as jest.Mock).mockResolvedValue({
      success: true,
      uploadUrl: "https://bunny.net/upload",
      filePath: "product-files/test/product.zip",
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

  it("should initialize with empty state when no initial path provided", () => {
    const { result } = renderHook(() => useZipFileUpload());

    expect(result.current.productZip).toBeNull();
    expect(result.current.isUploadingZip).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.uploadedZipPath).toBeNull();
    expect(result.current.showZipUpload).toBe(true);
  });

  it("should initialize with provided initial path", () => {
    const initialPath = "product-files/existing/product.zip";
    const { result } = renderHook(() => useZipFileUpload(initialPath));

    expect(result.current.productZip).toBeNull();
    expect(result.current.uploadedZipPath).toBe(initialPath);
    expect(result.current.showZipUpload).toBe(false);
  });

  it("should handle zip file selection", () => {
    const { result } = renderHook(() => useZipFileUpload());
    const file = createZipFileMock();
    const event = {
      target: {
        files: [file],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    act(() => {
      result.current.handleZipUpload(event);
    });

    expect(result.current.productZip).toBe(file);
  });

  it("should upload zip file to Bunny storage", async () => {
    const { result } = renderHook(() => useZipFileUpload());
    const file = createZipFileMock();

    // Set the zip file first
    act(() => {
      const event = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      result.current.handleZipUpload(event);
    });

    // Setup XMLHttpRequest mock for successful upload
    Object.defineProperty(xhrMock, "status", { value: 200 });

    // When send is called, trigger the onload handler with success and simulate progress
    (xhrMock.send as jest.Mock).mockImplementation(() => {
      if (xhrMock.upload.onprogress) {
        // Simulate progress event
        // @ts-ignore - simplified for test
        xhrMock.upload.onprogress({
          lengthComputable: true,
          loaded: 50,
          total: 100,
        });
      }

      if (xhrMock.onload) {
        setTimeout(() => {
          // @ts-ignore - simplified for test
          xhrMock.onload();
        }, 10);
      }
    });

    await act(async () => {
      const success = await result.current.uploadZipFileToBunny(
        "test-product",
        "test",
      );

      expect(success).toBe(true);
    });

    expect(bunnyActions.generateBunnyUploadUrl).toHaveBeenCalledWith(
      "test-product",
      "product-files",
      "test",
    );
    expect(bunnyActions.verifyBunnyUpload).toHaveBeenCalled();
    expect(result.current.uploadedZipPath).toBe(
      "product-files/test/product.zip",
    );
    expect(result.current.uploadProgress).toBe(50); // Check that progress was updated
    expect(toast.success).toHaveBeenCalledWith(
      "Zip file uploaded successfully",
    );
  });

  it("should handle upload error when no file is selected", async () => {
    const { result } = renderHook(() => useZipFileUpload());

    await act(async () => {
      const success = await result.current.uploadZipFileToBunny(
        "test-product",
        "test",
      );

      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalledWith("Please select a zip file first");
    expect(bunnyActions.generateBunnyUploadUrl).not.toHaveBeenCalled();
  });

  it("should handle upload error when API call fails", async () => {
    const { result } = renderHook(() => useZipFileUpload());
    const file = createZipFileMock();

    // Set the zip file first
    act(() => {
      const event = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      result.current.handleZipUpload(event);
    });

    // Mock API failure
    (bunnyActions.generateBunnyUploadUrl as jest.Mock).mockRejectedValue(
      new Error("Upload URL generation failed"),
    );

    await act(async () => {
      const success = await result.current.uploadZipFileToBunny(
        "test-product",
        "test",
      );

      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });

  it("should handle network error during upload", async () => {
    const { result } = renderHook(() => useZipFileUpload());
    const file = createZipFileMock();

    // Set the zip file first
    act(() => {
      const event = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      result.current.handleZipUpload(event);
    });

    // Setup XMLHttpRequest mock for network error
    (xhrMock.send as jest.Mock).mockImplementation(() => {
      if (xhrMock.onerror) {
        setTimeout(() => {
          // @ts-ignore - simplified for test
          xhrMock.onerror();
        }, 10);
      }
    });

    await act(async () => {
      const success = await result.current.uploadZipFileToBunny(
        "test-product",
        "test",
      );

      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it("should handle HTTP error during upload", async () => {
    const { result } = renderHook(() => useZipFileUpload());
    const file = createZipFileMock();

    // Set the zip file first
    act(() => {
      const event = {
        target: {
          files: [file],
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      result.current.handleZipUpload(event);
    });

    // Setup XMLHttpRequest mock for HTTP error
    Object.defineProperty(xhrMock, "status", { value: 403 });

    (xhrMock.send as jest.Mock).mockImplementation(() => {
      if (xhrMock.onload) {
        setTimeout(() => {
          // @ts-ignore - simplified for test
          xhrMock.onload();
        }, 10);
      }
    });

    await act(async () => {
      const success = await result.current.uploadZipFileToBunny(
        "test-product",
        "test",
      );

      expect(success).toBe(false);
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it("should remove existing zip file", async () => {
    const initialPath = "product-files/existing/product.zip";
    const { result } = renderHook(() => useZipFileUpload(initialPath));

    await act(async () => {
      await result.current.handleRemoveExistingZip();
    });

    expect(bunnyActions.deleteFileFromBunny).toHaveBeenCalledWith(initialPath);
    expect(toast.success).toHaveBeenCalledWith(
      "Previous zip file deleted successfully",
    );
    expect(result.current.uploadedZipPath).toBeNull();
    expect(result.current.showZipUpload).toBe(true);
  });

  it("should handle error when deleting zip file fails", async () => {
    const initialPath = "product-files/existing/product.zip";
    const { result } = renderHook(() => useZipFileUpload(initialPath));

    // Mock deletion failure
    (bunnyActions.deleteFileFromBunny as jest.Mock).mockResolvedValue({
      success: false,
      error: "File not found",
    });

    await act(async () => {
      await result.current.handleRemoveExistingZip();
    });

    expect(bunnyActions.deleteFileFromBunny).toHaveBeenCalledWith(initialPath);
    expect(toast.error).toHaveBeenCalledWith(
      "Failed to delete zip file: File not found",
    );
    // State should not be reset if deletion fails
    expect(result.current.uploadedZipPath).toBe(initialPath);
    expect(result.current.showZipUpload).toBe(false);
  });

  it("should reset zip state", () => {
    const initialPath = "product-files/existing/product.zip";
    const { result } = renderHook(() => useZipFileUpload(initialPath));

    act(() => {
      result.current.resetZip();
    });

    expect(result.current.productZip).toBeNull();
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.uploadedZipPath).toBeNull();
    expect(result.current.showZipUpload).toBe(true);
  });
});
