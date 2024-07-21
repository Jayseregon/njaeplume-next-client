import { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface CalloutProps {
  children?: ReactNode;
  type?: "default" | "warning" | "danger";
}

export default function Callout({
  children,
  type = "default",
  ...props
}: CalloutProps) {
  return (
    <div
      className={cn("my-3 px-4 mx-auto rounded-md border-2 border-l-8 w-full", {
        "border-red-900 bg-red-50 prose text-red-900": type === "danger",
        "border-yellow-900 bg-yellow-50 prose text-yellow-900":
          type === "warning",
      })}
      {...props}
    >
      <div>{children}</div>
    </div>
  );
}
