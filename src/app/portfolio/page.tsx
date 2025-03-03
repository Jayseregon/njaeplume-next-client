import { useTranslations } from "next-intl";

import ProductList from "@/src/components/portfolio/ProductList";
import { PageTitle } from "@/src/components/root/PageTitle";

export default function AboutPage() {
  const t = useTranslations("Portfolio");

  return (
    <div>
      <PageTitle title={t("h1_title")} />
      <div className="py-5" />
      <ProductList />
    </div>
  );
}
