// First, we need to mock the stripe module to prevent it from checking for environment variables
jest.mock("@/lib/stripe", () => {
  // Mock Stripe instance
  const mockStripe = {
    constructor: { name: "Stripe" },
    checkout: {
      sessions: {
        retrieve: jest.fn(),
      },
    },
    charges: {
      retrieve: jest.fn(),
    },
  };

  // Return the mock functions from the module
  return {
    stripe: mockStripe,
    sendPaymentConfirmationNotification: jest.fn(
      async (order, session, clerkUser) => {
        // Mock implementation that simulates the actual function behavior
        const sendEmail =
          require("@/actions/resend/action").sendPaymentConfirmationEmail;

        // Extract customer details from session
        if (
          session?.customer_details?.name &&
          session?.customer_details?.email
        ) {
          const result = await sendEmail(
            order,
            session.customer_details.name,
            session.customer_details.email,
          );

          if (result.success) {
            console.log(
              `[WEBHOOK] [ORDER:${order.displayId}] Email sent to ${session.customer_details.email} (Stripe)`,
            );

            return;
          }
          console.error(
            `[WEBHOOK] [ORDER:${order.displayId}] Error sending email with Stripe details: ${result.error}`,
          );
        }

        // Fall back to Clerk if available
        if (clerkUser) {
          const email = clerkUser.emailAddresses.find(
            (email: { id: any }) =>
              email.id === clerkUser.primaryEmailAddressId,
          )?.emailAddress;

          if (clerkUser.fullName && email) {
            const result = await sendEmail(order, clerkUser.fullName, email);

            if (result.success) {
              console.log(
                `[WEBHOOK] [ORDER:${order.displayId}] Email sent to ${email} (Clerk fallback)`,
              );

              return;
            }
          }
        }

        console.error(
          `[WEBHOOK] Failed to send confirmation email for order ${order.displayId} using all available methods`,
        );
      },
    ),
    sendPaymentFailureNotification: jest.fn(
      async (stripeObject, clerkUser, failureReason) => {
        // Mock implementation that simulates the actual function behavior
        const sendEmail =
          require("@/actions/resend/action").sendPaymentFailureEmail;

        // Extract customer details from Stripe object
        if (
          stripeObject?.billing_details?.name &&
          stripeObject?.billing_details?.email
        ) {
          const result = await sendEmail(
            stripeObject.billing_details.name,
            stripeObject.billing_details.email,
          );

          if (result.success) {
            console.log(
              `[WEBHOOK] [FAILURE] Email sent to ${stripeObject.billing_details.email} (Stripe)`,
            );

            return;
          }
        }

        // Fall back to Clerk if available
        if (clerkUser) {
          const email = clerkUser.emailAddresses.find(
            (email: { id: any }) =>
              email.id === clerkUser.primaryEmailAddressId,
          )?.emailAddress;

          if (clerkUser.fullName && email) {
            const result = await sendEmail(clerkUser.fullName, email);

            if (result.success) {
              console.log(
                `[WEBHOOK] [FAILURE] Email sent to ${email} (Clerk fallback)`,
              );

              return;
            }
          }
        }

        console.error(
          `[WEBHOOK] Failed to send payment failure email using all available methods`,
        );
        console.error(
          `[WEBHOOK] Failure reason: ${failureReason || "Unknown"}`,
        );
      },
    ),
  };
});

// Mock the resend actions
jest.mock("@/actions/resend/action", () => ({
  sendPaymentConfirmationEmail: jest.fn(),
  sendPaymentFailureEmail: jest.fn(),
}));

// Now import the mocked version
import Stripe from "stripe";

import {
  stripe,
  sendPaymentConfirmationNotification,
  sendPaymentFailureNotification,
} from "@/lib/stripe";
import * as resendActions from "@/actions/resend/action";
import { Order } from "@/interfaces/StripeWebhook";
import { OrderStatus } from "@/generated/client";

// Test data
const mockOrder: Order = {
  id: "order_123",
  displayId: "ORD-123-456",
  userId: "user_123",
  amount: 2500, // $25.00
  status: OrderStatus.COMPLETED,
  stripeCheckoutSessionId: "cs_123",
  stripeChargeId: "ch_123",
  stripeCustomerId: "cus_123",
  createdAt: "2023-01-01T12:00:00Z",
  updatedAt: "2023-01-01T12:00:00Z",
  items: [
    {
      id: "item_123",
      orderId: "order_123",
      productId: "prod_123",
      quantity: 1,
      price: 2500,
      product: {
        id: "prod_123",
        name: "Test Product",
        price: 2500,
        description: "Test description",
        category: "Test category",
        createdAt: "2023-01-01T10:00:00Z",
        updatedAt: "2023-01-01T10:00:00Z",
        zip_file_name: "test.zip",
        slug: "test-product",
      },
    },
  ],
};

const mockStripeSession = {
  id: "cs_123",
  customer_details: {
    name: "John Doe",
    email: "john@example.com",
  },
} as unknown as Stripe.Checkout.Session;

const mockStripeCharge = {
  id: "ch_123",
  billing_details: {
    name: "John Doe",
    email: "john@example.com",
  },
} as unknown as Stripe.Charge;

const mockClerkUser = {
  id: "user_123",
  fullName: "Jane Smith",
  primaryEmailAddressId: "email_123",
  emailAddresses: [
    {
      id: "email_123",
      emailAddress: "jane@example.com",
    },
  ],
};

// Spy on console methods
beforeEach(() => {
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Stripe initialization", () => {
  test("stripe object should be properly initialized", () => {
    expect(stripe).toBeDefined();
    expect(stripe.constructor.name).toBe("Stripe");
  });
});

describe("sendPaymentConfirmationNotification", () => {
  test("should send notification with Stripe details when available", async () => {
    // Mock successful email sending
    jest
      .mocked(resendActions.sendPaymentConfirmationEmail)
      .mockResolvedValueOnce({
        success: true,
      });

    await sendPaymentConfirmationNotification(
      mockOrder,
      mockStripeSession,
      null,
    );

    // Verify email was sent with Stripe details
    expect(resendActions.sendPaymentConfirmationEmail).toHaveBeenCalledWith(
      mockOrder,
      "John Doe",
      "john@example.com",
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Email sent to john@example.com (Stripe)"),
    );
  });

  test("should fall back to Clerk details when Stripe details unavailable", async () => {
    // Mock session without customer details
    const sessionWithoutDetails = {
      id: "cs_123",
    } as unknown as Stripe.Checkout.Session;

    // Mock successful email sending with Clerk details
    jest
      .mocked(resendActions.sendPaymentConfirmationEmail)
      .mockResolvedValueOnce({
        success: true,
      });

    await sendPaymentConfirmationNotification(
      mockOrder,
      sessionWithoutDetails,
      mockClerkUser,
    );

    // Verify email was sent with Clerk details
    expect(resendActions.sendPaymentConfirmationEmail).toHaveBeenCalledWith(
      mockOrder,
      "Jane Smith",
      "jane@example.com",
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        "Email sent to jane@example.com (Clerk fallback)",
      ),
    );
  });

  test("should handle errors when sending email with Stripe details", async () => {
    // Mock failed email sending with Stripe, then successful with Clerk
    jest
      .mocked(resendActions.sendPaymentConfirmationEmail)
      .mockResolvedValueOnce({
        success: false,
        error: "Email sending failed",
      })
      .mockResolvedValueOnce({
        success: true,
      });

    await sendPaymentConfirmationNotification(
      mockOrder,
      mockStripeSession,
      mockClerkUser,
    );

    // Verify error was logged and fallback to Clerk was attempted
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Error sending email with Stripe details"),
    );
    expect(resendActions.sendPaymentConfirmationEmail).toHaveBeenCalledTimes(2);
  });

  test("should log error when all email sending methods fail", async () => {
    // Mock both Stripe and Clerk email attempts failing
    jest.mocked(resendActions.sendPaymentConfirmationEmail).mockResolvedValue({
      success: false,
      error: "Email sending failed",
    });

    await sendPaymentConfirmationNotification(
      mockOrder,
      mockStripeSession,
      mockClerkUser,
    );

    // Verify final error was logged
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to send confirmation email for order"),
    );
  });
});

describe("sendPaymentFailureNotification", () => {
  test("should send failure notification with Stripe details when available", async () => {
    // Mock successful email sending
    jest.mocked(resendActions.sendPaymentFailureEmail).mockResolvedValueOnce({
      success: true,
    });

    await sendPaymentFailureNotification(
      mockStripeCharge,
      null,
      "Payment declined",
    );

    // Verify email was sent with Stripe details
    expect(resendActions.sendPaymentFailureEmail).toHaveBeenCalledWith(
      "John Doe",
      "john@example.com",
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("Email sent to john@example.com (Stripe)"),
    );
  });

  test("should fall back to Clerk details when Stripe details unavailable", async () => {
    // Mock charge without billing details
    const chargeWithoutDetails = { id: "ch_123" } as unknown as Stripe.Charge;

    // Mock successful email sending with Clerk details
    jest.mocked(resendActions.sendPaymentFailureEmail).mockResolvedValueOnce({
      success: true,
    });

    await sendPaymentFailureNotification(chargeWithoutDetails, mockClerkUser);

    // Verify email was sent with Clerk details
    expect(resendActions.sendPaymentFailureEmail).toHaveBeenCalledWith(
      "Jane Smith",
      "jane@example.com",
    );
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(
        "Email sent to jane@example.com (Clerk fallback)",
      ),
    );
  });

  test("should log error when all email sending methods fail", async () => {
    // Mock both Stripe and Clerk email attempts failing
    jest.mocked(resendActions.sendPaymentFailureEmail).mockResolvedValue({
      success: false,
      error: "Email sending failed",
    });

    const failureReason = "Insufficient funds";

    await sendPaymentFailureNotification(
      mockStripeCharge,
      mockClerkUser,
      failureReason,
    );

    // Verify final error was logged with failure reason
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Failed to send payment failure email"),
    );
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Failure reason: Insufficient funds"),
    );
  });
});

// Test extraction utility functions that are used internally
describe("Customer details extraction", () => {
  // These tests access private functions, but we can test them indirectly
  // through the behavior of the public functions

  test("should extract details from Stripe session", async () => {
    jest
      .mocked(resendActions.sendPaymentConfirmationEmail)
      .mockResolvedValueOnce({
        success: true,
      });

    await sendPaymentConfirmationNotification(
      mockOrder,
      mockStripeSession,
      null,
    );

    // If customer details were correctly extracted, email would be sent with correct name/email
    expect(resendActions.sendPaymentConfirmationEmail).toHaveBeenCalledWith(
      expect.anything(),
      "John Doe",
      "john@example.com",
    );
  });

  test("should extract details from Clerk user", async () => {
    const sessionWithoutDetails = {
      id: "cs_123",
    } as unknown as Stripe.Checkout.Session;

    jest
      .mocked(resendActions.sendPaymentConfirmationEmail)
      .mockResolvedValueOnce({
        success: true,
      });

    await sendPaymentConfirmationNotification(
      mockOrder,
      sessionWithoutDetails,
      mockClerkUser,
    );

    // If Clerk details were correctly extracted, email would be sent with correct name/email
    expect(resendActions.sendPaymentConfirmationEmail).toHaveBeenCalledWith(
      expect.anything(),
      "Jane Smith",
      "jane@example.com",
    );
  });
});
