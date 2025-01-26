import React from "react";

import { FieldInputProps } from "@/src/interfaces/Contact";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const FieldInput = ({
  fieldTarget,
  t,
  type,
  value,
  onChange,
}: FieldInputProps) => {
  return (
    <div>
      <Label
        className="block text-sm font-medium text-start text-foreground"
        htmlFor={fieldTarget}
      >
        {t(fieldTarget)}
      </Label>
      <Input
        required
        className="mt-1 block w-full bg-neutral-50 dark:bg-neutral-200 text-foreground dark:text-background border border-foreground rounded-md py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400"
        id={fieldTarget}
        name={fieldTarget}
        type={type}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
