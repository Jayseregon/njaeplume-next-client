import { Circle } from "lucide-react";
import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSubItemByKey } from "@/src/config/site";

// Bullet point component for consistent styling with protection against text justification
const BulletPoint: React.FC = () => {
  const t = useTranslations("ProductSpecs");

  return (
    <span className="text-foreground whitespace-nowrap inline-flex">
      {t("bulletSymbol")}
    </span>
  );
};

// Spec item component using Lucide icon
const SpecItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start">
    <Circle className="mt-1.5 mr-1.5 flex-shrink-0" size={6} />
    <span>{children}</span>
  </div>
);

// Shared components for reusable sections
const CustomDemandSection: React.FC = () => {
  const t = useTranslations("ProductSpecs");

  return (
    <div>
      {t.rich("customDemandText", {
        contactLink: (chunks) => (
          <Link
            className="text-foreground hover:text-primary"
            href={getSubItemByKey("contact").href}
          >
            {chunks}
          </Link>
        ),
      })}
    </div>
  );
};

const FAQSection: React.FC = () => {
  const t = useTranslations("ProductSpecs");

  return (
    <div>
      {t.rich("faqSectionText", {
        faqLink: (chunks) => (
          <Link
            className="text-foreground hover:text-primary"
            href={getSubItemByKey("faq").href}
          >
            {chunks}
          </Link>
        ),
        contactLink: (chunks) => (
          <Link
            className="text-foreground hover:text-primary"
            href={getSubItemByKey("contact").href}
          >
            {chunks}
          </Link>
        ),
      })}
    </div>
  );
};

const CopyrightSection: React.FC = () => {
  const t = useTranslations("ProductSpecs.copyright");
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex flex-col space-y-1">
      <span>{t("line1")}</span>
      <span>
        {t.rich("line2", {
          eulaLink: (chunks) => (
            <Link
              className="text-foreground hover:text-primary"
              href={getSubItemByKey("eula").href}
            >
              {chunks}
            </Link>
          ),
        })}
      </span>
      <span>{t("line3", { currentYear })}</span>
    </div>
  );
};

export const ProductSpecifications: React.FC<{ category: string }> = ({
  category,
}) => {
  const t = useTranslations("ProductSpecs");
  const normalizedCategory = category?.toLowerCase() || "";

  const validCategories = ["stickers", "brushes", "templates", "planners"];

  if (!validCategories.includes(normalizedCategory)) {
    return <p>{t("categoryNotAvailable")}</p>;
  }

  const categoryBaseKey = `categories.${normalizedCategory}`;

  const markupTags = {
    italic: (chunks: string) => `<i>${chunks}</i>`,
    bold: (chunks: string) => `<strong>${chunks}</strong>`,
    br: () => "<br />", // Changed from newline to br
  };

  // --- Description Content ---
  // Descriptions are plain text in JSON, so t.markup isn't strictly needed here
  // unless you plan to add custom tags to descriptions in the future.
  // For consistency with howtoUse, we can use t.markup, it will pass through plain text.
  let descriptionContentNode: React.ReactNode;

  if (normalizedCategory === "planners") {
    const desc1Key = `${categoryBaseKey}.description1`;
    const desc2Key = `${categoryBaseKey}.description2`;
    // Assuming descriptions are plain text or already valid HTML not needing custom tag processing
    const desc1Html = t(desc1Key);
    const desc2Html = t(desc2Key);

    if (desc1Html !== desc1Key && desc2Html !== desc2Key) {
      descriptionContentNode = (
        <>
          <div>
            <BulletPoint />{" "}
            <span dangerouslySetInnerHTML={{ __html: desc1Html }} />
          </div>
          <div>
            <BulletPoint />{" "}
            <span dangerouslySetInnerHTML={{ __html: desc2Html }} />
          </div>
        </>
      );
    } else {
      descriptionContentNode = <p>{t("categoryNotAvailable")}</p>; // Fallback
    }
  } else {
    const descKey = `${categoryBaseKey}.description`;
    const descHtml = t(descKey); // Assuming plain text or valid HTML

    if (descHtml !== descKey) {
      descriptionContentNode = (
        <div>
          <BulletPoint />{" "}
          <span dangerouslySetInnerHTML={{ __html: descHtml }} />
        </div>
      );
    } else {
      descriptionContentNode = <p>{t("categoryNotAvailable")}</p>; // Fallback
    }
  }

  // --- Spec Items Content ---
  const specItemsArray = t.raw(`${categoryBaseKey}.specItems`) as string[];
  const specItemsContentNodes = specItemsArray.map((item, idx) => (
    <SpecItem key={idx}>{item}</SpecItem>
  ));

  // --- How To Use Accordion Item ---
  let howToUseAccordionItemNode: React.ReactNode = null;
  const howToUseKeyGeneric = `${categoryBaseKey}.howtoUse`;
  const howToUseKeyPlannerPart1 = `${categoryBaseKey}.howtoUse_part1`;
  const howToUseKeyPlannerPart2 = `${categoryBaseKey}.howtoUse_part2`;

  let actualHowToUseContentNode: React.ReactNode = null;

  if (normalizedCategory === "planners") {
    const part1Markup = t.markup(howToUseKeyPlannerPart1, markupTags);
    const part2Text = t(howToUseKeyPlannerPart2); // This is plain text

    if (
      part1Markup !== howToUseKeyPlannerPart1 && // Check against original key
      part2Text !== howToUseKeyPlannerPart2
    ) {
      actualHowToUseContentNode = (
        <>
          <div>
            <BulletPoint />{" "}
            <span dangerouslySetInnerHTML={{ __html: part1Markup }} />
          </div>
          <br />
          <div>
            <BulletPoint /> {part2Text}
          </div>
        </>
      );
    }
  } else {
    const genericMarkup = t.markup(howToUseKeyGeneric, markupTags);

    if (genericMarkup !== howToUseKeyGeneric) {
      // Check against original key
      actualHowToUseContentNode = (
        <div>
          <BulletPoint />{" "}
          <span dangerouslySetInnerHTML={{ __html: genericMarkup }} />
        </div>
      );
    }
  }

  if (actualHowToUseContentNode) {
    howToUseAccordionItemNode = (
      <AccordionItem value="how-to-use">
        <AccordionTrigger className="text-foreground">
          {t("accordionTriggers.howToUse")}
        </AccordionTrigger>
        <AccordionContent>
          <div className="pl-3.5 mt-1 space-y-1">
            {actualHowToUseContentNode}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Accordion collapsible className="w-full" type="single">
      <AccordionItem value="specifications">
        <AccordionTrigger className="text-foreground">
          {t("accordionTriggers.specifications")}
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {descriptionContentNode}
          <div className="pl-3.5 mt-1 space-y-1">{specItemsContentNodes}</div>
        </AccordionContent>
      </AccordionItem>

      {howToUseAccordionItemNode}

      <AccordionItem value="custom-demands">
        <AccordionTrigger className="text-foreground">
          {t("accordionTriggers.customDemands")}
        </AccordionTrigger>
        <AccordionContent>
          <CustomDemandSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="faq">
        <AccordionTrigger className="text-foreground">
          {t("accordionTriggers.faq")}
        </AccordionTrigger>
        <AccordionContent>
          <FAQSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="copyrights">
        <AccordionTrigger className="text-foreground">
          {t("accordionTriggers.copyrights")}
        </AccordionTrigger>
        <AccordionContent>
          <CopyrightSection />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
