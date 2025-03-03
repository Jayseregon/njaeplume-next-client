import React from "react";

import { SuccessDisplayProps } from "@/src/interfaces/Contact";
import { EmailSuccessIcon } from "@/src/components/icons";

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
