import {
  sanitizeFileName,
  slugifyProductName,
  verifyRecaptcha,
  getProductZipFileName,
  createFilePreview,
  revokeFilePreview,
  normalizeTagName,
} from "@/lib/actionHelpers";

// Mock fetch for recaptcha verification
global.fetch = jest.fn();

// Mock URL browser APIs
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

describe("sanitizeFileName", () => {
  test("should convert to lowercase", () => {
    expect(sanitizeFileName("UPPERCASE")).toBe("uppercase");
    expect(sanitizeFileName("MiXeD")).toBe("mixed");
  });

  test("should replace special characters with hyphens", () => {
    expect(sanitizeFileName("file with spaces")).toBe("file-with-spaces");
    expect(sanitizeFileName("file@with#special$chars")).toBe(
      "file-with-special-chars",
    );
  });

  test("should remove leading and trailing hyphens", () => {
    expect(sanitizeFileName("--leading")).toBe("leading");
    expect(sanitizeFileName("trailing--")).toBe("trailing");
    expect(sanitizeFileName("--both--")).toBe("both");
  });

  test("should handle multiple adjacent special characters", () => {
    expect(sanitizeFileName("multiple   spaces")).toBe("multiple-spaces");
    expect(sanitizeFileName("multiple###symbols")).toBe("multiple-symbols");
  });

  test("should handle empty strings", () => {
    expect(sanitizeFileName("")).toBe("");
  });

  test("should handle strings with only special characters", () => {
    expect(sanitizeFileName("#@!")).toBe("");
  });
});

describe("slugifyProductName", () => {
  test("should combine product name and category", () => {
    expect(slugifyProductName("Product Name", "Category")).toBe(
      "product-name-category",
    );
  });

  test("should handle special characters in both inputs", () => {
    expect(slugifyProductName("Pro#duct! Name", "Cat@ego&ry")).toBe(
      "pro-duct-name-cat-ego-ry",
    );
  });

  test("should handle empty strings", () => {
    expect(slugifyProductName("", "")).toBe("");
    expect(slugifyProductName("Product", "")).toBe("product");
    expect(slugifyProductName("", "Category")).toBe("category");
  });

  test("should handle inputs with only special characters", () => {
    expect(slugifyProductName("#@!", "&*()")).toBe("");
  });
});

describe("verifyRecaptcha", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should return true when recaptcha verification succeeds", async () => {
    // Mock successful response
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: true }),
    });

    const result = await verifyRecaptcha("test-token", "test-key");

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "secret=test-key&response=test-token",
      },
    );
  });

  test("should return false when recaptcha verification fails", async () => {
    // Mock failed response
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ success: false }),
    });

    const result = await verifyRecaptcha("invalid-token", "test-key");

    expect(result).toBe(false);
  });

  test("should handle network errors", async () => {
    // Mock network error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    await expect(verifyRecaptcha("test-token", "test-key")).rejects.toThrow(
      "Network error",
    );
  });
});

describe("getProductZipFileName", () => {
  test("should append .zip extension to sanitized name", () => {
    expect(getProductZipFileName("Product Name")).toBe("product-name.zip");
  });

  test("should handle special characters", () => {
    expect(getProductZipFileName("Pro#duct! @Name")).toBe("pro-duct-name.zip");
  });

  test("should handle empty string", () => {
    expect(getProductZipFileName("")).toBe(".zip");
  });

  test("should handle strings with only special characters", () => {
    expect(getProductZipFileName("#@!")).toBe(".zip");
  });
});

describe("createFilePreview", () => {
  test("should call URL.createObjectURL with file", () => {
    mockCreateObjectURL.mockReturnValueOnce("blob:url");

    const mockFile = new File(["content"], "filename.txt", {
      type: "text/plain",
    });
    const result = createFilePreview(mockFile);

    expect(mockCreateObjectURL).toHaveBeenCalledWith(mockFile);
    expect(result).toBe("blob:url");
  });
});

describe("revokeFilePreview", () => {
  test("should call URL.revokeObjectURL with url", () => {
    revokeFilePreview("blob:url");

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:url");
  });
});

describe("normalizeTagName", () => {
  test("should normalize and create slug for valid tag names", () => {
    expect(normalizeTagName("Tag Name")).toEqual({
      name: "tag name",
      slug: "tag-name",
    });
  });

  test("should handle multiple spaces and special characters", () => {
    expect(normalizeTagName("  Tag  With  @#$  Spaces  ")).toEqual({
      name: "tag  with  @#$  spaces",
      slug: "tag-with-spaces",
    });
  });

  test("should return null for empty string after trimming", () => {
    expect(normalizeTagName("")).toBeNull();
    expect(normalizeTagName("   ")).toBeNull();
  });

  test("should handle special characters only", () => {
    expect(normalizeTagName("#@!")).toEqual({
      name: "#@!",
      slug: "",
    });
  });

  test("should remove leading and trailing hyphens in slug", () => {
    expect(normalizeTagName("---Tag Name---")).toEqual({
      name: "---tag name---",
      slug: "tag-name",
    });
  });
});
