import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { format } from "date-fns";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prismaClient";
// import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from "@/actions/resend/emails"; // Import email functions when ready

const relevantEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_failed", // Added for async failures
  "charge.failed", // Keep for direct charge failures if applicable
  // Add other events as needed, e.g., payment_intent.succeeded, payment_intent.payment_failed
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error("[WEBHOOK] Stripe webhook secret or signature missing.");

    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(
      `[WEBHOOK] Webhook signature verification failed: ${err.message}`,
    );

    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 },
    );
  }

  console.log(`[WEBHOOK] Received event: ${event.type}`);

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;

          console.log(
            `[WEBHOOK] Handling checkout.session.completed: ${session.id}`,
          );

          const userId = session.metadata?.userId;
          const cartItemsString = session.metadata?.cartItems;
          const stripeCustomerId = session.customer as string; // Can be null if customer wasn't created/attached
          const amountTotal = session.amount_total;
          const customerEmail = session.customer_details?.email; // Email used in checkout
          const paymentIntentId = session.payment_intent as string;

          if (!userId || !cartItemsString || !amountTotal || !paymentIntentId) {
            console.error(
              "[WEBHOOK] Missing metadata, amount, or payment intent in checkout session:",
              session.id,
            );

            return NextResponse.json(
              { error: "Missing required session data" },
              { status: 400 },
            ); // Bad request, don't retry
          }

          // Idempotency Check
          const existingOrder = await prisma.order.findFirst({
            where: { stripeCheckoutSessionId: session.id },
          });

          if (existingOrder) {
            console.log(
              `[WEBHOOK] Order already exists for session ${session.id}. Skipping.`,
            );

            return NextResponse.json({ received: true });
          }

          let parsedCartItems: { id: string; price: number }[] = [];

          try {
            parsedCartItems = JSON.parse(cartItemsString);
          } catch (parseError) {
            console.error(
              "[WEBHOOK] Failed to parse cartItems metadata:",
              session.id,
              parseError,
            );

            return NextResponse.json(
              { error: "Invalid metadata format" },
              { status: 400 },
            ); // Bad request
          }

          if (!Array.isArray(parsedCartItems) || parsedCartItems.length === 0) {
            console.error(
              "[WEBHOOK] Parsed cartItems metadata is empty or not an array:",
              session.id,
            );

            return NextResponse.json(
              { error: "Invalid metadata content" },
              { status: 400 },
            ); // Bad request
          }

          // --- Generate Display ID ---
          const now = new Date();
          const displayId = `NJAE${format(now, "yyyy")}-OID${format(now, "MMdd-HHmmss")}`;
          // Add a small random suffix to decrease collision chance in high concurrency
          const randomSuffix = Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase();
          const finalDisplayId = `${displayId}${randomSuffix}`;
          // --- End Generate Display ID ---

          // Create Order and Items in a Transaction
          try {
            const newOrder = await prisma.$transaction(async (tx) => {
              const order = await tx.order.create({
                data: {
                  displayId: finalDisplayId,
                  userId: userId,
                  amount: amountTotal / 100, // Convert from cents
                  status: "COMPLETED",
                  stripeCheckoutSessionId: session.id,
                  stripeChargeId: paymentIntentId,
                  stripeCustomerId: stripeCustomerId,
                },
              });

              await tx.orderItem.createMany({
                data: parsedCartItems.map((item) => ({
                  orderId: order.id,
                  productId: item.id,
                  price: item.price, // Store price paid at time of checkout
                })),
              });

              // Return the created order with necessary includes for email
              return await tx.order.findUniqueOrThrow({
                where: { id: order.id },
                include: {
                  items: { include: { product: true } },
                },
              });
            });

            console.log(
              `[WEBHOOK] Order ${newOrder.displayId} created successfully via transaction.`,
            );

            // --- Send Success Email (Placeholder) ---
            // Use customerEmail from session details as primary source
            // const userEmailForSuccess = customerEmail;
            // if (userEmailForSuccess) {
            //   await sendOrderConfirmationEmail(userEmailForSuccess, newOrder);
            //   console.log(`[WEBHOOK] Sent order confirmation email to ${userEmailForSuccess}`);
            // } else {
            //   console.warn(`[WEBHOOK] No email found to send confirmation for order ${newOrder.displayId}`);
            // }
            // ----------------------------------------
          } catch (dbError) {
            console.error(
              "[WEBHOOK] Database transaction failed for order creation:",
              session.id,
              dbError,
            );

            return NextResponse.json(
              { error: "Database error during order creation" },
              { status: 500 },
            ); // Internal server error, trigger retry
          }
          break;
        }

        case "checkout.session.async_payment_failed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const customerEmail = session.customer_details?.email;

          console.warn(
            `[WEBHOOK] Handling checkout.session.async_payment_failed: ${session.id}`,
          );
          // Log relevant details for debugging
          console.warn(
            `[WEBHOOK] Failure details: Session ID: ${session.id}, Customer Email: ${customerEmail}`,
          );

          // --- Send Failure Email (Placeholder) ---
          // if (customerEmail) {
          //   await sendPaymentFailedEmail(customerEmail, "Your recent payment attempt failed. Please update your payment method or try again.");
          //   console.log(`[WEBHOOK] Sent payment failure email to ${customerEmail} for session ${session.id}`);
          // } else {
          //   console.warn(`[WEBHOOK] No customer email found on session ${session.id} to send failure notification.`);
          // }
          // ----------------------------------------
          // No order is created, so just acknowledge the event
          break;
        }

        case "charge.failed": {
          const charge = event.data.object as Stripe.Charge;
          const customerId = charge.customer as string;
          const customerEmail: string | null = charge.billing_details?.email;

          console.warn(
            `[WEBHOOK] Handling charge.failed: ${charge.id}, Reason: ${charge.failure_message}`,
          );

          // Attempt to get email from customer object if not on charge
          // if (!customerEmail && customerId) {
          //   try {
          //     const customer = await stripe.customers.retrieve(customerId);
          //     if (!customer.deleted) {
          //       customerEmail = customer.email;
          //     }
          //   } catch (customerError) {
          //     console.error(`[WEBHOOK] Error retrieving customer ${customerId} for failed charge ${charge.id}:`, customerError);
          //   }
          // }

          // --- Send Failure Email (Placeholder) ---
          // if (customerEmail) {
          //   await sendPaymentFailedEmail(customerEmail, `A charge attempt failed. Reason: ${charge.failure_message || 'Unknown'}. Please update your payment method.`);
          //   console.log(`[WEBHOOK] Sent charge failure email to ${customerEmail} for charge ${charge.id}`);
          // } else {
          //   console.warn(`[WEBHOOK] No customer email found for failed charge ${charge.id} to send notification.`);
          // }
          // ----------------------------------------
          // No order is created
          break;
        }

        default:
          console.warn(
            `[WEBHOOK] Unhandled relevant event type: ${event.type}`,
          );
      }
    } catch (error) {
      console.error(
        "[WEBHOOK] Error handling webhook event:",
        event.type,
        error,
      );
      // Don't return 500 for errors during failure handling, as the primary event (payment) already failed.
      // Only return 500 for unexpected errors during *success* processing that need retry.
      if (event.type === "checkout.session.completed") {
        return NextResponse.json(
          { error: "Internal server error handling event." },
          { status: 500 },
        );
      }
    }
  }

  // Acknowledge receipt of the event to Stripe
  return NextResponse.json({ received: true });
}
