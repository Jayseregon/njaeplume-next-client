import { useTranslations } from "next-intl";

import { title } from "@/components/typography";
import { PageTmpCard } from "@/src/components/PageTmpCard";
import { posts } from "#site/content";

export default function AppsPage() {
  const t = useTranslations("Contact");
  const post = posts.find((post) => post.title === "Hello world") ?? {
    code: "Post not found",
  };

  return (
    <div>
      <h1 className={title()}>{t("h1_title")}</h1>

      <div className="py-3" />

      <PageTmpCard subtitle={t("subtitle")} />

      <div className="py-5" />
    </div>
  );
}
