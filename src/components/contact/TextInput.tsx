import React from "react";

import { TextInputProps } from "@/src/interfaces/Contact";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const TextInput = ({
  fieldTarget,
  t,
  value,
  onChange,
}: TextInputProps) => {
  return (
    <div>
      <Label
        className="block text-sm font-medium text-start text-foreground"
        htmlFor={fieldTarget}
      >
        {t(fieldTarget)}
      </Label>
      <Textarea
        required
        className="mt-1 block w-full bg-neutral-50 dark:bg-neutral-200 text-foreground dark:text-background border border-foreground rounded-md py-2 px-3 focus:outline-none focus:ring-primary-400 focus:border-primary-400"
        id={fieldTarget}
        name={fieldTarget}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
