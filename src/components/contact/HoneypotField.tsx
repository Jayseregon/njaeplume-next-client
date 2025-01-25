import React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HoneypotProps } from "@/src/interfaces/Contact";

export const HoneypotField = ({ t, value, onChange }: HoneypotProps) => {
  return (
    <div className="hidden">
      <Label
        className="block text-sm font-medium text-start"
        htmlFor="honeypot"
      >
        {t("honeypot")}
      </Label>
      <Input
        className="mt-1 block w-full bg-white text-black border border-foreground rounded-md py-2 px-3 
                   focus:outline-none focus:ring-primary-400 focus:border-primary-400"
        id="honeypot"
        name="honeypot"
        type="text"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};
