import { use } from "react";
import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";

import { ProductList } from "@/src/components/portfolioProducts";

export default function AboutPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = use(props.params);

  const { locale } = params;

  unstable_setRequestLocale(locale);
  const t = useTranslations("Portfolio");

  return (
    <div>
      <h1 className="text-5xl font-bold mb-10">{t("h1_title")}</h1>
      <div className="py-5" />
      <ProductList locale={locale} />
    </div>
  );
}
