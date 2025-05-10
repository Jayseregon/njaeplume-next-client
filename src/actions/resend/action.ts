"use server";
import { z } from "zod";
import { Resend } from "resend";

import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import { verifyRecaptcha } from "@/src/lib/actionHelpers";
import ContactFormTemplate from "@/src/emails/ContactFormTemplate";
import { Order } from "@/src/interfaces/StripeWebhook";
import PaymentConfirmationEmail from "@/emails/PaymentConfirmationTemplate";
import PaymentFailureEmail from "@/emails/PaymentFailureTemplate";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const contactDefaultFrom = process.env.CONTACT_DEFAULT_FROM;
const resend = new Resend(process.env.RESEND_API_KEY);

// Define available locales and message map
type Messages = typeof enMessages;
const messagesMap: Record<string, Messages> = {
  en: enMessages,
  fr: frMessages,
};

export async function sendPaymentConfirmationEmail(
  newOrder: Order,
  customerName: string,
  customerEmail: string,
  locale: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Select messages based on locale, fallback to 'en'
    const messages = messagesMap[locale] || messagesMap.en;
    // Extract only the PaymentConfirmation messages
    const paymentConfirmationMessages = messages.PaymentConfirmation;
    // Extract ProductCard messages for category translation
    const productCardMessages = messages.ProductCard;

    console.log("Selected locale:", locale);
    console.log("Selected messages:", messages);

    const schema = z.object({
      displayId: z.string(),
      amount: z.number(),
      createdAt: z.preprocess(
        (val) => (val instanceof Date ? val.toISOString() : val),
        z.string(),
      ),
      items: z.array(
        z.object({
          product: z.object({
            name: z.string(),
            category: z.string(),
            price: z.number(),
          }),
        }),
      ),
      customerName: z.string(),
      customerEmail: z.string().email("Invalid email address"),
      locale: z.string(),
    });

    const parsed = schema.safeParse({
      displayId: newOrder.displayId,
      amount: newOrder.amount,
      createdAt: newOrder.createdAt,
      items: newOrder.items,
      customerName,
      customerEmail,
      locale,
    });

    if (!parsed.success) {
      const errorMessage = parsed.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      throw new Error(`Validation error: ${errorMessage}`);
    }

    const data = parsed.data;

    // Generate a proper download link to the user's account/orders page
    const downloadLink = `${process.env.NEXT_PUBLIC_APP_URL}/account/downloads`;

    // Use translated subject from the filtered messages
    const subject = `${paymentConfirmationMessages.subject}: ${data.displayId}`;

    const { error } = await resend.emails.send({
      from: contactDefaultFrom!,
      to: customerEmail,
      subject: subject,
      text: subject,
      react: PaymentConfirmationEmail({
        ...data,
        downloadLink,
        messages: paymentConfirmationMessages,
        categoryMessages: productCardMessages.category,
      }),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return { success: false, error: errorMessage };
  }
}

export async function sendPaymentFailureEmail(
  customerName: string,
  customerEmail: string,
  locale: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Select messages based on locale, fallback to 'en'
    const messages = messagesMap[locale] || messagesMap.en;
    // Extract only the PaymentFailure messages
    const paymentFailureMessages = messages.PaymentFailure;

    const schema = z.object({
      customerName: z.string(),
      customerEmail: z.string().email("Invalid email address"),
      locale: z.string(),
    });

    const parsed = schema.safeParse({
      customerName,
      customerEmail,
      locale,
    });

    if (!parsed.success) {
      const errorMessage = parsed.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");

      throw new Error(`Validation error: ${errorMessage}`);
    }

    const data = parsed.data;

    // Use translated subject
    const subject = paymentFailureMessages.subject;

    const { error } = await resend.emails.send({
      from: contactDefaultFrom!,
      to: customerEmail,
      subject: subject,
      text: subject,
      react: PaymentFailureEmail({
        customerName: data.customerName,
        messages: paymentFailureMessages,
      }),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return { success: false, error: errorMessage };
  }
}

export async function sendContactEmail(
  prevState: { success: boolean; error?: string },
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const schema = z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      subject: z.string().min(1, "Subject is required"),
      email: z.string().email("Invalid email address"),
      message: z.string().min(1, "Message is required"),
      honeypot: z.string().optional().nullable(),
      recaptchaToken: z.string().min(1, "Recaptcha token is required"),
    });
    const parsed = schema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      subject: formData.get("subject"),
      email: formData.get("email"),
      message: formData.get("message"),
      honeypot: formData.get("honeypot"),
      recaptchaToken: formData.get("recaptchaToken"),
    });

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", "),
      };
    }

    const data = parsed.data;

    if (data.honeypot) {
      return { success: false, error: "Bot detected" };
    }

    const recaptchaValid = await verifyRecaptcha(
      data.recaptchaToken,
      RECAPTCHA_SECRET!,
    );

    if (!recaptchaValid) {
      return { success: false, error: "Invalid captcha" };
    }

    const { error } = await resend.emails.send({
      from: contactDefaultFrom!,
      to: process.env.CONTACT_DEFAULT_TO!,
      subject: data.subject,
      text: data.subject,
      react: ContactFormTemplate(data),
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return { success: false, error: errorMessage };
  }
}
