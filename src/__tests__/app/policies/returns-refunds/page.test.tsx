import React from "react";
import { render, screen } from "@testing-library/react";

// Mock translations using simplified version of the content from en.json
const returnsTranslations = {
  "title": "Returns & Refunds",
  "lastUpdated": "Last Updated: March 17, 2025",
  "definitions": {
    "title": "Definitions and Legal References",
    "website": "This Website (or this Application)",
    "websiteDesc": "The property that enables the provision of the Service.",
    "owner": "Owner (or We or Us)",
    "ownerDesc": "NJAE Plume G.P. - The natural person(s) or legal entity that provides this Website and/or the Service to Users.",
    "product": "Product (or Service)",
    "productDesc": "Product (or Service) refers to the digital goods or services provided by this Website as described on this Website.",
    "user": "User (or You)",
    "userDesc": "The natural person or legal entity that uses this Website."
  },
  "policy": {
    "intro": "Thank you for purchasing our digital products at njaeplume.com, operated by NJAE Plume G.P..",
    "noRefunds": "Due to the digital nature of our products, which can be immediately accessed and used upon purchase, all sales are final.",
    "clarification": "We strongly encourage you to carefully review the product description, preview images, and any available demonstrations before making a purchase.",
    "faultyFiles": "In the unlikely event that you experience issues with a downloaded file (e.g., it is corrupted or incomplete), please contact us immediately.",
    "termsOfServiceLink": "Please also refer to our comprehensive Terms of Service for further details regarding your purchase.",
    "governingLaw": "This Returns & Refunds policy is governed by and construed in accordance with the laws of the Province of Quebec.",
    "questions": "We are happy to answer any questions regarding our products before your purchase to ensure they will meet your needs.",
    "additionalQuestions": "If you have any additional questions or concerns, please feel free to contact us through our dedicated contact form.",
    "contactButton": "Contact Us"
  }
};

// Mock next-intl translation hook
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    // Handle nested keys like "definitions.title"
    if (key.includes(".")) {
      const [section, subKey] = key.split(".");
      const sectionData = returnsTranslations[section as keyof typeof returnsTranslations];
      return (typeof sectionData === 'object' && sectionData !== null)
        ? (sectionData as Record<string, string>)[subKey] || key
        : key;
    }
    return returnsTranslations[key as keyof typeof returnsTranslations] || key;
  }
}));

// Mock Next.js Link component
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
      <a href={href} data-testid="contact-link" {...props}>
        {children}
      </a>
    )
  };
});

// Mock Lucide icon
jest.mock("lucide-react", () => ({
  Mail: () => <span data-testid="mail-icon">Mail Icon</span>
}));

// Mock UI components
jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: { className: string }) => (
    <hr data-testid="separator" className={className} />
  )
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, variant, className, ...props }: any) => (
    <button 
      data-testid="button" 
      data-as-child={asChild ? "true" : "false"}
      data-variant={variant}
      className={className} 
      {...props}
    >
      {children}
    </button>
  )
}));

// Mock root components
jest.mock("@/components/root/ErrorBoundary", () => ({ 
  __esModule: true, 
  default: (props: any) => <>{props.children}</> 
}));

jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => <div data-testid="error-display">Error occurred</div>,
}));

jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: ({ title }: { title: string }) => <h1 data-testid="page-title">{title}</h1>,
}));

// Import after mocks
import ReturnsPage from "@/app/policies/returns-refunds/page";

describe("Returns & Refunds Page", () => {
  it("renders the page title correctly", () => {
    render(<ReturnsPage />);
    expect(screen.getByTestId("page-title")).toHaveTextContent("Returns & Refunds");
  });

  it("renders the definitions section with all terms", () => {
    render(<ReturnsPage />);
    
    // Check section title
    expect(screen.getByText("Definitions and Legal References")).toBeInTheDocument();
    
    // Check definition terms are present
    expect(screen.getByText("This Website (or this Application)")).toBeInTheDocument();
    expect(screen.getByText("Owner (or We or Us)")).toBeInTheDocument();
    expect(screen.getByText("Product (or Service)")).toBeInTheDocument();
    expect(screen.getByText("User (or You)")).toBeInTheDocument();
    
    // Check definition descriptions are present
    expect(screen.getByText("The property that enables the provision of the Service.")).toBeInTheDocument();
    expect(screen.getByText(/NJAE Plume G\.P\. - The natural person/)).toBeInTheDocument();
  });

  it("renders policy content with all sections", () => {
    render(<ReturnsPage />);
    
    // Check introduction paragraph
    expect(screen.getByText(/Thank you for purchasing our digital products/)).toBeInTheDocument();
    
    // Check key policy sections
    expect(screen.getByText(/Due to the digital nature of our products/)).toBeInTheDocument();
    expect(screen.getByText(/We strongly encourage you to carefully review/)).toBeInTheDocument();
    expect(screen.getByText(/In the unlikely event that you experience issues/)).toBeInTheDocument();
    expect(screen.getByText(/Please also refer to our comprehensive Terms of Service/)).toBeInTheDocument();
    expect(screen.getByText(/This Returns & Refunds policy is governed by/)).toBeInTheDocument();
    expect(screen.getByText(/We are happy to answer any questions/)).toBeInTheDocument();
    expect(screen.getByText(/If you have any additional questions or concerns/)).toBeInTheDocument();
  });

  it("renders the contact button with correct link", () => {
    render(<ReturnsPage />);
    
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
    render(<ReturnsPage />);
    const separators = screen.getAllByTestId("separator");
    expect(separators.length).toBe(2);
  });

  it("displays the last updated date", () => {
    render(<ReturnsPage />);
    expect(screen.getByText("Last Updated: March 17, 2025")).toBeInTheDocument();
  });

  it("wraps content in ErrorBoundary", () => {
    render(<ReturnsPage />);
    // The mock ErrorBoundary simply renders its children, so verify the content is present
    expect(screen.getByTestId("page-title")).toBeInTheDocument();
  });
});
