import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";

interface FooterProps {
  nonce?: string;
}

export const Footer: React.FC<FooterProps> = ({ nonce }) => {
  const t = useTranslations("Footer");

  return (
    <footer
      className="w-full flex text-sm text-center antialiased items-center justify-center py-3 text-foreground/50 text-wrap"
      nonce={nonce || undefined}
    >
      <div>
        &copy; {new Date().getFullYear()} {t("copyright")}
        {t("google1")}
        <Link className="underline" href={t("gpp_href")}>
          {t("gpp")}
        </Link>{" "}
        {t("gtxt1")}
        <Link className="underline" href={t("gts_href")}>
          {t("gts")}
        </Link>{" "}
        {t("gtxt2")}
      </div>
    </footer>
  );
};
