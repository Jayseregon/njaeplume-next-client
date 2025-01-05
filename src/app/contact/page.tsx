"use client";

import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslations } from "next-intl";

import { EmailIcon } from "@/src/components/icons";
import {
  FieldInput,
  TextInput,
  HoneypotField,
  ErrorDisplay,
  SuccessDisplay,
} from "@/src/components/contact/contactFormElements";

interface FormData {
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
  message: string;
  honeypot?: string;
}

const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  subject: "",
  email: "",
  message: "",
  honeypot: "",
};

export default function ContactPage() {
  const t = useTranslations("Contact");
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{
    error?: string;
    success?: boolean;
  } | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, recaptchaToken }),
      });

      if (!res.ok) {
        throw new Error(`Failed with status ${res.status}`);
      }

      const result = await res.json();

      setResponse(result);
    } catch (error) {
      if (error instanceof Error) {
        setResponse({ error: error.message });
      } else {
        setResponse({ error: "An unknown error occurred" });
      }
    } finally {
      setLoading(false);
      setFormData(initialFormData);
    }
  };

  if (response) {
    return (
      <div className="mt-4">
        {response.error ? <ErrorDisplay t={t} /> : <SuccessDisplay t={t} />}
      </div>
    );
  } else {
    return (
      <div className="max-w-fit mx-auto p-4">
        <h1 className="text-5xl font-bold mb-5">{t("title")}</h1>
        <EmailIcon size={65} />

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldInput
              fieldTarget="firstName"
              t={t}
              type="text"
              value={formData.firstName}
              onChange={handleChange}
            />
            <FieldInput
              fieldTarget="lastName"
              t={t}
              type="text"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <FieldInput
            fieldTarget="email"
            t={t}
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <FieldInput
            fieldTarget="subject"
            t={t}
            type="text"
            value={formData.subject}
            onChange={handleChange}
          />

          <TextInput
            fieldTarget="message"
            t={t}
            value={formData.message}
            onChange={handleChange}
          />

          <HoneypotField
            t={t}
            value={formData.honeypot}
            onChange={handleChange}
          />

          <div className="flex justify-center py-4">
            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
              onChange={setRecaptchaToken}
            />
          </div>

          <button
            className="w-full bg-foreground text-background py-2 px-4 rounded-md hover:bg-warning-500 focus:outline-none"
            disabled={loading || !recaptchaToken}
            type="submit"
          >
            {loading ? t("btn_pending") : t("btn")}
          </button>
        </form>
      </div>
    );
  }
}
