import { Circle } from "lucide-react";
import React from "react";

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

export function getProductSpecificationsByCategory(
  category: string,
): React.ReactNode {
  const currentYear = new Date().getFullYear();

  const descriptions: Record<string, React.ReactNode> = {
    stickers: (
      <div className="space-y-4">
        <div>
          <BulletPoint /> Digital stickers set to use with your compatible
          applications such as GoodNotes, Notability®, Pages, Procreate®,
          Adobe® Photoshop, and so on. Great for creating cards or artworks,
          gifts or journaling, all the stickers are background-less for more
          flexibility.
        </div>

        <div>
          <BulletPoint /> Easily printable on normal size paper (letter, A4, and
          smaller) to preserve the quality.
        </div>

        <div>
          <BulletPoint /> Specs:
          <div className="pl-3.5 mt-1">
            <SpecItem>No background</SpecItem>
            <SpecItem>PNG format</SpecItem>
            <SpecItem>HD quality</SpecItem>
            <SpecItem>Entirely handmade</SpecItem>
            <SpecItem>Unique</SpecItem>
            <SpecItem>Direct download upon purchase</SpecItem>
          </div>
        </div>

        <div>
          <BulletPoint /> For any custom art demand, please reach out to us
          through our contact form, before purchase.
        </div>

        <div>
          <BulletPoint /> Check our FAQ page for more information on how to use
          our products, or feel free to contact us.
        </div>

        <div className="mt-6">
          Original design. You may not resell or reproduce.
          <div className="mt-1">
            &copy; 2021 - {currentYear} Nathalie Tran, aka Niniefy. All Rights
            Reserved.
          </div>
        </div>
      </div>
    ),
    brushes: (
      <div className="space-y-4">
        <div>
          <BulletPoint /> Digital brushes pack. Easily adjustable according to
          your needs. Perfect for your Procreate® arts, or Adobe® Photoshop
          projects. Great to let your creativity flow and express yourself.
        </div>

        <div>
          <BulletPoint /> Achieve your design goals and spare some time by using
          adequate tools.
        </div>

        <div>
          <BulletPoint /> Specs:
          <div className="pl-3.5 mt-1">
            <SpecItem>BRUSHSET format</SpecItem>
            <SpecItem>Procreate® and Adobe® Photoshop compatible</SpecItem>
            <SpecItem>Completely handmade</SpecItem>
            <SpecItem>Unique</SpecItem>
            <SpecItem>Direct download upon purchase</SpecItem>
          </div>
        </div>

        <div>
          <BulletPoint /> For any custom art demand, please reach out to us
          through our contact form, before purchase.
        </div>

        <div>
          <BulletPoint /> Check our FAQ page for more information on how to use
          our products, or feel free to contact us.
        </div>

        <div className="mt-6">
          Original design. You may not resell or reproduce.
          <div className="mt-1">
            &copy; 2021 - {currentYear} Nathalie Tran, aka Niniefy. All Rights
            Reserved.
          </div>
        </div>
      </div>
    ),
    templates: (
      <div className="space-y-4">
        <div>
          <BulletPoint /> Digital template to use with your compatible
          applications such as GoodNotes, Notability®, Pages, Procreate®, and
          so on. Great for creating cards or artworks, gifts or planning and
          journaling
        </div>

        <div>
          <BulletPoint /> Easily printable on normal size paper (letter, A4, and
          smaller) to preserve the quality.
        </div>

        <div>
          <BulletPoint /> Specs:
          <div className="pl-3.5 mt-1">
            <SpecItem>JPEG format</SpecItem>
            <SpecItem>Great quality</SpecItem>
            <SpecItem>Entirely handmade</SpecItem>
            <SpecItem>Unique</SpecItem>
            <SpecItem>Direct download upon purchase</SpecItem>
          </div>
        </div>

        <div>
          <BulletPoint /> For any custom art demand, please reach out to us
          through our contact form, before purchase.
        </div>

        <div>
          <BulletPoint /> Check our FAQ page for more information on how to use
          our products, or feel free to contact us.
        </div>

        <div className="mt-6">
          Original design. You may not resell or reproduce.
          <div className="mt-1">
            &copy; 2021 - {currentYear} Nathalie Tran, aka Niniefy. All Rights
            Reserved.
          </div>
        </div>
      </div>
    ),
    planners: (
      <div className="space-y-4">
        <div>
          <BulletPoint /> Digital planner to use all year long with your
          compatible applications such as GoodNotes, Notability®, and any PDF
          file reader. Made for journaling, you can write on every page to log
          in your thoughts, schedules, habits, notes, important stuff.
        </div>

        <div>
          <BulletPoint /> Please note that this is a PDF file, which means it
          cannot link automatically to your other planners or apps like Calendar
          or Reminders.
        </div>

        <div>
          <BulletPoint /> It is printable on normal size paper (letter, A4, and
          smaller) to preserve the quality, at your own expense, as a planner
          can vary between 100-370 pages.
        </div>

        <div>
          <BulletPoint /> Specs:
          <div className="pl-3.5 mt-1">
            <SpecItem>PDF format</SpecItem>
            <SpecItem>Great quality</SpecItem>
            <SpecItem>Entirely handmade</SpecItem>
            <SpecItem>Unique</SpecItem>
            <SpecItem>Direct download upon purchase</SpecItem>
          </div>
        </div>

        <div>
          <BulletPoint /> For any custom demand, please reach out to us through
          our contact form, before purchase.
        </div>

        <div>
          <BulletPoint /> Check our FAQ page for more information on how to use
          our products, or feel free to contact us.
        </div>

        <div className="mt-6">
          Original design. You may not resell or reproduce.
          <div className="mt-1">
            &copy; 2021 - {currentYear} Nathalie Tran, aka Niniefy. All Rights
            Reserved.
          </div>
        </div>
      </div>
    ),
  };

  // Convert category to lowercase to ensure case-insensitive matching
  const normalizedCategory = category?.toLowerCase() || "";

  return (
    descriptions[normalizedCategory] || (
      <p>Description not available for this category.</p>
    )
  );
}
