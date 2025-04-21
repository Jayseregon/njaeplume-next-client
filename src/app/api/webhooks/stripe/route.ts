import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns"; // Import date-fns for formatting

import { stripe } from "@/lib/stripe"; // Correct: Import server-side client

// Initialize Prisma client directly for webhook handler
// Ensure DATABASE_URL_AIVEN is set in your environment
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("Stripe webhook secret not set.");

    return new NextResponse("Webhook Error: Missing secret", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);

    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed event...");

    if (!session?.metadata?.userId || !session?.metadata?.cartItems) {
      console.error("Missing metadata in Stripe session:", session.id);

      return new NextResponse("Webhook Error: Missing metadata", {
        status: 400,
      });
    }

    const userId = session.metadata.userId;
    const cartItemsString = session.metadata.cartItems;
    const chargeId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (!chargeId) {
      console.error("Missing charge ID in Stripe session:", session.id);

      return new NextResponse("Webhook Error: Missing charge ID", {
        status: 400,
      });
    }

    try {
      const cartItems: { id: string; price: number }[] =
        JSON.parse(cartItemsString);
      const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

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

      // Create the Order and OrderItems in the database
      await prisma.order.create({
        data: {
          displayId: finalDisplayId, // Add the generated displayId
          userId: userId,
          amount: totalAmount,
          status: "COMPLETED",
          stripeChargeId: chargeId,
          items: {
            create: cartItems.map((item) => ({
              productId: item.id,
              price: item.price, // Use price from metadata (price at time of purchase)
              quantity: 1, // Assuming quantity 1
            })),
          },
        },
        include: {
          items: true, // Include items to confirm creation
        },
      });

      console.log(
        `Order ${finalDisplayId} created successfully for user ${userId}, charge ${chargeId}`,
      );

      // TODO: Optionally trigger email confirmation here
    } catch (error) {
      console.error("Error processing webhook and creating order:", error);

      // Don't return 500 immediately, Stripe might retry.
      // Log the error thoroughly.
      // Consider specific error handling (e.g., if product ID doesn't exist)
      return new NextResponse("Webhook Error: Failed to process order", {
        status: 500,
      });
    }
  }
  // Handle other event types if needed (e.g., payment_intent.succeeded, payment_intent.payment_failed)
  else if (event.type === "checkout.session.async_payment_failed") {
    console.warn("Checkout session payment failed:", session.id);
    // Optionally update order status to FAILED if you created a PENDING order earlier
  } else {
    console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  return new NextResponse(null, { status: 200 });
}
