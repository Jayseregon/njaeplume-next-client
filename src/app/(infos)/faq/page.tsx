"use client";

import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import ErrorBoundary from "@/src/components/root/ErrorBoundary";
import { ErrorDefaultDisplay } from "@/src/components/root/ErrorDefaultDisplay";
import { PageTitle } from "@/src/components/root/PageTitle";

export default function FAQPage() {
  const t = useTranslations("FAQ");

  // Define FAQ sections with their exact number of answers
  const faqStructure = [
    { id: "usage", answerCount: 4 },
    { id: "unique", answerCount: 3 },
    { id: "logos", answerCount: 1 },
    { id: "niniefy", answerCount: 1 },
    { id: "shipping", answerCount: 2 },
    { id: "returns", answerCount: 5 },
    { id: "custom", answerCount: 2 },
    { id: "fewProducts", answerCount: 2 },
    { id: "fanArt", answerCount: 4 },
    { id: "howToUse", answerCount: 5 },
  ];

  return (
    <ErrorBoundary fallback={<ErrorDefaultDisplay />}>
      <div className="container">
        <PageTitle title={t("title")} />

        <Accordion collapsible className="w-full" type="single">
          {faqStructure.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-foreground font-bold text-xl">
                {t(`questions.${section.id}.question`)}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-1 text-justify">
                {Array.from({ length: section.answerCount }, (_, i) => {
                  const index = i + 1;

                  return (
                    <p
                      key={`${section.id}-answer-${index}`}
                      className={i > 0 ? "mt-3" : ""}
                    >
                      {t(`questions.${section.id}.answer${index}`)}
                    </p>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ErrorBoundary>
  );
}
