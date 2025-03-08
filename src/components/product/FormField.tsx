import React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SelectOption {
  label: string;
  value: string;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  type?: "text" | "number" | "hidden" | "email" | "password";
};

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  rows?: number;
};

type SelectProps = {
  options: SelectOption[];
  onValueChange?: (value: string) => void;
  placeholder?: string;
  value?: string;
};

type CommonProps = {
  label: string;
  id: string;
  name: string;
  className?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
};

type FormFieldProps = CommonProps &
  (
    | {
        inputType: "text" | "number" | "hidden" | "email" | "password";
        inputProps?: InputProps;
      }
    | { inputType: "textarea"; inputProps?: TextAreaProps }
    | { inputType: "select"; inputProps?: SelectProps }
  );

export function FormField({
  label,
  id,
  name,
  className = "",
  inputType,
  error,
  required = false,
  containerClassName = "flex flex-col gap-2",
  inputProps = {},
}: FormFieldProps) {
  return (
    <div className={containerClassName}>
      {inputType !== "hidden" && (
        <Label className="text-foreground" htmlFor={id}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}

      {(inputType === "text" ||
        inputType === "number" ||
        inputType === "hidden" ||
        inputType === "email" ||
        inputType === "password") && (
        <Input
          className={className}
          id={id}
          name={name}
          required={required}
          type={inputType}
          {...(inputProps as InputProps)}
        />
      )}

      {inputType === "textarea" && (
        <Textarea
          className={className}
          id={id}
          name={name}
          required={required}
          {...(inputProps as TextAreaProps)}
        />
      )}

      {inputType === "select" && (
        <Select
          required={required}
          value={(inputProps as SelectProps).value}
          onValueChange={(inputProps as SelectProps).onValueChange}
        >
          <SelectTrigger className={className} id={id}>
            <SelectValue
              placeholder={
                (inputProps as SelectProps).placeholder || `Select ${label}`
              }
            />
          </SelectTrigger>
          <SelectContent>
            {(inputProps as SelectProps).options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
