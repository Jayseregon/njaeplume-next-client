"use client";

import React, { JSX } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { MapPin, PencilLine } from "lucide-react";

import { getSubItemByKey } from "@/src/config/site";

export default function Footer({ nonce }: { nonce?: string }): JSX.Element {
  const t = useTranslations("Footer");

  return (
    <footer
      className="w-full bg-stone-50 dark:bg-stone-900 text-stone-700 dark:text-stone-300 mt-auto border-t border-stone-200 dark:border-stone-800"
      nonce={nonce || undefined}
    >
      <div className="container mx-auto px-4 py-8 md:py-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Company info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">{t("about")}</h3>
            <div className="space-y-2 text-sm">
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href={getSubItemByKey("about").href}
              >
                {t("ourStory")}
              </Link>
            </div>

            <p className="text-sm">
              &copy; {new Date().getFullYear()} {t("copyright1")} -{" "}
              {t("copyright2")}
            </p>
            <div className="flex items-center space-x-2 text-sm py-2 px-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-md border border-amber-100 dark:border-amber-800">
              <PencilLine />
              <span>{t("humanMadeProducts")}</span>
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">{t("policies")}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href="/policies/privacy"
              >
                {t("privacy")}
              </Link>
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href={getSubItemByKey("returns-refunds").href}
              >
                {t("returns")}
              </Link>
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href="/policies/terms"
              >
                {t("terms")}
              </Link>
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href={getSubItemByKey("shipping").href}
              >
                {t("shipping")}
              </Link>
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href="/policies/cookies"
              >
                {t("cookies")}
              </Link>
              <Link
                className="hover:underline hover:text-primary transition-colors"
                href="/policies/disclaimers"
              >
                {t("disclaimer")}
              </Link>
            </div>
          </div>

          {/* Help & Fun digital element */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base">{t("help")}</h3>
            <div className="space-y-2 text-sm">
              <Link
                className="hover:underline hover:text-primary transition-colors block"
                href={getSubItemByKey("faq").href}
              >
                {t("faq")}
              </Link>
              <Link
                className="hover:underline hover:text-primary transition-colors block"
                href={getSubItemByKey("contact").href}
              >
                {t("contact")}
              </Link>
            </div>

            {/* Fun digital element */}
            <div className="p-3 mt-4 bg-stone-100 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <div className="text-xs font-mono flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                <span>
                  {t("digital")}:{" "}
                  <span className="text-green-500 dark:text-green-400">
                    {t("online")}
                  </span>
                </span>
              </div>
              <div className="text-xs font-mono mt-2 flex items-center">
                <MapPin
                  className="mr-2 text-foreground"
                  size={10}
                  strokeWidth={1.5}
                />
                <span>
                  {t("location")}:{" "}
                  <span className="text-foreground">
                    {t("locationAddress")}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Google reCAPTCHA policies */}
        <div className="text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-stone-800 pt-4 mt-4">
          <p>
            {t("google1")}
            <Link
              className="underline hover:text-primary"
              href="https://policies.google.com/privacy"
            >
              {t("gpp")}
            </Link>
            {t("gtxt1")}
            <Link
              className="underline hover:text-primary"
              href="https://policies.google.com/terms"
            >
              {t("gts")}
            </Link>
            {t("gtxt2")}
          </p>
        </div>
      </div>
    </footer>
  );
}
