import { useTranslations } from "next-intl";

export interface FieldInputProps {
  fieldTarget: string;
  t: ReturnType<typeof useTranslations>;
  value?: string;
  type: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface HoneypotProps {
  t: ReturnType<typeof useTranslations>;
  value?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface TextInputProps {
  fieldTarget: string;
  t: ReturnType<typeof useTranslations>;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface ErrorDisplayProps {
  error?: string | null;
  t: ReturnType<typeof useTranslations>;
}

export interface SuccessDisplayProps {
  t: ReturnType<typeof useTranslations>;
}

export interface ContactFormTemplateProps {
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
  message: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
  message: string;
  honeypot?: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  subject: string;
  email: string;
  message: string;
  honeypot?: string | null;
  recaptchaToken: string;
}
