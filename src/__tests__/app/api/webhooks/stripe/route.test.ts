import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";

import {
  stripe,
  sendPaymentConfirmationNotification,
  sendPaymentFailureNotification,
} from "@/lib/stripe";
import { POST } from "@/app/api/webhooks/stripe/route";

// Mock global Request object which is not available in Node.js environment
global.Request = jest.fn().mockImplementation((url, options = {}) => ({
  url,
  method: options.method || "GET",
  headers: new Map(Object.entries(options.headers || {})),
  body: options.body,
  json: async () => JSON.parse(options.body || "{}"),
  text: async () => options.body || "",
}));

// Mock NextRequest and NextResponse
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
      text: async () => request.body || "",
    })),
    NextResponse: {
      json: (data: any, options: { status: any }) => ({
        status: options?.status || 200,
        json: async () => data,
      }),
    },
  };
});

// Mock environment variables
const originalEnv = process.env;

// Mock Headers
jest.mock("next/headers", () => ({
  headers: jest.fn(),
}));

// Mock Clerk currentUser
jest.mock("@clerk/nextjs/server", () => ({
  currentUser: jest.fn(),
}));

// Mock stripe library and functions
jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
  sendPaymentConfirmationNotification: jest.fn().mockResolvedValue(undefined),
  sendPaymentFailureNotification: jest.fn().mockResolvedValue(undefined),
}));

// Mock Prisma
const mockOrderCreate = jest.fn();
const mockOrderFindFirst = jest.fn();
const mockOrderFindUniqueOrThrow = jest.fn();
const mockOrderItemCreateMany = jest.fn();
const mockTransaction = jest.fn();

jest.mock("@/lib/prismaClient", () => ({
  prisma: {
    order: {
      findFirst: (...args: any[]) => mockOrderFindFirst(...args),
      create: (...args: any[]) => mockOrderCreate(...args),
      findUniqueOrThrow: (...args: any[]) =>
        mockOrderFindUniqueOrThrow(...args),
    },
    orderItem: {
      createMany: (...args: any[]) => mockOrderItemCreateMany(...args),
    },
    $transaction: (callback: any) => mockTransaction(callback),
  },
}));

// Mock console methods to prevent noise during tests
let originalConsoleLog: typeof console.log;
let originalConsoleError: typeof console.error;
let originalConsoleWarn: typeof console.warn;

describe("Stripe Webhook Handler", () => {
  // Define default locale for tests, matching the one in route.ts
  const defaultLocale = "en";

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    // Save original console methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;

    // Mock console methods to prevent output during tests
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();

    process.env = {
      ...originalEnv,
      STRIPE_WEBHOOK_SECRET: "whsec_test_secret",
    };

    (headers as jest.Mock).mockReturnValue({
      get: jest.fn().mockImplementation((header: string) => {
        if (header === "Stripe-Signature") return "sig_valid";

        return null;
      }),
    });

    (currentUser as jest.Mock).mockResolvedValue({
      id: "user_123",
      emailAddresses: [{ id: "email_123", emailAddress: "user@example.com" }],
      primaryEmailAddressId: "email_123",
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe("Signature Verification", () => {
    it("returns 400 if Stripe signature is missing", async () => {
      (headers as jest.Mock).mockReturnValue({
        get: jest.fn().mockImplementation(() => {
          return null;
        }),
      });

      // Updated NextRequest construction
      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data.error).toContain("Webhook secret not configured");
    });

    it("returns 400 if Stripe signature verification fails", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error("Invalid signature");
      });

      // Updated NextRequest construction
      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data.error).toContain("Webhook Error");
    });
  });

  describe("Event Handling", () => {
    it("handles checkout.session.completed event, creates order, and sends notification with locale", async () => {
      // Mock checkout.session.completed event with locale
      const checkoutSessionCompletedEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            metadata: {
              userId: "user_123",
              cartItems: JSON.stringify([
                { id: "prod_123", price: 29.99 },
                { id: "prod_456", price: 19.99 },
              ]),
              locale: "fr", // Add locale to metadata
            },
            amount_total: 4998,
            payment_intent: "pi_test_123",
            customer: "cus_test_123",
            customer_details: {
              email: "customer@example.com",
              name: "Test Customer",
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        checkoutSessionCompletedEvent,
      );

      // Mock order creation transaction
      const mockCreatedOrder = {
        id: "ord_123",
        displayId: "NJAE2023-OID1225-123456ABCD",
        userId: "user_123",
        amount: 49.98,
        status: "COMPLETED",
        stripeCheckoutSessionId: "cs_test_123",
        stripeChargeId: "pi_test_123",
        stripeCustomerId: "cus_test_123",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          {
            id: "item_123",
            orderId: "ord_123",
            productId: "prod_123",
            quantity: 1,
            price: 29.99,
            product: {
              id: "prod_123",
              name: "Digital Brush Pack",
              price: 29.99,
              description: "A set of digital brushes",
              category: "brushes",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              zip_file_name: "brushes.zip",
              slug: "digital-brush-pack",
            },
          },
          {
            id: "item_456",
            orderId: "ord_123",
            productId: "prod_456",
            quantity: 1,
            price: 19.99,
            product: {
              id: "prod_456",
              name: "Digital Stickers",
              price: 19.99,
              description: "A set of digital stickers",
              category: "stickers",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              zip_file_name: "stickers.zip",
              slug: "digital-stickers",
            },
          },
        ],
      };

      mockOrderFindFirst.mockResolvedValue(null); // No existing order
      mockTransaction.mockImplementation(() => {
        return Promise.resolve(mockCreatedOrder);
      });

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.received).toBe(true);

      // Verify transaction was called
      expect(mockTransaction).toHaveBeenCalled();

      // Verify confirmation email was sent with the correct locale
      expect(sendPaymentConfirmationNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "ord_123",
          displayId: "NJAE2023-OID1225-123456ABCD",
        }),
        expect.objectContaining({ id: "cs_test_123" }),
        expect.objectContaining({ id: "user_123" }),
        "fr", // Verify locale is passed
      );
    });

    it("handles checkout.session.completed event and uses default locale if missing in metadata", async () => {
      // Mock event without locale in metadata
      const checkoutSessionCompletedEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_no_locale",
            metadata: {
              // No locale key
              userId: "user_123",
              cartItems: JSON.stringify([{ id: "prod_123", price: 29.99 }]),
            },
            amount_total: 2999,
            payment_intent: "pi_test_no_locale",
            customer: "cus_test_123",
            customer_details: {
              email: "customer@example.com",
              name: "Test Customer",
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        checkoutSessionCompletedEvent,
      );

      const mockCreatedOrder = {
        id: "ord_no_locale",
        displayId: "ORD-NO-LOCALE",
        items: [] /* ... other order details ... */,
      };

      mockOrderFindFirst.mockResolvedValue(null);
      mockTransaction.mockImplementation(() =>
        Promise.resolve(mockCreatedOrder),
      );

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      await POST(req);

      // Verify confirmation email was sent with the default locale
      expect(sendPaymentConfirmationNotification).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        defaultLocale, // Verify hardcoded default locale is used
      );
    });

    it("handles checkout.session.completed event and uses default locale if locale is invalid", async () => {
      // Mock event with invalid locale
      const checkoutSessionCompletedEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_invalid_locale",
            metadata: {
              userId: "user_123",
              cartItems: JSON.stringify([{ id: "prod_123", price: 29.99 }]),
              locale: "xx", // Invalid locale
            },
            amount_total: 2999,
            payment_intent: "pi_test_invalid_locale",
            customer: "cus_test_123",
            customer_details: {
              email: "customer@example.com",
              name: "Test Customer",
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        checkoutSessionCompletedEvent,
      );

      const mockCreatedOrder = {
        id: "ord_invalid_locale",
        displayId: "ORD-INVALID-LOCALE",
        items: [] /* ... other order details ... */,
      };

      mockOrderFindFirst.mockResolvedValue(null);
      mockTransaction.mockImplementation(() =>
        Promise.resolve(mockCreatedOrder),
      );

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      await POST(req);

      // Verify confirmation email was sent with the default locale
      expect(sendPaymentConfirmationNotification).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.anything(),
        defaultLocale, // Verify hardcoded default locale is used
      );
    });

    it("handles idempotency by skipping already processed checkout sessions", async () => {
      // Mock checkout.session.completed event
      const checkoutSessionCompletedEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_123",
            metadata: {
              userId: "user_123",
              cartItems: JSON.stringify([{ id: "prod_123", price: 29.99 }]),
            },
            amount_total: 2999, // $29.99 in cents
            payment_intent: "pi_test_123",
            customer: "cus_test_123",
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        checkoutSessionCompletedEvent,
      );

      // Mock existing order to trigger idempotency check
      mockOrderFindFirst.mockResolvedValue({
        id: "ord_123",
        displayId: "NJAE2023-OID1225-123456ABCD",
        stripeCheckoutSessionId: "cs_test_123",
      });

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.received).toBe(true);

      // Verify transaction was NOT called (idempotency check prevented it)
      expect(mockTransaction).not.toHaveBeenCalled();

      // Verify email was NOT sent again
      expect(sendPaymentConfirmationNotification).not.toHaveBeenCalled();
    });

    it("handles checkout.session.async_payment_failed event with locale", async () => {
      // Mock event with locale
      const asyncPaymentFailedEvent = {
        type: "checkout.session.async_payment_failed",
        data: {
          object: {
            id: "cs_test_failed",
            metadata: {
              locale: "fr", // Add locale
            },
            customer_details: {
              email: "customer@example.com",
              name: "Test Customer",
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        asyncPaymentFailedEvent,
      );

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );
      const response = await POST(req);

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.received).toBe(true);

      // Verify failure email was sent with locale
      expect(sendPaymentFailureNotification).toHaveBeenCalledWith(
        expect.objectContaining({ id: "cs_test_failed" }),
        expect.anything(),
        expect.any(String),
        "fr", // Verify locale
      );
    });

    it("handles checkout.session.async_payment_failed event with default locale", async () => {
      // Mock event without locale
      const asyncPaymentFailedEvent = {
        type: "checkout.session.async_payment_failed",
        data: {
          object: {
            id: "cs_test_failed_no_locale",
            metadata: {}, // No locale
            customer_details: {
              email: "customer@example.com",
              name: "Test Customer",
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        asyncPaymentFailedEvent,
      );

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      await POST(req);

      // Verify failure email was sent with default locale
      expect(sendPaymentFailureNotification).toHaveBeenCalledWith(
        expect.objectContaining({ id: "cs_test_failed_no_locale" }),
        expect.anything(),
        expect.any(String),
        defaultLocale, // Verify hardcoded default locale
      );
    });

    it("handles charge.failed event with default locale", async () => {
      // Mock charge.failed event
      const chargeFailedEvent = {
        type: "charge.failed",
        data: {
          object: {
            id: "ch_test_failed",
            failure_message: "Your card was declined",
            billing_details: {
              email: "customer@example.com",
              name: "Test Customer",
            },
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        chargeFailedEvent,
      );

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );
      const response = await POST(req);

      expect(response.status).toBe(200);

      const data = await response.json();

      expect(data.received).toBe(true);

      // Verify failure email was sent with the default locale
      expect(sendPaymentFailureNotification).toHaveBeenCalledWith(
        expect.objectContaining({ id: "ch_test_failed" }),
        expect.anything(),
        "Your card was declined",
        defaultLocale, // Verify hardcoded default locale
      );
    });
  });

  describe("Error Handling", () => {
    it("returns 400 when missing required session data", async () => {
      // Mock incomplete checkout.session.completed event (missing cartItems)
      const incompleteSessionEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_incomplete",
            metadata: {
              userId: "user_123",
              // Missing cartItems
            },
            amount_total: 2999,
            payment_intent: "pi_test_123",
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        incompleteSessionEvent,
      );
      mockOrderFindFirst.mockResolvedValue(null);

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data.error).toContain("Missing required session data");
    });

    it("returns 400 when cartItems metadata is not valid JSON", async () => {
      // Mock session with invalid JSON in cartItems
      const invalidCartItemsEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_invalid_json",
            metadata: {
              userId: "user_123",
              cartItems: "{invalid-json", // Invalid JSON
            },
            amount_total: 2999,
            payment_intent: "pi_test_123",
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        invalidCartItemsEvent,
      );
      mockOrderFindFirst.mockResolvedValue(null);

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data.error).toContain("Invalid metadata format");
    });

    it("returns 400 when cartItems is empty or not an array", async () => {
      // Mock session with empty array in cartItems
      const emptyCartItemsEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_empty_array",
            metadata: {
              userId: "user_123",
              cartItems: "[]", // Empty array
            },
            amount_total: 2999,
            payment_intent: "pi_test_123",
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        emptyCartItemsEvent,
      );
      mockOrderFindFirst.mockResolvedValue(null);

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(400);

      const data = await response.json();

      expect(data.error).toContain("Invalid metadata content");
    });

    it("returns 500 when database transaction fails", async () => {
      // Mock checkout.session.completed event
      const checkoutSessionCompletedEvent = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_db_error",
            metadata: {
              userId: "user_123",
              cartItems: JSON.stringify([{ id: "prod_123", price: 29.99 }]),
            },
            amount_total: 2999,
            payment_intent: "pi_test_123",
            customer: "cus_test_123",
          },
        },
      };

      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
        checkoutSessionCompletedEvent,
      );
      mockOrderFindFirst.mockResolvedValue(null);

      // Mock database transaction failure
      mockTransaction.mockRejectedValue(new Error("Database error"));

      const req = new NextRequest(
        new Request("http://localhost/api/webhooks/stripe", {
          method: "POST",
          body: JSON.stringify({}),
        }),
      );

      const response = await POST(req);

      expect(response.status).toBe(500);

      const data = await response.json();

      expect(data.error).toContain("Database error during order creation");

      // Verify error was logged
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("ignores irrelevant event types", async () => {
    // Mock an irrelevant event type
    const irrelevantEvent = {
      type: "product.created", // Not in our relevantEvents set
      data: {
        object: {
          id: "prod_123",
        },
      },
    };

    (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue(
      irrelevantEvent,
    );

    const req = new NextRequest(
      new Request("http://localhost/api/webhooks/stripe", {
        method: "POST",
        body: JSON.stringify({}),
      }),
    );

    const response = await POST(req);

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data.received).toBe(true);

    // Verify no actions were taken
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(sendPaymentConfirmationNotification).not.toHaveBeenCalled();
    expect(sendPaymentFailureNotification).not.toHaveBeenCalled();
  });
});
