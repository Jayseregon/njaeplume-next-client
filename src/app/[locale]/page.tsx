import { Snippet } from "@nextui-org/snippet";
import { Button, ButtonGroup } from "@nextui-org/button";
import { unstable_setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { headers } from "next/headers";

import Image from "next/image";
import Link from "next/link";

import { PortfolioIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/typography";
import NJAEPlumeMain from "@/public/site/njae_main_logo_title.png";
import NJAEHeadLeft from "@/public/site/landing_page_head_left.png";
import NJAEHeadRight from "@/public/site/landing_page_head_right.png";

export default function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);
  const nonce = headers().get("x-nonce");
  const t = useTranslations("HomePage");
  const portfolio = siteConfig.navItems.find(
    (item) => item.label === "Portfolio"
  );
  const themes = siteConfig.navItems.find((item) => item.label === "Themes");

  return (
    <div className="flex flex-col items-center w-full">
      <div className="grid grid-cols-3 justify-between">
        <Image
          alt="NJAE PLume homepage logo"
          className="justify-self-start self-center w-full relative -left-6"
          src={NJAEHeadLeft}
          width={200}
          nonce={nonce || undefined}
        />
        <Image
          alt="NJAE PLume homepage logo"
          className="justify-self-center"
          src={NJAEPlumeMain}
          width={500}
          nonce={nonce || undefined}
        />
        <Image
          alt="NJAE PLume homepage logo"
          className="justify-self-end self-center w-full relative -right-6"
          src={NJAEHeadRight}
          width={200}
          nonce={nonce || undefined}
        />
      </div>

      <div className="flex flex-col items-center justify-center max-w-7xl gap-4">
        <div className="inline-block text-center justify-center">
          <h1 className={title({ color: "pink", size: "lg" })}>{t("title")}</h1>
          <div className="py-5">
            <Snippet
              hideCopyButton
              hideSymbol
              variant="flat"
              nonce={nonce || undefined}>
              <span>{t("code")}</span>
            </Snippet>
          </div>
          <div className={subtitle({ class: "mt-4" })}>
            {t("subtitle")}
            <br />
            {t("redirect")}
          </div>
        </div>

        <div className="py-1" />

        <ButtonGroup
          className="gap-4"
          nonce={nonce || undefined}>
          <Link
            passHref
            href={`/${locale}/${portfolio?.href}`}
            nonce={nonce || undefined}>
            <Button
              color="primary"
              radius="full"
              startContent={<PortfolioIcon />}
              variant="bordered"
              nonce={nonce || undefined}>
              {portfolio?.label}
            </Button>
          </Link>
          {/* <Link
            passHref
            href={`/${locale}/${themes?.href}`}
            nonce={nonce || undefined}>
            <Button
              className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
              radius="full"
              nonce={nonce || undefined}>
              {themes?.label}
            </Button>
          </Link> */}
        </ButtonGroup>

        <div className="py-5" />
      </div>
    </div>
  );
}
