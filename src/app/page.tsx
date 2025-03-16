"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useContext } from "react";
import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getHomeItemByKey } from "@/config/site";
import { title, subtitle } from "@/components/typography";
import { LoadingButton } from "@/components/root/LoadingButton";

import { NonceContext } from "./providers";

export default function RootPage() {
  const nonce = useContext(NonceContext);
  const t = useTranslations("HomePage");
  const shop = getHomeItemByKey("shop");

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-between items-center w-full">
        <Image
          alt="NJAE PLume homepage left image"
          className="relative -left-10 w-1/5 md:w-1/4"
          height={200}
          nonce={nonce || undefined}
          src="/site/landing_page_head_left.webp"
          width={200}
        />
        <Image
          alt="NJAE PLume homepage logo"
          className="w-3/5 md:w-2/4"
          height={500}
          nonce={nonce || undefined}
          src="/site/njae_main_logo_title.webp"
          width={500}
        />
        <Image
          alt="NJAE PLume homepage right image"
          className="relative -right-6 w-1/5 md:w-1/4"
          height={200}
          nonce={nonce || undefined}
          src="/site/landing_page_head_right.webp"
          width={200}
        />
      </div>

      <div className="flex flex-col items-center justify-center max-w-7xl gap-4">
        <div className="inline-block text-center justify-center">
          <h1 className={title({ color: "pink", size: "lg" })}>{t("title")}</h1>
          <div className={subtitle({ class: "mt-4" })}>
            {t("subtitle")}
            <br />
            {t("redirect")}
          </div>
        </div>

        <div className="py-1" />

        {shop && shop.href ? (
          <Button asChild className="w-auto" variant="form">
            <Link href={shop.href}>
              <Store /> {shop.label}
            </Link>
          </Button>
        ) : (
          <LoadingButton />
        )}

        <div className="py-5" />
      </div>
    </div>
  );
}
