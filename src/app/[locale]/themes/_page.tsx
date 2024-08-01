import { useTranslations } from "next-intl";

import { ColorCard, ColorCardScale } from "@/components/ColorCard";
import { PageTmpCard } from "@/src/components/PageTmpCard";

export default function ThemesPage() {
  const t = useTranslations("Themes");

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <h1 className="text-5xl font-bold mb-10">{t("h1_title")}</h1>

      <div className="py-3" />

      <PageTmpCard subtitle={t("subtitle")} />

      <div className="py-5" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <ColorCard />
        <ColorCardScale target_color="primary" />
        <ColorCardScale target_color="secondary" />
        <ColorCardScale target_color="success" />
        <ColorCardScale target_color="warning" />
        <ColorCardScale target_color="danger" />
      </div>
    </section>
  );
}
