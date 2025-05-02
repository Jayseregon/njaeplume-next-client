import Stripe from "stripe";

import { Order } from "@/interfaces/StripeWebhook";
import {
  sendPaymentConfirmationEmail,
  sendPaymentFailureEmail,
} from "@/actions/resend/action";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
});

function extractCustomerDetails(
  stripeObject: Stripe.Checkout.Session | Stripe.Charge,
) {
  let name: string | null = null;
  let email: string | null = null;

  // Handle Checkout Session
  if ("customer_details" in stripeObject && stripeObject.customer_details) {
    name = stripeObject.customer_details.name;
    email = stripeObject.customer_details.email;
  }
  // Handle Charge
  else if ("billing_details" in stripeObject && stripeObject.billing_details) {
    name = stripeObject.billing_details.name || null;
    email = stripeObject.billing_details.email || null;
  }

  return { name, email };
}

function extractClerkUserDetails(clerkUser: any) {
  if (!clerkUser) return { name: null, email: null };

  const email = clerkUser.emailAddresses.find(
    (email: any) => email.id === clerkUser.primaryEmailAddressId,
  )?.emailAddress;

  const name = clerkUser.fullName;

  return { name, email };
}

function logEmailResult(
  result: { success: boolean; error?: string },
  email: string,
  logPrefix: string,
  source: string = "Stripe",
) {
  if (result.error) {
    console.error(
      `${logPrefix} Error sending email with ${source} details: ${result.error}`,
    );

    return false;
  } else {
    console.log(
      `${logPrefix} Email sent to ${email} (${source === "Clerk" ? "Clerk fallback" : "Stripe"})`,
    );

    return true;
  }
}

export async function sendPaymentConfirmationNotification(
  order: Order,
  session: Stripe.Checkout.Session,
  clerkUser: any,
): Promise<void> {
  const logPrefix = `[WEBHOOK] [ORDER:${order.displayId}]`;
  let emailSent = false;

  // Try with Stripe customer details first
  const stripeDetails = extractCustomerDetails(session);

  if (stripeDetails.name && stripeDetails.email) {
    try {
      const result = await sendPaymentConfirmationEmail(
        order,
        stripeDetails.name,
        stripeDetails.email,
      );

      emailSent = logEmailResult(
        result,
        stripeDetails.email,
        logPrefix,
        "Stripe",
      );
    } catch (error) {
      console.error(
        `${logPrefix} Unexpected error sending email with Stripe details:`,
        error,
      );
    }
  } else {
    console.warn(`${logPrefix} No customer details found in Stripe session`);
  }

  // Fall back to Clerk user if email wasn't sent
  if (!emailSent && clerkUser) {
    const clerkDetails = extractClerkUserDetails(clerkUser);

    if (clerkDetails.name && clerkDetails.email) {
      try {
        const result = await sendPaymentConfirmationEmail(
          order,
          clerkDetails.name,
          clerkDetails.email,
        );

        emailSent = logEmailResult(
          result,
          clerkDetails.email,
          logPrefix,
          "Clerk",
        );
      } catch (error) {
        console.error(
          `${logPrefix} Unexpected error sending email with Clerk details:`,
          error,
        );
      }
    } else {
      console.warn(`${logPrefix} Incomplete Clerk user details`);
    }
  }

  if (!emailSent) {
    console.error(
      `[WEBHOOK] Failed to send confirmation email for order ${order.displayId} using all available methods`,
    );
  }
}

export async function sendPaymentFailureNotification(
  stripeObject: Stripe.Checkout.Session | Stripe.Charge,
  clerkUser: any,
  failureReason?: string,
): Promise<void> {
  const logPrefix = "[WEBHOOK] [FAILURE]";
  let emailSent = false;

  // Try with Stripe customer details first
  const stripeDetails = extractCustomerDetails(stripeObject);

  if (stripeDetails.name && stripeDetails.email) {
    try {
      const result = await sendPaymentFailureEmail(
        stripeDetails.name,
        stripeDetails.email,
      );

      emailSent = logEmailResult(
        result,
        stripeDetails.email,
        logPrefix,
        "Stripe",
      );
    } catch (error) {
      console.error(
        `${logPrefix} Unexpected error sending failure email with Stripe details:`,
        error,
      );
    }
  } else {
    console.warn(
      `${logPrefix} No customer details found in Stripe object for payment failure notification`,
    );
  }

  // Fall back to Clerk user if email wasn't sent
  if (!emailSent && clerkUser) {
    const clerkDetails = extractClerkUserDetails(clerkUser);

    if (clerkDetails.name && clerkDetails.email) {
      try {
        const result = await sendPaymentFailureEmail(
          clerkDetails.name,
          clerkDetails.email,
        );

        emailSent = logEmailResult(
          result,
          clerkDetails.email,
          logPrefix,
          "Clerk",
        );
      } catch (error) {
        console.error(
          `${logPrefix} Unexpected error sending failure email with Clerk details:`,
          error,
        );
      }
    } else {
      console.warn(`${logPrefix} Incomplete Clerk user details`);
    }
  }

  if (!emailSent) {
    console.error(
      `[WEBHOOK] Failed to send payment failure email using all available methods`,
    );
    console.error(`[WEBHOOK] Failure reason: ${failureReason || "Unknown"}`);
  }
}
