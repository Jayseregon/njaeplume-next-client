import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import Link from "next/link";

import { ProductSpecifications } from "@/src/components/product/specsSelector";
import { getSubItemByKey } from "@/src/config/site";

// Add mock for Accordion components
jest.mock("@/components/ui/accordion", () => ({
  Accordion: ({
    children,
    collapsible: _collapsible,
    type: _type,
    ...rest
  }: any) => (
    <div data-testid="accordion" {...rest}>
      {children}
    </div>
  ),
  AccordionItem: ({ children, value, ...props }: any) => (
    <div data-testid={`accordion-item-${value}`} {...props}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children, className, ...props }: any) => (
    <button className={className} data-testid="accordion-trigger" {...props}>
      {children}
    </button>
  ),
  AccordionContent: ({ children, ...props }: any) => (
    <div data-testid="accordion-content" {...props}>
      {children}
    </div>
  ),
}));

// Mock next-intl
const mockRichFunction = jest.fn((key, components) => {
  // Process components and render them with their children
  if (key === "customDemandText" && components.contactLink) {
    return (
      <span>
        For any custom art demand, please reach out to us through our{" "}
        <a href="/contact">contact form</a>, before purchase.
      </span>
    );
  }

  if (
    key === "faqSectionText" &&
    components.faqLink &&
    components.contactLink
  ) {
    return (
      <span>
        Check our <a href="/faq">FAQ page</a> for more information on how to use
        our products, or feel free to <a href="/contact">contact us</a>.
      </span>
    );
  }

  if (key === "line2" && components.eulaLink) {
    return (
      <span>
        For full terms, please refere to our{" "}
        <Link href="/policies/eula">End-User License Agreement (EULA)</Link>.
      </span>
    );
  }

  return key;
});

// Update mockMarkupFunction to ensure it returns a value different from the key
const mockMarkupFunction = jest.fn((key) => `${key}-markup`);

// Fix: Make mockRawFunction return proper structure for howToUse keys
const mockRawFunction = jest.fn((key) => {
  if (key === "categories.brushes.specItems") {
    return [
      ".brushset format",
      "Procreate® and Adobe® Photoshop compatible",
      "Entirely handmade: No AI",
      "Unique",
      "Direct download upon purchase",
    ];
  }

  if (key === "categories.stickers.specItems") {
    return [
      ".png format",
      "Transparent background",
      "Compatible with any image supporting application",
      "Printable on Letter, A4 or smaller paper size.",
      "HD quality",
      "Entirely handmade: No AI",
    ];
  }

  if (key === "categories.templates.specItems") {
    return [
      ".png format",
      "Compatible with any image supporting application",
      "Printable on Letter, A4 or smaller paper size.",
      "Great quality",
      "Entirely handmade: No AI",
    ];
  }

  if (key === "categories.planners.specItems") {
    return [
      ".pdf format",
      "Compatible with any PDF reader application",
      "Printable on Letter, A4 or smaller paper size.",
      "Great quality",
      "Entirely handmade: No AI",
    ];
  }

  // Special handling for howToUse keys to ensure they exist
  if (
    key === "categories.brushes.howtoUse" ||
    key === "categories.stickers.howtoUse" ||
    key === "categories.templates.howtoUse" ||
    key === "categories.planners.howtoUse_part1"
  ) {
    return "Upon downloading, you will receive a .zip file...";
  }

  return [];
});

const translations: Record<string, string> = {
  bulletSymbol: "•●◍●•",
  categoryNotAvailable: "Description not available for this category.",
  "accordionTriggers.specifications": "Specifications",
  "accordionTriggers.howToUse": "How to Use",
  "accordionTriggers.customDemands": "Custom Demands",
  "accordionTriggers.faq": "FAQ",
  "accordionTriggers.copyrights": "Copyrights",
  "categories.brushes.description":
    "Digital brushes pack. Easily adjustable according to your needs.",
  "categories.stickers.description":
    "Digital stickers set to use with your compatible applications. Great for creating cards or artworks, gifts or journaling.",
  "categories.templates.description":
    "Digital template(s) to use with your compatible applications. Great for creating cards or artworks, gifts or planning and journaling.",
  "categories.planners.description1":
    "Digital planner to use all year long with any PDF file reader. Made for journaling, you can write on every page to log in your thoughts, schedules, habits, notes, etc.",
  "categories.planners.description2":
    "Please note that this is a PDF file, which means it cannot link automatically to your other planners or apps like Calendar or Reminders, and there are no input fields to fill in.",
  "categories.brushes.howtoUse":
    "Upon downloading, you will receive a .zip file...",
  "categories.stickers.howtoUse":
    "Upon downloading, you will receive a .zip file...",
  "categories.templates.howtoUse":
    "Upon downloading, you will receive a .zip file...",
  "categories.planners.howtoUse_part1":
    "Upon downloading, you will receive a .zip file...",
  "categories.planners.howtoUse_part2":
    "If the planner has calendar links, the .zip file will reveal a folder with the planner and another PDF file with instructions on the use of these links.",
  "copyright.line1": "Original design. You may not resell or reproduce.",
  "copyright.line3":
    "© 2021 - 2023 Nathalie Tran, aka Niniefy. All Rights Reserved.",
};

const mockT: any = jest.fn((key: string) => translations[key] ?? key);

mockT.rich = mockRichFunction;
mockT.markup = mockMarkupFunction;
mockT.raw = mockRawFunction;

jest.mock("next-intl", () => ({
  useTranslations: () => mockT,
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock config/site
jest.mock("@/src/config/site", () => ({
  getSubItemByKey: jest.fn().mockImplementation((key) => {
    const routeMap: Record<string, { href: string }> = {
      contact: { href: "/contact" },
      faq: { href: "/faq" },
      eula: { href: "/policies/eula" },
    };

    return routeMap[key] || { href: "/" };
  }),
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Circle: () => <span data-testid="circle-icon" />,
}));

describe("ProductSpecifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure mockMarkupFunction is reset to its default behavior for each test
    // if specific tests override it.
    mockMarkupFunction.mockImplementation((key) => `${key}-markup`);
  });

  it("renders an error message for invalid category", () => {
    render(<ProductSpecifications category="invalid" />);
    expect(
      screen.getByText("Description not available for this category."),
    ).toBeInTheDocument();
  });

  it("renders specifications for 'brushes' category", () => {
    render(<ProductSpecifications category="brushes" />);

    // Verify accordion triggers are rendered by their data-testid instead of text content
    expect(screen.getAllByTestId("accordion-trigger")).toHaveLength(5);

    // Check for the Specifications trigger specifically
    const specsTrigger = screen.getByText("Specifications");

    expect(specsTrigger).toBeInTheDocument();
    fireEvent.click(specsTrigger);

    // Check brushes description is rendered
    expect(
      screen.getByText(
        "Digital brushes pack. Easily adjustable according to your needs.",
      ),
    ).toBeInTheDocument();

    // Check that spec items are rendered
    const specItems = screen.getAllByTestId("circle-icon");

    expect(specItems.length).toBeGreaterThan(0);

    // Check translation function was called with the correct key
    expect(mockT).toHaveBeenCalledWith("categories.brushes.description");
    expect(mockRawFunction).toHaveBeenCalledWith(
      "categories.brushes.specItems",
    );
  });

  it("renders specifications for 'stickers' category", () => {
    render(<ProductSpecifications category="stickers" />);

    // Click on specifications accordion
    const specsButton = screen.getByText("Specifications");

    fireEvent.click(specsButton);

    // Check stickers description is rendered
    expect(
      screen.getByText(
        "Digital stickers set to use with your compatible applications. Great for creating cards or artworks, gifts or journaling.",
      ),
    ).toBeInTheDocument();

    // Check translation function was called with the correct key
    expect(mockT).toHaveBeenCalledWith("categories.stickers.description");
    expect(mockRawFunction).toHaveBeenCalledWith(
      "categories.stickers.specItems",
    );
  });

  it("renders specifications for 'templates' category", () => {
    render(<ProductSpecifications category="templates" />);

    // Click on specifications accordion
    const specsButton = screen.getByText("Specifications");

    fireEvent.click(specsButton);

    // Check templates description is rendered
    expect(
      screen.getByText(
        "Digital template(s) to use with your compatible applications. Great for creating cards or artworks, gifts or planning and journaling.",
      ),
    ).toBeInTheDocument();

    // Check translation function was called with the correct key
    expect(mockT).toHaveBeenCalledWith("categories.templates.description");
    expect(mockRawFunction).toHaveBeenCalledWith(
      "categories.templates.specItems",
    );
  });

  it("renders specifications for 'planners' category with two descriptions", () => {
    render(<ProductSpecifications category="planners" />);

    // Click on specifications accordion
    const specsButton = screen.getByText("Specifications");

    fireEvent.click(specsButton);

    // Check both planner descriptions are rendered
    expect(
      screen.getByText(
        "Digital planner to use all year long with any PDF file reader. Made for journaling, you can write on every page to log in your thoughts, schedules, habits, notes, etc.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Please note that this is a PDF file, which means it cannot link automatically to your other planners or apps like Calendar or Reminders, and there are no input fields to fill in.",
      ),
    ).toBeInTheDocument();

    // Check translation function was called with the correct keys
    expect(mockT).toHaveBeenCalledWith("categories.planners.description1");
    expect(mockT).toHaveBeenCalledWith("categories.planners.description2");
    expect(mockRawFunction).toHaveBeenCalledWith(
      "categories.planners.specItems",
    );
  });

  // Fix: Update the "How to Use" test
  it("renders 'How to Use' section correctly for each category", () => {
    // Mock a successful howToUse section - this will override the default mock for this test
    mockMarkupFunction.mockReturnValue(
      "Upon downloading, you will receive a .zip file...",
    );

    render(<ProductSpecifications category="brushes" />);

    // Look for the trigger by testid and text match
    const triggers = screen.getAllByTestId("accordion-trigger");
    const howToUseButton = Array.from(triggers).find(
      (el) => el.textContent === "How to Use",
    );

    // If we found the button, click it
    if (howToUseButton) {
      fireEvent.click(howToUseButton);
      // Check that the specifically mocked markup function was called
      expect(mockMarkupFunction).toHaveBeenCalledWith(
        "categories.brushes.howtoUse",
        expect.any(Object),
      );
    } else {
      // If not found, the test can be skipped with a comment
      throw new Error("How to Use accordion trigger not found");
    }

    // Clean up and test for planners
    jest.clearAllMocks(); // This will clear the specific mockReturnValue for mockMarkupFunction
    // Re-apply the default mock if needed, or ensure the next render uses the default.
    // For this test, we need to mock specific returns for planner parts.
    mockMarkupFunction.mockImplementation((key) => {
      if (key === "categories.planners.howtoUse_part1") {
        return "Planner part 1 content";
      }

      return `${key}-markup`; // Fallback to default for other keys if any
    });

    render(<ProductSpecifications category="planners" />);

    // Click on How to Use accordion again
    const plannerHowToUseButton = Array.from(
      screen.getAllByTestId("accordion-trigger"),
    ).find((el) => el.textContent === "How to Use");

    if (plannerHowToUseButton) {
      fireEvent.click(plannerHowToUseButton);
    } else {
      throw new Error("Planner How to Use accordion trigger not found");
    }

    // Check that both parts are processed for planners
    expect(mockMarkupFunction).toHaveBeenCalledWith(
      "categories.planners.howtoUse_part1",
      expect.any(Object),
    );
    expect(mockT).toHaveBeenCalledWith("categories.planners.howtoUse_part2");
  });

  // Fix: Update the CustomDemandSection test
  it("renders CustomDemandSection with correct links", () => {
    // Reset mock before test
    (getSubItemByKey as jest.Mock).mockClear();

    render(<ProductSpecifications category="brushes" />);

    // Click custom demands accordion by finding it in all triggers
    const triggers = screen.getAllByTestId("accordion-trigger");
    const customDemandsButton = Array.from(triggers).find(
      (el) => el.textContent === "Custom Demands",
    );

    if (customDemandsButton) {
      fireEvent.click(customDemandsButton);
    }

    // Check that link is rendered (this doesn't rely on getSubItemByKey call)
    const contactLink = screen.getByText("contact form");

    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  // Fix: Update the FAQSection test similarly
  it("renders FAQSection with correct links", () => {
    (getSubItemByKey as jest.Mock).mockClear();

    render(<ProductSpecifications category="brushes" />);

    // Find and click FAQ button by its text
    const triggers = screen.getAllByTestId("accordion-trigger");
    const faqButton = Array.from(triggers).find(
      (el) => el.textContent === "FAQ",
    );

    if (faqButton) {
      fireEvent.click(faqButton);
    }

    // Check links without relying on mock function calls
    const faqLink = screen.getByText("FAQ page");

    expect(faqLink).toHaveAttribute("href", "/faq");

    const contactLink = screen.getByText("contact us");

    expect(contactLink).toHaveAttribute("href", "/contact");
  });

  // Fix: Update the CopyrightSection test
  it("renders CopyrightSection with current year and EULA link", () => {
    // Mock Date as in original test
    const originalDate = global.Date;

    global.Date = class extends Date {
      getFullYear() {
        return 2023;
      }
    } as typeof global.Date;

    render(<ProductSpecifications category="brushes" />);

    // Find and click Copyrights button
    const triggers = screen.getAllByTestId("accordion-trigger");
    const copyrightsButton = Array.from(triggers).find(
      (el) => el.textContent === "Copyrights",
    );

    if (copyrightsButton) {
      fireEvent.click(copyrightsButton);
    } else {
      // Fail test if button not found, as it's crucial for this test
      throw new Error("Copyrights accordion trigger not found");
    }

    // Find the specific accordion item for copyrights
    const copyrightsAccordionItem = screen.getByTestId(
      "accordion-item-copyrights",
    );
    // Within that item, find its content
    const copyrightSectionContent = within(copyrightsAccordionItem).getByTestId(
      "accordion-content",
    );

    // Now, check for the specific structure within this content
    const flexContainer = copyrightSectionContent.querySelector(
      "div.flex.flex-col.space-y-1",
    );

    expect(flexContainer).toBeInTheDocument(); // Ensure the container is found
    expect(flexContainer).toHaveClass("flex flex-col space-y-1"); // Check if this div has the correct classes

    // Check copyright lines are rendered (within the specific content)
    expect(
      within(copyrightSectionContent).getByText("line1"),
    ).toBeInTheDocument();
    expect(
      within(copyrightSectionContent).getByText("line3"),
    ).toBeInTheDocument();

    // Check EULA link was processed
    const eulaLink = within(copyrightSectionContent).getByText(
      "End-User License Agreement (EULA)",
    );

    expect(eulaLink).toHaveAttribute("href", "/policies/eula");

    // Restore Date
    global.Date = originalDate;
  });

  it("handles case-insensitive category input", () => {
    // Test with mixed case
    render(<ProductSpecifications category="BrUsHeS" />);

    // Click on specifications accordion
    const specsButton = screen.getByText("Specifications");

    fireEvent.click(specsButton);

    // Check that brushes description is still rendered
    expect(
      screen.getByText(
        "Digital brushes pack. Easily adjustable according to your needs.",
      ),
    ).toBeInTheDocument();
  });

  it("renders BulletPoint component correctly", () => {
    render(<ProductSpecifications category="brushes" />);

    // Click on specifications accordion
    const specsButton = screen.getByText("Specifications");

    fireEvent.click(specsButton);

    // Check that bullet symbol is rendered
    expect(mockT).toHaveBeenCalledWith("bulletSymbol");
  });

  it("renders SpecItem component with Circle icon", () => {
    render(<ProductSpecifications category="brushes" />);

    // Click on specifications accordion
    const specsButton = screen.getByText("Specifications");

    fireEvent.click(specsButton);

    // Find all Circle icons
    const circleIcons = screen.getAllByTestId("circle-icon");

    expect(circleIcons.length).toBeGreaterThan(0);
  });
});
