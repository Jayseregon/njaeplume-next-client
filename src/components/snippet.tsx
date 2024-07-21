import { ReactNode } from "react";

interface SnippetProps {
  children?: ReactNode;
}

export default function Snippet({ children }: SnippetProps) {
  return (
    <>
      <span className="inline-block bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-50 p-1 mx-1 font-mono text-sm border-1 border-gray-600 dark:border-gray-50 rounded-md">
        {children}
      </span>
    </>
  );
}
