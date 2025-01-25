"use client";

import { useActionState, useContext, useState } from "react";
import { useFormStatus } from "react-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslations } from "next-intl";

import { NonceContext } from "@/src/app/providers";
import { Button } from "@/src/components/ui/button";
import { EmailIcon } from "@/src/components/icons";
import { ContactFormData } from "@/src/interfaces/Contact";
import { sendContactEmail } from "@/src/actions/resend/action";
import { SuccessDisplay } from "@/src/components/contact/SuccessDisplay";
import { ErrorDisplay } from "@/src/components/contact/ErrorDisplay";
import { FieldInput } from "@/src/components/contact/FieldInput";
import { TextInput } from "@/src/components/contact/TextInput";
import { HoneypotField } from "@/src/components/contact/HoneypotField";

const initialState = {
  success: false,
  error: undefined,
};

export default function ContactPage() {
  const nonce = useContext(NonceContext);
  const t = useTranslations("Contact");
  const [contactForm, setContactForm] = useState<ContactFormData>({
    firstName: "",
    lastName: "",
    subject: "",
    email: "",
    message: "",
    honeypot: "",
    recaptchaToken: "",
  });
  const { pending } = useFormStatus();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [state, formAction] = useActionState(sendContactEmail, initialState);

  // Update local form state
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  if (state?.success) {
    return (
      <div className="mt-4" nonce={nonce}>
        <SuccessDisplay t={t} />
      </div>
    );
  } else if (state?.error) {
    return (
      <div className="mt-4" nonce={nonce}>
        <ErrorDisplay t={t} />
      </div>
    );
  }

  return (
    <div nonce={nonce}>
      <h1 className="text-5xl font-bold mb-5">{t("title")}</h1>
      <EmailIcon size={65} />
      <form action={formAction} className="space-y-4" nonce={nonce}>
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full"
          nonce={nonce}
        >
          <FieldInput
            fieldTarget="firstName"
            t={t}
            type="text"
            value={contactForm.firstName}
            onChange={handleChange}
          />
          <FieldInput
            fieldTarget="lastName"
            t={t}
            type="text"
            value={contactForm.lastName}
            onChange={handleChange}
          />
        </div>

        <FieldInput
          fieldTarget="email"
          t={t}
          type="email"
          value={contactForm.email}
          onChange={handleChange}
        />

        <FieldInput
          fieldTarget="subject"
          t={t}
          type="text"
          value={contactForm.subject}
          onChange={handleChange}
        />

        <TextInput
          fieldTarget="message"
          t={t}
          value={contactForm.message}
          onChange={handleChange}
        />

        <HoneypotField
          t={t}
          value={contactForm.honeypot ?? ""}
          onChange={handleChange}
        />

        <input
          name="recaptchaToken"
          type="hidden"
          value={recaptchaToken ?? ""}
          onChange={handleChange}
        />

        <div
          className="flex justify-center py-4 mx-auto"
          id="recaptcha"
          nonce={nonce}
        >
          <ReCAPTCHA
            nonce={nonce}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
            onChange={setRecaptchaToken}
          />
        </div>

        <Button
          className="w-full bg-foreground text-background py-2 px-4 rounded-md hover:bg-warning-500 focus:outline-none"
          disabled={pending}
          nonce={nonce}
          type="submit"
          // disabled={pending || !recaptchaToken}
          variant="form"
        >
          {pending ? t("btn_pending") : t("btn")}
        </Button>
      </form>
    </div>
  );
}
