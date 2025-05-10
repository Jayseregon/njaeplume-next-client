import { NextRequest } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers"; // Import cookies

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

// Mock NextRequest and NextResponse
jest.mock("next/server", () => ({
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
    json: (data: any, options?: { status?: number }) => ({
      // Make options optional
      status: options?.status || 200,
      json: async () => data,
    }),
  },
}));

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(), // Mock cookies function
  headers: jest.fn(() => new Map()), // Mock headers if needed elsewhere
}));

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

// Sample test data (ensure it matches Zod schema)
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
    category: Category.brushes, // Use enum value
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
    // Default mock for cookies
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(undefined), // Default to no locale cookie
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
      }),
    );

    const response = await POST(req);

    expect(response.status).toBe(401);

    const data = await response.json();

    expect(data.error).toBe("Unauthorized");
  });

  it("returns 400 when validation fails (Zod)", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    // Invalid payload - missing required fields (e.g., price, category)
    const invalidItems = [{ id: "invalid", name: "Invalid Item" }];
    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: invalidItems }),
      }),
    );

    const response = await POST(req);

    expect(response.status).toBe(400);
    const data = await response.json();

    // Expect structured Zod error
    expect(data.error).toBe("Invalid input");
    expect(data.details).toBeDefined();
    expect(console.error).toHaveBeenCalledWith(
      "Checkout validation failed:",
      expect.any(Array),
    );
  });

  it("returns 400 when cart is empty", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: [] }),
      }),
    );

    const response = await POST(req);

    expect(response.status).toBe(400);

    const data = await response.json();

    expect(data.error).toBe("Cart is empty");
  });

  it("creates a Stripe checkout session with locale and returns the URL", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);
    // Mock cookies to return 'fr' locale
    (cookies as jest.Mock).mockReturnValue({
      get: jest.fn((name) => {
        if (name === "NEXT_LOCALE") {
          return { name: "NEXT_LOCALE", value: "fr" };
        }

        return undefined;
      }),
    });

    const mockSession = {
      id: "cs_test_123",
      url: "https://checkout.stripe.com/123",
    };

    (stripe.checkout.sessions.create as jest.Mock).mockResolvedValue(
      mockSession,
    );
    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: mockItems }),
      }),
    );

    const response = await POST(req);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.url).toBe(mockSession.url);

    // Verify Stripe call includes locale in metadata and correct currency
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_method_types: ["card"],
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "cad", // Check currency
              unit_amount: Math.round(mockItems[0].price * 100),
              product_data: expect.objectContaining({
                name: mockItems[0].name,
                description: mockItems[0].tags[0].slug, // Add description check
                images: [
                  `${process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL}/${mockItems[0].images[0].url}`,
                ], // Add images check
              }),
            }),
            quantity: 1,
          }),
        ]),
        mode: "payment",
        metadata: expect.objectContaining({
          userId: "user_123",
          cartItems: JSON.stringify(
            mockItems.map((item) => ({ id: item.id, price: item.price })),
          ),
          locale: "fr", // Check locale from cookie mock
        }),
        customer_email: "test@example.com",
        // Use the actual URLs based on environment variables
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
      }),
    );
  });

  it("returns 500 when metadata string is too long", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    // Create items that will exceed metadata limit when stringified
    const longItems = Array(50)
      .fill(null)
      .map((_, i) => ({
        ...mockItems[0],
        id: `product_${i}_${"longid".repeat(10)}`, // Make ID longer
        price: 10.0 + i,
      }));

    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: longItems }),
      }),
    );

    const response = await POST(req);

    expect(response.status).toBe(500);
    const data = await response.json();

    // Expect structured error
    expect(data.error).toBe(
      "Checkout failed due to internal error (metadata).",
    );
    expect(console.error).toHaveBeenCalledWith(
      "Metadata string too long for Stripe Checkout",
    );
  });

  it("returns 500 when Stripe checkout creation fails", async () => {
    (auth as unknown as jest.Mock).mockResolvedValue({ userId: "user_123" });
    (currentUser as jest.Mock).mockResolvedValue(mockUser);

    (stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
      new Error("Stripe API error"),
    );

    const req = new NextRequest(
      new Request("http://localhost/api/checkout", {
        method: "POST",
        body: JSON.stringify({ items: mockItems }),
      }),
    );

    const response = await POST(req);

    expect(response.status).toBe(500);

    const data = await response.json();

    expect(data.error).toBe("Could not create checkout session.");

    // Verify error logging occurred
    expect(console.error).toHaveBeenCalledWith(
      "[CHECKOUT_POST] Error creating checkout session:",
      expect.any(Error),
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
      }),
    );

    await POST(req);

    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: "different@example.com",
      }),
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
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(500);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("[CHECKOUT_POST]"),
        expect.any(Error),
      );
    } finally {
      console.error = originalConsoleError;
    }
  });
});
