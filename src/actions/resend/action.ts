"use server";
import { z } from "zod";
import { Resend } from "resend";

import { verifyRecaptcha } from "@/src/lib/actionHelpers";
import ContactFormEmailTemplate from "@/src/components/contact/ContactFormEmailTemplate";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (!process.env.CONTACT_DEFAULT_FROM || !process.env.CONTACT_DEFAULT_TO) {
      throw new Error("Missing email configuration");
    }

    const { error } = await resend.emails.send({
      from: process.env.CONTACT_DEFAULT_FROM,
      to: process.env.CONTACT_DEFAULT_TO,
      subject: data.subject,
      text: data.subject,
      react: ContactFormEmailTemplate(data),
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
