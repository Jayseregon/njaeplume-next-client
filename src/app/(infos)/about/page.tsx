"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Mail } from "lucide-react";

import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { PageTitle } from "@/src/components/root/PageTitle";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <PageTitle title={t("title")} />

      <div className="py-5" />

      <div className="about-content">
        <div className="row">
          <div className="col-lg-8 offset-lg-2">
            <div className="mb-6 text-justify">
              <p className="mb-4">{t("intro")}</p>
              <p className="mb-4">{t("artist")}</p>
            </div>

            <div className="mb-6">
              <p className="text-justify">{t("background")}</p>
            </div>

            <div className="mb-6">
              <p className="text-justify">{t("customization")}</p>
            </div>

            <div className="mb-6">
              <p className="text-justify">{t("digital")}</p>
            </div>

            <div className="mb-8">
              <p className="text-justify mb-2">{t("conclusion")}</p>
              <p className="mt-4 text-right italic">{t("signature")}</p>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-2xl font-semibold text-center pt-5">
                {t("cta")}
              </h2>
              <Button
                asChild
                className="flex items-center gap-2 w-1/4"
                variant="form"
              >
                <Link href="/contact">
                  <Mail className="w-4 h-4 mr-1" />
                  {t("contactButton")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
