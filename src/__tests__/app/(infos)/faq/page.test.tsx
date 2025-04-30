import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Define a type for the question structure with optional answers
type FAQQuestion = {
  question: string;
  answer1: string;
  answer2?: string;
  answer3?: string;
  answer4?: string;
  answer5?: string;
};

type FAQSections = {
  usage: FAQQuestion;
  unique: FAQQuestion;
  logos?: FAQQuestion;
  niniefy?: FAQQuestion;
  shipping?: FAQQuestion;
  returns?: FAQQuestion;
  custom?: FAQQuestion;
  fewProducts?: FAQQuestion;
  fanArt?: FAQQuestion;
  howToUse?: FAQQuestion;
};

// Mock translations using the actual FAQ structure from en.json
const faqTranslations = {
  title: "FAQ",
  lastUpdated: "Last Updated: November 19, 2023",
  questions: {
    usage: {
      question: "What can we do with these products?",
      answer1:
        "After you purchase any of our products, even custom ones, you can use it for your personal projects.",
      answer2:
        "You can showcase it, but you can not resell it, reproduce or copy.",
      answer3:
        "If you are a company and want to make a collaboration, feel free to reach out to us.",
      answer4: "Fonts have special conditions, though.",
    },
    unique: {
      question: "Are the products unique?",
      answer1:
        "Every single product in this website has been handmade entirely and is unique.",
      answer2: "You won't find a copy anywhere.",
      answer3:
        "However, if there are any similarities, this is purely a coincidence.",
    },
    // More questions would be here in the real mock
  } as FAQSections,
};

// Mock next-intl translation hook
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    if (key === "title") return faqTranslations.title;
    if (key.startsWith("questions.")) {
      const [_, sectionId, field] = key.split(".");
      const section = faqTranslations.questions[sectionId as keyof FAQSections];
      
      if (!section) return key;
      
      if (field === "question") {
        return section.question || key;
      }
      
      // Safe access with type assertion
      return (section as Record<string, string>)[field] || key;
    }
    return key;
  },
}));

// Mock Accordion components - Fixed to handle boolean attributes properly
jest.mock("@/components/ui/accordion", () => ({
  Accordion: ({ children, collapsible, type, ...props }: any) => {
    // Create a props object with properly stringified boolean attributes
    const safeProps = {
      ...props,
      "data-collapsible": collapsible ? "true" : "false", // Convert boolean to data attribute
      "data-type": type || "single",
    };
    
    return (
      <div
        data-testid="accordion"
        {...safeProps}>
        {children}
      </div>
    );
  },
  AccordionItem: ({ children, value, ...props }: any) => (
    <div
      data-testid={`accordion-item-${value}`}
      data-value={value}
      {...props}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children, ...props }: any) => (
    <button
      data-testid="accordion-trigger"
      {...props}>
      {children}
    </button>
  ),
  AccordionContent: ({ children, ...props }: any) => (
    <div
      data-testid="accordion-content"
      {...props}>
      {children}
    </div>
  ),
}));

// Mock ErrorBoundary and PageTitle
jest.mock("@/components/root/ErrorBoundary", () => (props: any) => (
  <>{props.children}</>
));
jest.mock("@/components/root/ErrorDefaultDisplay", () => () => (
  <div data-testid="error-default-display" />
));
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: (props: any) => <h1>{props.title}</h1>,
}));

// Import after mocks
import FAQPage from "@/app/(infos)/faq/page";

describe("FAQPage", () => {
  it("renders the FAQ page with title", () => {
    render(<FAQPage />);
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders the correct number of FAQ sections", () => {
    render(<FAQPage />);
    // The component defines 10 sections in faqStructure
    const accordionItems = screen.getAllByTestId(/^accordion-item/);
    expect(accordionItems).toHaveLength(10);
  });

  it("renders the questions correctly", () => {
    render(<FAQPage />);
    // Check if the first two questions from our mock are rendered
    expect(
      screen.getByText("What can we do with these products?")
    ).toBeInTheDocument();
    expect(screen.getByText("Are the products unique?")).toBeInTheDocument();
  });

  it("renders the correct number of answers for each section", () => {
    render(<FAQPage />);

    // We should have multiple accordion content divs
    const accordionContents = screen.getAllByTestId("accordion-content");
    expect(accordionContents.length).toBe(10);

    // Get all triggers (question headers)
    const triggers = screen.getAllByTestId("accordion-trigger");

    // Check "usage" section has 4 paragraphs (answers)
    fireEvent.click(triggers[0]); // Click "What can we do with these products?"
    const usageItem = screen.getByTestId("accordion-item-usage");
    const usageAnswers = usageItem.querySelectorAll("p");
    expect(usageAnswers.length).toBe(4);

    // Check "unique" section has 3 paragraphs (answers)
    fireEvent.click(triggers[1]); // Click "Are the products unique?"
    const uniqueItem = screen.getByTestId("accordion-item-unique");
    const uniqueAnswers = uniqueItem.querySelectorAll("p");
    expect(uniqueAnswers.length).toBe(3);
  });

  it("renders answer content correctly", () => {
    render(<FAQPage />);

    // Check content of first answer in "usage" section
    const triggers = screen.getAllByTestId("accordion-trigger");
    fireEvent.click(triggers[0]);

    expect(
      screen.getByText(
        "After you purchase any of our products, even custom ones, you can use it for your personal projects."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "You can showcase it, but you can not resell it, reproduce or copy."
      )
    ).toBeInTheDocument();
  });

  it("renders all sections defined in faqStructure", () => {
    render(<FAQPage />);

    // Check all section IDs from faqStructure are rendered as accordion items
    expect(screen.getByTestId("accordion-item-usage")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-unique")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-logos")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-niniefy")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-shipping")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-returns")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-custom")).toBeInTheDocument();
    expect(
      screen.getByTestId("accordion-item-fewProducts")
    ).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-fanArt")).toBeInTheDocument();
    expect(screen.getByTestId("accordion-item-howToUse")).toBeInTheDocument();
  });
});
