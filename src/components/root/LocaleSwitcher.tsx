"use client";
import { useLocale } from "next-intl";
import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";
import { useState, useEffect, JSX } from "react";

import { setUserLocale } from "@/lib/locale";
import { LocaleSwitcherProps } from "@/src/interfaces/UI";

export default function LocaleSwitcher({
  className,
  nonce,
}: LocaleSwitcherProps): JSX.Element {
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "fr" : "en";

    localStorage.setItem("preferredLocale", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    setUserLocale(newLocale as "en" | "fr");
  };

  if (!mounted) {
    return <> </>;
  }

  return (
    <Button
      aria-label="Toggle language"
      className={className}
      color={undefined}
      isIconOnly={true}
      nonce={nonce}
      size="sm"
      variant={undefined}
      onPress={toggleLocale}
    >
      <motion.div
        key={locale}
        animate={{ rotate: 360 }}
        className="font-semibold"
        initial={{ rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        {locale.toUpperCase()}
      </motion.div>
    </Button>
  );
}
