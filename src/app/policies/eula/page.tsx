"use client";

import { useTranslations } from "next-intl";

import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { PageTitle } from "@/src/components/root/PageTitle";
import { Separator } from "@/components/ui/separator";

export default function EULAPage() {
  const t = useTranslations("LicenseAgreement");

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <PageTitle title={t("title")} />

      <div className="py-5" />

      <div className="shipping-content">
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

            {/* Policy section - updated for License Agreement */}
            <div className="mb-6 text-justify">
              <p className="mb-4">{t("policy.intro")}</p>
              <p className="mb-4">{t("policy.acceptance")}</p>
              <p className="mb-4">{t("policy.licenseGrant")}</p>
              <p className="mb-4">{t("policy.usageRestrictions")}</p>
              <p className="mb-4">{t("policy.personalUseClarification")}</p>
              <p className="mb-4">{t("policy.copyright")}</p>
              <p className="mb-4">{t("policy.termination")}</p>
              <p className="mb-4">{t("policy.warrantyDisclaimer")}</p>
              <p className="mb-4">{t("policy.limitationOfLiability")}</p>
              <p className="mb-4">{t("policy.indemnification")}</p>
              <p className="mb-4">{t("policy.governingLaw")}</p>
              <p className="mb-4">{t("policy.entireAgreement")}</p>
              <p className="mb-4">{t("policy.severability")}</p>
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
