"use client";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { useState, useEffect, JSX } from "react";

import { Button } from "@/components/ui/button";
import { setUserLocale } from "@/lib/locale";

export default function LocaleSwitcher({
  nonce,
}: {
  nonce?: string;
}): JSX.Element {
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
      nonce={nonce}
      size="icon"
      variant={"ghost"}
      onClick={toggleLocale}
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
