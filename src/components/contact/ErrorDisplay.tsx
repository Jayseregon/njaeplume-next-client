import React from "react";

import { ErrorDisplayProps } from "@/src/interfaces/Contact";
import { EmailErrorIcon } from "@/src/components/icons";

export const ErrorDisplay = ({ t }: ErrorDisplayProps) => {
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
