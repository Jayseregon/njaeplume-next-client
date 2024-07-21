import { ReactNode } from "react";

interface QuoteProps {
  children?: ReactNode;
}

export default function Quote({ children }: QuoteProps) {
  return (
    <>
      <span className="inline-block text-gray-600 dark:text-gray-50 italic font-mono text-sm">
        {children}
      </span>
    </>
  );
}
