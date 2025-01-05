import React from "react";

import {
  ErrorDisplayProps,
  FieldInputProps,
  HoneypotProps,
  SuccessDisplayProps,
  TextInputProps,
} from "@/src/interfaces/Contact";

import { EmailErrorIcon, EmailSuccessIcon } from "../icons";

export const FieldInput = ({
  fieldTarget,
  t,
  type,
  value,
  onChange,
}: FieldInputProps) => {
  return (
    <div>
      <label
        className="block text-sm font-medium text-start"
        htmlFor={fieldTarget}
      >
        {t(fieldTarget)}
      </label>
      <input
        required
        className="mt-1 block w-full bg-white text-black border border-foreground rounded-md py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400"
        id={fieldTarget}
        name={fieldTarget}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export const TextInput = ({
  fieldTarget,
  t,
  value,
  onChange,
}: TextInputProps) => {
  return (
    <div>
      <label
        className="block text-sm font-medium text-start"
        htmlFor={fieldTarget}
      >
        {t(fieldTarget)}
      </label>
      <textarea
        required
        className="mt-1 block w-full bg-white text-black border border-foreground rounded-md py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400"
        id={fieldTarget}
        name={fieldTarget}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export const HoneypotField = ({ t, value, onChange }: HoneypotProps) => {
  return (
    <div className="hidden">
      <label
        className="block text-sm font-medium text-start"
        htmlFor="honeypot"
      >
        {t("honeypot")}
      </label>
      <input
        className="mt-1 block w-full bg-white text-black border border-foreground rounded-md py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400"
        id="honeypot"
        name="honeypot"
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ t }) => {
  return (
    <div className="max-w-fit mx-auto p-4">
      <h1 className="text-5xl font-bold mb-5">{t("title")}</h1>
      <EmailErrorIcon size={65} />
      <div
        className="p-4 mb-4 grid grid-cols-1 gap-4 text-danger-700 bg-danger-100 rounded-lg dark:bg-danger-200 dark:text-danger-800"
        role="alert"
      >
        <p className="font-medium grid grid-cols-1 gap-1">
          <span className="text-2xl">{t("error1")}</span>
          <span>{t("error2")}</span>
          <span>{t("error3")}</span>
        </p>
      </div>
    </div>
  );
};

export const SuccessDisplay: React.FC<SuccessDisplayProps> = ({ t }) => {
  return (
    <div className="max-w-fit mx-auto p-4">
      <h1 className="text-5xl font-bold mb-5">{t("title")}</h1>
      <EmailSuccessIcon size={65} />
      <div
        className="p-4 mb-4 grid grid-cols-1 gap-4 text-success-700 bg-success-100 rounded-lg dark:bg-success-200 dark:text-success-800"
        role="alert"
      >
        <p className="font-medium">{t("success")}</p>
      </div>
    </div>
  );
};
