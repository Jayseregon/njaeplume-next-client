import { useTranslations } from "next-intl";

import ProductList from "@/src/components/portfolio/ProductList";

export default function AboutPage() {
  const t = useTranslations("Portfolio");

  return (
    <div>
      <h1 className="text-5xl font-bold mb-10">{t("h1_title")}</h1>
      <div className="py-5" />
      <ProductList />
    </div>
  );
}
