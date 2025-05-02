import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SimpleSpinnerProps {
  className?: string;
}

export const SimpleSpinner = ({ className }: SimpleSpinnerProps) => {
  return <Loader2 className={cn("animate-spin", className)} />;
};
