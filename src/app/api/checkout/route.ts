import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import Stripe from "stripe";

import { Category } from "@/generated/client";
import { stripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      category: z.nativeEnum(Category),
      description: z.string(),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      zip_file_name: z.string(),
      slug: z.string(),
      tags: z.array(
        z.object({ id: z.string(), name: z.string(), slug: z.string() }),
      ),
      images: z.array(
        z.object({
          id: z.string(),
          productId: z.string(),
          url: z.string(),
          alt_text: z.string(),
        }),
      ),
    }),
  ),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

    if (!userId || !user) {
      // Return structured JSON error for unauthorized
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the primary email address
    const customerEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId,
    )?.emailAddress;

    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      console.error("Checkout validation failed:", validation.error.errors);

      // Return structured JSON error for validation failure
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    // Correctly extract only the items array
    const { items } = validation.data;

    if (!items || items.length === 0) {
      // Return structured JSON error for empty cart
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Ensure the items map uses the validated data structure
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => ({
        price_data: {
          currency: "cad",
          product_data: {
            images: [`${pullZone}/${item.images[0].url}`],
            name: item.name,
            description: item.category,
          },
          unit_amount: Math.round(item.price * 100), // Price in cents
        },
        quantity: 1, // Always 1 for digital products
      }));

    // Create metadata string - ensure it doesn't exceed Stripe's limit (500 chars total key/value)
    const metadataItems = items.map((item) => ({
      id: item.id,
      price: item.price,
    }));
    const metadataString = JSON.stringify(metadataItems);

    // Check metadata length
    if (metadataString.length > 450) {
      console.error("Metadata string too long for Stripe Checkout");

      // Return structured JSON error for internal issue
      return NextResponse.json(
        { error: "Checkout failed due to internal error (metadata)." },
        { status: 500 }, // Internal server error
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
      metadata: {
        userId: userId,
        // Store product IDs and prices at time of checkout for webhook processing
        cartItems: metadataString,
      },
      customer_email: customerEmail,
    });

    // Return success with the session URL
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT_POST] Error creating checkout session:", error);

    // Return structured JSON error for generic server errors
    return NextResponse.json(
      { error: "Could not create checkout session." },
      { status: 500 },
    );
  }
}
