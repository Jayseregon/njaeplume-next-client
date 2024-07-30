import { useTranslations } from "next-intl";
import { unstable_setRequestLocale } from "next-intl/server";

import { ProductList } from "@/src/components/portfolioProducts";

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const t = useTranslations("Portfolio");
  // const mdFiles = getListOfFiles("posts");
  // const nonce = headers().get("x-nonce");

  return (
    <div>
      <h1 className="text-5xl font-bold mb-10">{t("h1_title")}</h1>

      <div className="py-5" />

      {/* <div>
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
      </div> */}

      <ProductList locale={locale} />
    </div>
  );
}
