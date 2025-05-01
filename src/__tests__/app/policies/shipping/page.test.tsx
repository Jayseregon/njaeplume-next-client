import React from "react";
import { render, screen } from "@testing-library/react";

// Mock translations using simplified version of the content from en.json
const shippingTranslations = {
  title: "Shipping",
  lastUpdated: "Last Updated: March 17, 2025",
  definitions: {
    title: "Definitions and legal references",
    website: "This Website (or this Application)",
    websiteDesc: "The property that enables the provision of the Service.",
    owner: "Owner (or We or Us)",
    ownerDesc:
      "NJAE Plume G.P. - The natural person(s) or legal entity that provides this Website and/or the Service to Users.",
    product: "Product (or Service)",
    productDesc:
      "Product (or Service) refers to the digital goods or services provided by this Website as described on this Website.",
    user: "User (or You)",
    userDesc: "The natural person or legal entity that uses this Website.",
  },
  policy: {
    intro:
      "Thank you for purchasing our products at njaeplume.com operated by NJAE Plume G.P..",
    noShipping:
      "Due to the digital nature of our products, we do not provide any shipping services, and no shipping fees are applicable.",
    download:
      "Each product is available for direct download immediately upon purchase.",
    technicalIssue:
      "In the event of a technical issue (for example, if you do not receive a download link or are unable to download your product), please contact us immediately through our dedicated contact form with your proof of purchase.",
    understanding: "Thank you for your understanding.",
    additionalQuestions:
      "If you have any additional questions, feel free to contact us through our dedicated contact form.",
    contactButton: "Contact Us",
  },
};

// Mock next-intl translation hook
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    // Handle nested keys like "definitions.title"
    if (key.includes(".")) {
      const [section, subKey] = key.split(".");
      const sectionData =
        shippingTranslations[section as keyof typeof shippingTranslations];

      return typeof sectionData === "object" && sectionData !== null
        ? (sectionData as Record<string, string>)[subKey] || key
        : key;
    }

    return (
      shippingTranslations[key as keyof typeof shippingTranslations] || key
    );
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
      <a data-testid="contact-link" href={href} {...props}>
        {children}
      </a>
    ),
  };
});

// Mock Lucide icon
jest.mock("lucide-react", () => ({
  Mail: () => <span data-testid="mail-icon">Mail Icon</span>,
}));

// Mock UI components
jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: { className: string }) => (
    <hr className={className} data-testid="separator" />
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, variant, className, ...props }: any) => (
    <button
      className={className}
      data-as-child={asChild ? "true" : "false"}
      data-testid="button"
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock root components
jest.mock("@/components/root/ErrorBoundary", () => ({
  __esModule: true,
  default: (props: any) => <>{props.children}</>,
}));

jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => (
    <div data-testid="error-display">Error occurred</div>
  ),
}));

jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => (
    <h1 data-testid="page-title">{title}</h1>
  ),
}));

// Import after mocks
import ShippingPage from "@/app/policies/shipping/page";

describe("Shipping Page", () => {
  it("renders the page title correctly", () => {
    render(<ShippingPage />);
    expect(screen.getByTestId("page-title")).toHaveTextContent("Shipping");
  });

  it("renders the definitions section with all terms", () => {
    render(<ShippingPage />);

    // Check section title
    expect(
      screen.getByText("Definitions and legal references"),
    ).toBeInTheDocument();

    // Check definition terms are present
    expect(
      screen.getByText("This Website (or this Application)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Owner (or We or Us)")).toBeInTheDocument();
    expect(screen.getByText("Product (or Service)")).toBeInTheDocument();
    expect(screen.getByText("User (or You)")).toBeInTheDocument();

    // Check definition descriptions are present
    expect(
      screen.getByText(
        "The property that enables the provision of the Service.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/NJAE Plume G\.P\. - The natural person/),
    ).toBeInTheDocument();
  });

  it("renders policy content with all sections", () => {
    render(<ShippingPage />);

    // Check introduction paragraph
    expect(
      screen.getByText(/Thank you for purchasing our products/),
    ).toBeInTheDocument();

    // Check key policy sections
    expect(
      screen.getByText(
        /Due to the digital nature of our products, we do not provide any shipping/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Each product is available for direct download/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/In the event of a technical issue/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Thank you for your understanding/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/If you have any additional questions/),
    ).toBeInTheDocument();
  });

  it("renders the contact button with correct link", () => {
    render(<ShippingPage />);

    // Check button text
    expect(screen.getByText("Contact Us")).toBeInTheDocument();

    // Check mail icon
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();

    // Check link href
    const contactLink = screen.getByTestId("contact-link");

    expect(contactLink).toHaveAttribute("href", "/contact");

    // Check button styling
    const button = screen.getByTestId("button");

    expect(button).toHaveAttribute("data-variant", "form");
    expect(button).toHaveAttribute("data-as-child", "true");
  });

  it("renders separators between sections", () => {
    render(<ShippingPage />);
    const separators = screen.getAllByTestId("separator");

    expect(separators.length).toBe(2);
  });

  it("displays the last updated date", () => {
    render(<ShippingPage />);
    expect(
      screen.getByText("Last Updated: March 17, 2025"),
    ).toBeInTheDocument();
  });

  it("wraps content in ErrorBoundary", () => {
    render(<ShippingPage />);
    // The mock ErrorBoundary simply renders its children, so verify the content is present
    expect(screen.getByTestId("page-title")).toBeInTheDocument();
  });
});
