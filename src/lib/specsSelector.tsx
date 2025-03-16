import { Circle } from "lucide-react";
import React from "react";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Bullet point component for consistent styling with protection against text justification
const BulletPoint: React.FC = () => (
  <span className="text-foreground whitespace-nowrap inline-flex">•●◍●•</span>
);

// Spec item component using Lucide icon
const SpecItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-start">
    <Circle className="mt-1.5 mr-1.5 flex-shrink-0" size={6} />
    <span>{children}</span>
  </div>
);

// Shared components for reusable sections
const CustomDemandSection: React.FC = () => (
  <div>
    For any custom art demand, please reach out to us through our{" "}
    <Link className="text-foreground hover:text-primary" href="/contact">
      contact form
    </Link>
    , before purchase.
  </div>
);

const FAQSection: React.FC = () => (
  <div>
    Check our{" "}
    <Link className="text-foreground hover:text-primary" href="/faq">
      FAQ page
    </Link>{" "}
    for more information on how to use our products, or feel free to{" "}
    <Link className="text-foreground hover:text-primary" href="/contact">
      contact us
    </Link>
    .
  </div>
);

const CopyrightSection: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      Original design. You may not resell or reproduce.
      <div className="mt-1">
        &copy; 2021 - {currentYear} Nathalie Tran, aka Niniefy. All Rights
        Reserved.
      </div>
    </div>
  );
};

export function getProductSpecificationsByCategory(
  category: string,
): React.ReactNode {
  // Convert category to lowercase to ensure case-insensitive matching
  const normalizedCategory = category?.toLowerCase() || "";

  // Define specifications content by category
  const categorySpecs: Record<
    string,
    {
      description: React.ReactNode;
      specItems: React.ReactNode[];
    }
  > = {
    stickers: {
      description: (
        <>
          <div>
            <BulletPoint /> Digital stickers set to use with your compatible
            applications such as GoodNotes, Notability®, Pages, Procreate®,
            Adobe® Photoshop, and so on. Great for creating cards or artworks,
            gifts or journaling, all the stickers are background-less for more
            flexibility.
          </div>

          <div>
            <BulletPoint /> Easily printable on normal size paper (letter, A4,
            and smaller) to preserve the quality.
          </div>
        </>
      ),
      specItems: [
        <SpecItem key="1">No background</SpecItem>,
        <SpecItem key="2">PNG format</SpecItem>,
        <SpecItem key="3">HD quality</SpecItem>,
        <SpecItem key="4">Entirely handmade</SpecItem>,
        <SpecItem key="5">Unique</SpecItem>,
        <SpecItem key="6">Direct download upon purchase</SpecItem>,
      ],
    },
    brushes: {
      description: (
        <>
          <div>
            <BulletPoint /> Digital brushes pack. Easily adjustable according to
            your needs. Perfect for your Procreate® arts, or Adobe® Photoshop
            projects. Great to let your creativity flow and express yourself.
          </div>

          <div>
            <BulletPoint /> Achieve your design goals and spare some time by
            using adequate tools.
          </div>
        </>
      ),
      specItems: [
        <SpecItem key="1">BRUSHSET format</SpecItem>,
        <SpecItem key="2">
          Procreate® and Adobe® Photoshop compatible
        </SpecItem>,
        <SpecItem key="3">Completely handmade</SpecItem>,
        <SpecItem key="4">Unique</SpecItem>,
        <SpecItem key="5">Direct download upon purchase</SpecItem>,
      ],
    },
    templates: {
      description: (
        <>
          <div>
            <BulletPoint /> Digital template to use with your compatible
            applications such as GoodNotes, Notability®, Pages, Procreate®,
            and so on. Great for creating cards or artworks, gifts or planning
            and journaling
          </div>

          <div>
            <BulletPoint /> Easily printable on normal size paper (letter, A4,
            and smaller) to preserve the quality.
          </div>
        </>
      ),
      specItems: [
        <SpecItem key="1">JPEG format</SpecItem>,
        <SpecItem key="2">Great quality</SpecItem>,
        <SpecItem key="3">Entirely handmade</SpecItem>,
        <SpecItem key="4">Unique</SpecItem>,
        <SpecItem key="5">Direct download upon purchase</SpecItem>,
      ],
    },
    planners: {
      description: (
        <>
          <div>
            <BulletPoint /> Digital planner to use all year long with your
            compatible applications such as GoodNotes, Notability®, and any PDF
            file reader. Made for journaling, you can write on every page to log
            in your thoughts, schedules, habits, notes, important stuff.
          </div>

          <div>
            <BulletPoint /> Please note that this is a PDF file, which means it
            cannot link automatically to your other planners or apps like
            Calendar or Reminders.
          </div>

          <div>
            <BulletPoint /> It is printable on normal size paper (letter, A4,
            and smaller) to preserve the quality, at your own expense, as a
            planner can vary between 100-370 pages.
          </div>
        </>
      ),
      specItems: [
        <SpecItem key="1">PDF format</SpecItem>,
        <SpecItem key="2">Great quality</SpecItem>,
        <SpecItem key="3">Entirely handmade</SpecItem>,
        <SpecItem key="4">Unique</SpecItem>,
        <SpecItem key="5">Direct download upon purchase</SpecItem>,
      ],
    },
  };

  // Get specs for selected category or return default message
  const selectedCategory = categorySpecs[normalizedCategory];

  if (!selectedCategory) {
    return <p>Description not available for this category.</p>;
  }

  // Return accordion with organized sections
  return (
    <Accordion collapsible className="w-full" type="single">
      <AccordionItem value="specifications">
        <AccordionTrigger className="text-foreground">
          Specifications
        </AccordionTrigger>
        <AccordionContent className="space-y-4">
          {selectedCategory.description}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="how-to-use">
        <AccordionTrigger className="text-foreground">
          How to Use
        </AccordionTrigger>
        <AccordionContent>
          <div className="pl-3.5 mt-1 space-y-1">
            {selectedCategory.specItems}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="custom-demands">
        <AccordionTrigger className="text-foreground">
          Custom Demands
        </AccordionTrigger>
        <AccordionContent>
          <CustomDemandSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="faq">
        <AccordionTrigger className="text-foreground">FAQ</AccordionTrigger>
        <AccordionContent>
          <FAQSection />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="copyrights">
        <AccordionTrigger className="text-foreground">
          Copyrights
        </AccordionTrigger>
        <AccordionContent>
          <CopyrightSection />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
