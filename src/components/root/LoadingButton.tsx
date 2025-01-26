import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export const LoadingButton = () => {
  const t = useTranslations();

  return (
    <Button disabled>
      <Loader2 className="animate-spin" data-testid="loader2-icon" />
      {t("Utils.LoadingButton")}
    </Button>
  );
};
