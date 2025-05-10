"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { PageTitle } from "@/src/components/root/PageTitle";
import { Policy } from "@/src/components/legals/Policy";

const policyKeys = {
  privacy: {
    apiKey: process.env.NEXT_PUBLIC_TERMAGEDDON_PRIVACY_POLICY || "",
    translationId: "privacy_policy",
  },
  cookies: {
    apiKey: process.env.NEXT_PUBLIC_TERMAGEDDON_COOKIE_POLICY || "",
    translationId: "cookies_policy",
  },
  terms: {
    apiKey: process.env.NEXT_PUBLIC_TERMAGEDDON_TERMS_OF_SERVICE || "",
    translationId: "terms_of_service",
  },
};

export default function PolicyPage() {
  const { policy } = useParams();
  const t = useTranslations("policies");

  const policyData = policyKeys[policy as keyof typeof policyKeys];

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <>
        <PageTitle title={t(`${policyData.translationId}`)} />

        <div className="py-5" />

        <Policy policyKey={policyData.apiKey} />

        <div className="py-3" />
      </>
    </ErrorBoundary>
  );
}
