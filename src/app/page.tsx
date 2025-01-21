"use client";

import { Snippet, Button, ButtonGroup } from "@nextui-org/react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";

import { PortfolioIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/typography";
import NJAEPlumeMain from "@/public/site/njae_main_logo_title.png";
import NJAEHeadLeft from "@/public/site/landing_page_head_left.png";
import NJAEHeadRight from "@/public/site/landing_page_head_right.png";

import { NonceContext } from "./providers";

export default function RootPage() {
  const nonce = useContext(NonceContext);
  const t = useTranslations("HomePage");
  const portfolio = siteConfig.navItems.find(
    (item) => item.label === "Portfolio",
  );

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between items-center w-full">
        <Image
          alt="NJAE PLume homepage left image"
          className="relative -left-10 w-1/5 md:w-1/4"
          nonce={nonce || undefined}
          src={NJAEHeadLeft}
          width={200}
        />
        <Image
          alt="NJAE PLume homepage logo"
          className="w-3/5 md:w-2/4"
          nonce={nonce || undefined}
          src={NJAEPlumeMain}
          width={500}
        />
        <Image
          alt="NJAE PLume homepage right image"
          className="relative -right-6 w-1/5 md:w-1/4"
          nonce={nonce || undefined}
          src={NJAEHeadRight}
          width={200}
        />
      </div>

      <div className="flex flex-col items-center justify-center max-w-7xl gap-4">
        <div className="inline-block text-center justify-center">
          <h1 className={title({ color: "pink", size: "lg" })}>{t("title")}</h1>
          <div className="py-5">
            <Snippet
              hideCopyButton
              hideSymbol
              nonce={nonce || undefined}
              variant="flat"
            >
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

        <ButtonGroup className="gap-4" nonce={nonce || undefined}>
          <Link
            passHref
            href={portfolio?.href || "portfolio"}
            nonce={nonce || undefined}
          >
            <Button
              color="primary"
              nonce={nonce || undefined}
              radius="full"
              startContent={<PortfolioIcon />}
              variant="bordered"
            >
              {portfolio?.label || "Portfolio"}
            </Button>
          </Link>
        </ButtonGroup>

        <div className="py-5" />
      </div>
    </div>
  );
}
