import React from "react";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { getProductSpecificationsByCategory } from "@/lib/specsSelector";
import * as siteConfig from "@/config/site";

// Mock the site configuration functions
jest.mock("@/config/site", () => ({
  getSubItemByKey: jest.fn((key) => {
    const mockLinks = {
      contact: { href: "/contact", label: "Contact", key: "contact" },
      faq: { href: "/faq", label: "FAQ", key: "faq" },
      eula: { href: "/policies/eula", label: "EULA", key: "eula" },
    };

    return (
      mockLinks[key as keyof typeof mockLinks] || {
        href: "/",
        label: "Not Found",
        key: "",
      }
    );
  }),
}));

describe("getProductSpecificationsByCategory", () => {
  // Improved helper function to render and expand accordion panels
  const renderCategoryAndOpenAccordion = async (
    category: string,
    accordionItem: string,
  ) => {
    const { container } = render(
      React.createElement(
        "div",
        null,
        getProductSpecificationsByCategory(category),
      ),
    );

    // First find the specific accordion we want to open
    const accordionTrigger = screen.getByRole("button", {
      name: accordionItem,
    });

    // Use userEvent for more realistic interaction
    await userEvent.click(accordionTrigger);

    // Wait for the accordion content to be visible
    await waitFor(() => {
      const accordionContent =
        accordionTrigger.parentElement?.nextElementSibling;

      expect(accordionContent).not.toHaveAttribute("hidden");
    });

    return { container };
  };

  // Simple render without expanding accordions
  const renderCategory = (category: string) => {
    return render(
      React.createElement(
        "div",
        null,
        getProductSpecificationsByCategory(category),
      ),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns a default message for unknown categories", () => {
    renderCategory("unknown");
    expect(
      screen.getByText("Description not available for this category."),
    ).toBeInTheDocument();
  });

  test("handles empty category", () => {
    renderCategory("");
    expect(
      screen.getByText("Description not available for this category."),
    ).toBeInTheDocument();
  });

  test("handles undefined category", () => {
    renderCategory(undefined as unknown as string);
    expect(
      screen.getByText("Description not available for this category."),
    ).toBeInTheDocument();
  });

  describe("Stickers category", () => {
    test("renders accordion with correct section titles", () => {
      renderCategory("stickers");
      expect(screen.getByText("Specifications")).toBeInTheDocument();
      expect(screen.getByText("How to Use")).toBeInTheDocument();
      expect(screen.getByText("Custom Demands")).toBeInTheDocument();
      expect(screen.getByText("FAQ")).toBeInTheDocument();
      expect(screen.getByText("Copyrights")).toBeInTheDocument();
    });

    test("contains sticker-specific content in Specifications section", async () => {
      await renderCategoryAndOpenAccordion("stickers", "Specifications");

      // Look for content inside the Specifications accordion
      expect(
        screen.getByText(
          (content) =>
            content.includes("Digital stickers set to use") ||
            content.includes("applications such as GoodNotes"),
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText((content) =>
          content.includes("Easily printable on normal size paper"),
        ),
      ).toBeInTheDocument();
    });

    test("contains sticker spec items in How to Use section", async () => {
      await renderCategoryAndOpenAccordion("stickers", "How to Use");

      // Check for spec items
      expect(screen.getByText("No background")).toBeInTheDocument();
      expect(screen.getByText("PNG format")).toBeInTheDocument();
      expect(screen.getByText("HD quality")).toBeInTheDocument();
      expect(screen.getByText("Entirely handmade")).toBeInTheDocument();
      expect(screen.getByText("Unique")).toBeInTheDocument();
      expect(
        screen.getByText("Direct download upon purchase"),
      ).toBeInTheDocument();
    });
  });

  describe("Brushes category", () => {
    test("contains brush-specific content in Specifications section", async () => {
      await renderCategoryAndOpenAccordion("brushes", "Specifications");

      // Look for brush-specific content
      expect(
        screen.getByText((content) => content.includes("Digital brushes pack")),
      ).toBeInTheDocument();

      expect(
        screen.getByText((content) =>
          content.includes("Achieve your design goals"),
        ),
      ).toBeInTheDocument();
    });

    test("contains brush spec items in How to Use section", async () => {
      await renderCategoryAndOpenAccordion("brushes", "How to Use");

      // Check for spec items
      expect(screen.getByText("BRUSHSET format")).toBeInTheDocument();
      expect(
        screen.getByText(
          (content) =>
            content.includes("Procreate") && content.includes("Adobe"),
        ),
      ).toBeInTheDocument();
      expect(screen.getByText("Completely handmade")).toBeInTheDocument();
    });
  });

  describe("Templates category", () => {
    test("contains template-specific content in Specifications section", async () => {
      await renderCategoryAndOpenAccordion("templates", "Specifications");

      // Look for template-specific content
      expect(
        screen.getByText((content) =>
          content.includes("Digital template to use"),
        ),
      ).toBeInTheDocument();
    });

    test("contains template spec items in How to Use section", async () => {
      await renderCategoryAndOpenAccordion("templates", "How to Use");

      // Check for spec items
      expect(screen.getByText("JPEG format")).toBeInTheDocument();
      expect(screen.getByText("Great quality")).toBeInTheDocument();
    });
  });

  describe("Planners category", () => {
    test("contains planner-specific content in Specifications section", async () => {
      await renderCategoryAndOpenAccordion("planners", "Specifications");

      expect(
        screen.getByText((content) =>
          content.includes("Digital planner to use"),
        ),
      ).toBeInTheDocument();

      expect(
        screen.getByText((content) =>
          content.includes("Please note that this is a PDF file"),
        ),
      ).toBeInTheDocument();
    });

    test("contains planner spec items in How to Use section", async () => {
      await renderCategoryAndOpenAccordion("planners", "How to Use");

      // Check for spec items
      expect(screen.getByText("PDF format")).toBeInTheDocument();
    });
  });

  describe("Case insensitivity", () => {
    test("handles uppercase category names", async () => {
      await renderCategoryAndOpenAccordion("STICKERS", "Specifications");

      expect(
        screen.getByText((content) =>
          content.includes("Digital stickers set to use"),
        ),
      ).toBeInTheDocument();
    });

    test("handles mixed case category names", async () => {
      await renderCategoryAndOpenAccordion("Brushes", "Specifications");
      expect(
        screen.getByText((content) => content.includes("Digital brushes pack")),
      ).toBeInTheDocument();
    });
  });

  describe("Shared components", () => {
    test("CustomDemandSection contains correct content and links", async () => {
      await renderCategoryAndOpenAccordion("stickers", "Custom Demands");

      expect(
        screen.getByText((content) =>
          content.includes("For any custom art demand"),
        ),
      ).toBeInTheDocument();

      const contactLink = screen.getByText("contact form");

      expect(contactLink).toBeInTheDocument();
      expect(contactLink.closest("a")).toHaveAttribute("href", "/contact");
    });

    test("FAQSection contains correct content and links", async () => {
      await renderCategoryAndOpenAccordion("stickers", "FAQ");

      expect(
        screen.getByText((content) => content.includes("Check our")),
      ).toBeInTheDocument();

      const faqLink = screen.getByText("FAQ page");

      expect(faqLink).toBeInTheDocument();
      expect(faqLink.closest("a")).toHaveAttribute("href", "/faq");
    });

    test("CopyrightSection contains correct content and links", async () => {
      await renderCategoryAndOpenAccordion("stickers", "Copyrights");

      // Check for specific content in the copyright section
      expect(
        screen.getByText((content) => content.includes("Original design")),
      ).toBeInTheDocument();

      // Verify the EULA link exists
      const eulaLink = screen.getByText((content) =>
        content.includes("End-User License Agreement"),
      );

      expect(eulaLink).toBeInTheDocument();
      expect(eulaLink.closest("a")).toHaveAttribute("href", "/policies/eula");

      // Check copyright year is current
      const currentYear = new Date().getFullYear();

      expect(
        screen.getByText((content) =>
          content.includes(`2021 - ${currentYear}`),
        ),
      ).toBeInTheDocument();
    });
  });

  test("getSubItemByKey is called with correct parameters", async () => {
    // Test each call separately to avoid multiple elements with the same name

    // Test contact link
    await renderCategoryAndOpenAccordion("stickers", "Custom Demands");
    expect(siteConfig.getSubItemByKey).toHaveBeenCalledWith("contact");
    cleanup();

    // Test FAQ link
    await renderCategoryAndOpenAccordion("stickers", "FAQ");
    expect(siteConfig.getSubItemByKey).toHaveBeenCalledWith("faq");
    cleanup();

    // Test EULA link
    await renderCategoryAndOpenAccordion("stickers", "Copyrights");
    expect(siteConfig.getSubItemByKey).toHaveBeenCalledWith("eula");
  });
});
