import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server"; // Import currentUser
import { z } from "zod";
import Stripe from "stripe";
import { Category } from "@prisma/client";

import { stripe } from "@/lib/stripe"; // Correct: Import server-side client

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      category: z.nativeEnum(Category), // Assuming Category enum is imported or available
      description: z.string(),
      createdAt: z.string().datetime(), // Or z.date() if you parse it
      updatedAt: z.string().datetime(), // Or z.date()
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
    const user = await currentUser(); // Fetch current user details
    const pullZone = process.env.NEXT_PUBLIC_BUNNY_PUBLIC_ASSETS_PULL_ZONE_URL;

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the primary email address
    const customerEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId,
    )?.emailAddress;

    const body = await req.json();
    const validation = checkoutSchema.safeParse(body);

    if (!validation.success) {
      console.error("Checkout validation failed:", validation.error.errors);

      return new NextResponse("Invalid input", { status: 400 });
    }

    // Correctly extract only the items array
    const { items } = validation.data;

    if (!items || items.length === 0) {
      return new NextResponse("Cart is empty", { status: 400 });
    }

    // Ensure the items map uses the validated data structure
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => ({
        price_data: {
          currency: "cad",
          product_data: {
            images: [`${pullZone}/${item.images[0].url}`], // Ensure URL is absolute
            name: item.name,
            description: item.category,
          },
          unit_amount: Math.round(item.price * 100), // Price in cents
        },
        quantity: 1, // Assuming quantity is always 1 for digital items
      }));

    // Create metadata string - ensure it doesn't exceed Stripe's limit (500 chars total key/value)
    const metadataItems = items.map((item) => ({
      id: item.id,
      price: item.price,
    }));
    const metadataString = JSON.stringify(metadataItems);

    if (metadataString.length > 450) {
      // Leave some room for userId key
      console.error("Metadata string too long");

      return new NextResponse("Internal Server Error - Metadata too long", {
        status: 500,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/account/orders?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
      metadata: {
        userId: userId,
        // Store product IDs and prices at time of checkout for webhook processing
        cartItems: metadataString,
      },
      customer_email: customerEmail,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[CHECKOUT_POST]", error);

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
