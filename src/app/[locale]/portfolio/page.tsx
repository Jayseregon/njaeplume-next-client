import { useTranslations } from "next-intl";
import { headers } from "next/headers";
import { Link } from "@nextui-org/link";
import { unstable_setRequestLocale } from "next-intl/server";

import { PageTmpCard } from "@/src/components/PageTmpCard";
import { getListOfFiles } from "@/src/lib/mdReader";

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations("Portfolio");
  const mdFiles = getListOfFiles("posts");
  const nonce = headers().get("x-nonce");

  return (
    <div>
      <h1 className="text-5xl font-bold mb-10">{t("h1_title")}</h1>

      <div className="py-3" />

      <PageTmpCard subtitle={t("subtitle")} />

      <div className="py-20" />

      <div>
        {mdFiles.map((file, index) => (
          <ul key={index}>
            <li key={`${index}-${file}`}>
              <Link
                href={`/portfolio/${file.replace(".mdx", "")}`}
                nonce={nonce || undefined}
              >
                {file}
              </Link>
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
}
