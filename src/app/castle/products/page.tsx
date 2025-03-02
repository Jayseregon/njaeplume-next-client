"use client";

import { useContext } from "react";

import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { PageTitle } from "@/src/components/root/PageTitle";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { NonceContext } from "@/src/app/providers";

export default function ProductsPage() {
  const nonce = useContext(NonceContext);

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div nonce={nonce}>
        <PageTitle title="Products Page" />
      </div>
    </ErrorBoundary>
  );
}
