import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { POST } from "@/app/api/checkout/route";
import { Category } from "@/generated/client";

// Save original console methods
let originalConsoleLog: typeof console.log;
let originalConsoleError: typeof console.error;

// Mock global Request object which is not available in Node.js environment
global.Request = jest.fn().mockImplementation((url, options = {}) => ({
  url,
  method: options.method || "GET",
  headers: new Map(Object.entries(options.headers || {})),
  body: options.body,
  json: async () => JSON.parse(options.body || "{}"),
}));

// Mock NextRequest
jest.mock("next/server", () => {
  return {
    NextRequest: jest.fn().mockImplementation((request) => ({
      url: request.url,
      method: request.method,
      json: async () => {
        return request.json
          ? await request.json()
          : JSON.parse(request.body || "{}");
      },
    })),
    NextResponse: {
      json: (data: any, options: { status: any }) => ({
        status: options?.status || 200,
        json: async () => data,
      }),
    },
  };
});

// Mock Clerk authentication
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  currentUser: jest.fn(),
}));

// Mock Stripe
jest.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
}));

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_APP_URL: "https://example.com",
    NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL: "https://assets.example.com",
  };
});

afterEach(() => {
  process.env = originalEnv;
});

// Sample test data
const mockUser = {
  id: "user_123",
  primaryEmailAddressId: "email_123",
  emailAddresses: [{ id: "email_123", emailAddress: "test@example.com" }],
};

const mockItems = [
  {
    id: "product_123",
    name: "Digital Brush Pack",
    price: 29.99,
    category: Category.brushes,
    description: "A set of digital brushes",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    zip_file_name: "brushes.zip",
    slug: "digital-brush-pack",
    tags: [{ id: "tag_123", name: "Brushes", slug: "brushes" }],
    images: [
      {
        id: "img_123",
        productId: "product_123",
        url: "brushes/cover.jpg",
        alt_text: "Brush pack cover image",
      },
    ],
  },
];

describe("Checkout API", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;

    // Mock console methods to prevent output during tests
    console.log = jest.fn();
    console.error = jest.fn();

    // Default mock implementations
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });
    (currentUser as jest.Mock).mockResolvedValue(null);
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/123",
    });
  });

  // Restore console methods after each test
  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it("returns 401 when user is not authenticated", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

    // Create request using the Request constructor
    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: mockItems }),
      })
    );

    const response = await POST(req);
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when validation fails", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    // Invalid payload - missing required fields
    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: [{ id: "invalid" }] }),
      })
    );

    const response = await POST(req);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Invalid input");
    expect(data.details).toBeDefined();

    // Verify error logging occurred
    expect(console.error).toHaveBeenCalledWith(
      "Checkout validation failed:",
      expect.any(Array)
    );
  });

  it("returns 400 when cart is empty", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: [] }),
      })
    );

    const response = await POST(req);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toBe("Cart is empty");
  });

  it("creates a Stripe checkout session and returns the URL", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    const mockSession = {
      id: "cs_test_123",
      url: "https://checkout.stripe.com/123",
    };
    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
      mockSession
    );
    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: mockItems }),
      })
    );

    const response = await POST(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.url).toBe(mockSession.url);

    // Verify Stripe was called with correct parameters
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_method_types: ["card"],
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "cad",
              unit_amount: Math.round(mockItems[0].price * 100),
              product_data: expect.objectContaining({
                name: mockItems[0].name,
              }),
            }),
            quantity: 1,
          }),
        ]),
        mode: "payment",
        metadata: expect.objectContaining({
          userId: "user_123",
        }),
        customer_email: "test@example.com",
      })
    );
  });

  it("handles metadata string length constraints", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    // Create a large number of items to potentially exceed metadata limit
    const manyItems = Array(50)
      .fill(null)
      .map((_, i) => ({
        ...mockItems[0],
        id: `product_${i}`,
        name: `Product ${i}`.padEnd(50, "x"), // Long names to increase JSON length
      }));

    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: manyItems }),
      })
    );

    const response = await POST(req);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain("Checkout failed due to internal error");

    // Verify error logging occurred
    expect(console.error).toHaveBeenCalledWith(
      "Metadata string too long for Stripe Checkout"
    );
  });

  it("returns 500 when Stripe checkout creation fails", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    (stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
      new Error("Stripe API error")
    );

    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: mockItems }),
      })
    );

    const response = await POST(req);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toBe("Could not create checkout session.");

    // Verify error logging occurred
    expect(console.error).toHaveBeenCalledWith(
      "[CHECKOUT_POST] Error creating checkout session:",
      expect.any(Error)
    );
  });

  it("uses user email from Clerk if available", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue({
      ...mockUser,
      primaryEmailAddressId: "email_456",
      emailAddresses: [
        { id: "email_456", emailAddress: "different@example.com" },
      ],
    });

    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: mockItems }),
      })
    );

    await POST(req);

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: "different@example.com",
      })
    );
  });

  it("mocks console.error for coverage of error handling", async () => {
    const originalConsoleError = console.error;
    console.error = jest.fn();

    try {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
      (currentUser as jest.Mock).mockResolvedValue(mockUser);

      // Force an unexpected error
      (stripe.checkout.sessions.create as jest.Mock).mockImplementation(() => {
        throw new Error("Unexpected Stripe error");
      });

      const req = new NextRequest(
        new Request("http://localhost/api/checkout", {
          method: "POST",
          body: JSON.stringify({ items: mockItems }),
        })
      );

      const response = await POST(req);
      expect(response.status).toBe(500);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[CHECKOUT_POST]"),
        expect.any(Error)
      );
    } finally {
      console.error = originalConsoleError;
    }
  });
});
