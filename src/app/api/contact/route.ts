import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

import { EmailTemplate } from "@/src/components/email-templates";

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;
const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
  message: string;
  honeypot?: string;
  recaptchaToken: string;
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${RECAPTCHA_SECRET}&response=${token}`,
    },
  );
  const data = await response.json();

  return data.success;
}

export async function POST(request: NextRequest) {
  const {
    firstName,
    lastName,
    subject,
    email,
    message,
    honeypot,
    recaptchaToken,
  }: ContactFormData = await request.json();

  if (honeypot) {
    // If honeypot field is filled, treat as spam
    return NextResponse.json({ error: "Bot detected" }, { status: 400 });
  }

  if (!firstName || !lastName || !subject || !email || !message) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 },
    );
  }

  const recaptchaValid = await verifyRecaptcha(recaptchaToken);

  if (!recaptchaValid) {
    return NextResponse.json({ error: "Invalid captcha" }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.CONTACT_DEFAULT_FROM ?? "",
      to: process.env.CONTACT_DEFAULT_TO ?? "",
      subject: subject,
      text: subject,
      react: EmailTemplate({ firstName, lastName, subject, email, message }),
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
