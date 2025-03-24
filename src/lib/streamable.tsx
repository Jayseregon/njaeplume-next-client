"use client";

import { Suspense, use } from "react";

// Type that can be either a value or a promise of that value
export type Streamable<T> = T | Promise<T>;

// Hook to use streamable values
export function useStreamable<T>(value: Streamable<T>): T {
  return value instanceof Promise ? use(value) : value;
}

// Component that wraps a streamable value in a Suspense boundary
export function Stream<T>({
  value,
  fallback,
  children,
}: {
  value: Streamable<T>;
  fallback: React.ReactNode;
  children: (value: T) => React.ReactNode;
}) {
  const StreamContent = () => {
    const resolvedValue = useStreamable(value);

    return <>{children(resolvedValue)}</>;
  };

  return (
    <Suspense fallback={fallback}>
      <StreamContent />
    </Suspense>
  );
}
