"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { TriangleAlert, Undo2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const ErrorDefaultDisplay = () => {
  const t = useTranslations("Utils.ErrorDefaultDisplay");
  const router = useRouter();

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-4 space-y-4">
      <Alert className="max-w-md" variant="destructive">
        <TriangleAlert className="h-5 w-5" />
        <AlertTitle className="text-xl">{t("title")}</AlertTitle>
        <AlertDescription>{t("message")}</AlertDescription>
      </Alert>

      <Button
        className="mt-4"
        size="icon"
        variant="destructive"
        onClick={() => router.back()}
      >
        <Undo2 />
      </Button>
    </div>
  );
};
