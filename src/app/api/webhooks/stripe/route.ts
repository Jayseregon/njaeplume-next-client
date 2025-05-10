import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { format } from "date-fns";
import { currentUser } from "@clerk/nextjs/server";

import {
  sendPaymentConfirmationNotification,
  sendPaymentFailureNotification,
  stripe,
} from "@/lib/stripe";
import { prisma } from "@/lib/prismaClient";
import { Order } from "@/interfaces/StripeWebhook";

// Define supported locales and default locale directly
const supportedLocales = ["en", "fr"];
const defaultLocale = "en";

const relevantEvents = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_failed", // Added for async failures
  "charge.failed", // Keep for direct charge failures if applicable
  // Add other events as needed, e.g., payment_intent.succeeded, payment_intent.payment_failed
]);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const user = await currentUser();
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
          const localeFromMeta = session.metadata?.locale;
          // Use hardcoded values for validation and fallback
          const locale =
            localeFromMeta && supportedLocales.includes(localeFromMeta)
              ? localeFromMeta
              : defaultLocale; // Fallback to hardcoded default

          console.log(`[WEBHOOK] Locale from metadata: ${locale}`);

          const stripeCustomerId = session.customer as string; // Can be null if customer wasn't created/attached
          const amountTotal = session.amount_total;
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

            // Add a check for already sent emails to prevent duplicate emails
            console.log(
              `[WEBHOOK] Assuming email was already sent for existing order ${existingOrder.displayId}`,
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
            const newOrder = (await prisma.$transaction(async (tx) => {
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
                  price: item.price,
                })),
              });

              // Return the created order with necessary data for email
              return await tx.order.findUniqueOrThrow({
                where: { id: order.id },
                include: {
                  items: { include: { product: true } },
                },
              });
            })) as unknown as Order;

            console.log(
              `[WEBHOOK] Order ${newOrder.displayId} created successfully via transaction.`,
            );

            await sendPaymentConfirmationNotification(
              newOrder,
              session,
              user,
              locale, // Pass the determined locale
            );
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
          // Attempt to get locale from metadata, fallback to default
          const localeFromMeta = session.metadata?.locale;
          // Use hardcoded values for validation and fallback
          const locale =
            localeFromMeta && supportedLocales.includes(localeFromMeta)
              ? localeFromMeta
              : defaultLocale;

          console.log(
            `[WEBHOOK] Locale for async failure (from meta or default): ${locale}`,
          );

          console.warn(
            `[WEBHOOK] Handling checkout.session.async_payment_failed: ${session.id}`,
          );
          console.warn(
            `[WEBHOOK] Failure details: Session ID: ${session.id}, Customer Email: ${customerEmail}`,
          );

          // Send failure email notification with locale
          await sendPaymentFailureNotification(
            session,
            user,
            "Your recent payment attempt failed. Please update your payment method or try again.",
            locale, // Pass determined locale
          );

          // No order is created, so just acknowledge the events
          break;
        }

        case "charge.failed": {
          const charge = event.data.object as Stripe.Charge;
          // Locale might not be easily available here. Defaulting.
          const locale = defaultLocale; // Use hardcoded default

          console.log(
            `[WEBHOOK] Locale for charge failure (defaulting): ${locale}`,
          );

          console.warn(
            `[WEBHOOK] Handling charge.failed: ${charge.id}, Reason: ${charge.failure_message}`,
          );

          // Send failure email notification with locale
          await sendPaymentFailureNotification(
            charge,
            user,
            charge.failure_message ||
              "Your payment could not be processed. Please try again with a different payment method.",
            locale, // Pass determined (default) locale
          );

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
