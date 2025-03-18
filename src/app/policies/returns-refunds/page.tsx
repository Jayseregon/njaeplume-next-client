"use client";

import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import Link from "next/link";

import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { PageTitle } from "@/src/components/root/PageTitle";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/src/components/ui/button";

export default function ReturnsPage() {
  const t = useTranslations("ReturnsRefunds");

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <PageTitle title={t("title")} />

      <div className="py-5" />

      <div className="returns-content">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            {/* Definitions and legal references section */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4 text-left">
                {t("definitions.title")}
              </h2>
              <dl className="space-y-4">
                <div>
                  <dt className="font-bold text-left mb-1">
                    {t("definitions.website")}
                  </dt>
                  <dd className="text-justify pl-0">
                    {t("definitions.websiteDesc")}
                  </dd>
                </div>

                <div>
                  <dt className="font-bold text-left mb-1">
                    {t("definitions.owner")}
                  </dt>
                  <dd className="text-justify pl-0">
                    {t("definitions.ownerDesc")}
                  </dd>
                </div>

                <div>
                  <dt className="font-bold text-left mb-1">
                    {t("definitions.product")}
                  </dt>
                  <dd className="text-justify pl-0">
                    {t("definitions.productDesc")}
                  </dd>
                </div>

                <div>
                  <dt className="font-bold text-left mb-1">
                    {t("definitions.user")}
                  </dt>
                  <dd className="text-justify pl-0">
                    {t("definitions.userDesc")}
                  </dd>
                </div>
              </dl>
            </div>

            <Separator className="my-10" />

            {/* Policy section */}
            <div className="mb-6 text-justify">
              <p className="mb-4">{t("policy.intro")}</p>
              <p className="mb-4">{t("policy.noRefunds")}</p>
              <p className="mb-4">{t("policy.clarification")}</p>
              <p className="mb-4">{t("policy.faultyFiles")}</p>
              <p className="mb-4">{t("policy.termsOfServiceLink")}</p>
              <p className="mb-4">{t("policy.governingLaw")}</p>
              <p className="mb-4">{t("policy.questions")}</p>
              <p className="mb-4">{t("policy.additionalQuestions")}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 mt-8">
              <Button
                asChild
                className="flex items-center gap-2 w-auto"
                variant="form"
              >
                <Link href="/contact">
                  <Mail className="w-4 h-4 mr-1" />
                  {t("policy.contactButton")}
                </Link>
              </Button>
            </div>

            <Separator className="my-10" />

            {/* Last updated */}
            <div className="pb-3 text-sm text-foreground">
              <p>{t("lastUpdated")}</p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
