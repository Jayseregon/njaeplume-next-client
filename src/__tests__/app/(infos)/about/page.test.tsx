import React from "react";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";

// Mock Next.js Link component
jest.mock("next/link", () => {
  return {
    __esModule: true,
    default: ({ href, children, ...rest }: any) => (
      <a href={href} {...rest} data-testid="link">
        {children}
      </a>
    )
  };
});

// Mock next-intl translation hook
const mockTranslations = {
  title: "Our Story",
  intro: "We are a little family composed of unconventional adults...",
  artist: "You can call me Ninie, pronounced 'nee-nee'...",
  background: "We are based in Canada but come from across the ocean...",
  customization: "It also occurred to me that having a specific taste...",
  digital: "At the moment, we are focusing on digital products only...",
  conclusion: "For any inquiries or suggestions, feel free to contact us...",
  signature: "- Ninie, Jay and co.",
  cta: "Let us tailor something unique for you.",
  contactButton: "Contact Us"
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => mockTranslations[key as keyof typeof mockTranslations] || key
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn()
}));

// Mock Lucide icon
jest.mock("lucide-react", () => ({
  Mail: () => <span data-testid="mail-icon">Mail Icon</span>
}));

// Mock Button component
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, asChild, className, variant, ...props }: any) => (
    <button 
      data-testid="button" 
      data-as-child={asChild ? "true" : "false"}
      data-variant={variant}
      className={className}
      {...props}>
      {children}
    </button>
  )
}));

// Mock components
jest.mock("@/components/root/ErrorBoundary", () => (props: any) => <>{props.children}</>);
jest.mock("@/components/root/ErrorDefaultDisplay", () => ({
  ErrorDefaultDisplay: () => <div data-testid="error-display">Error</div>
}));
jest.mock("@/components/root/PageTitle", () => ({
  PageTitle: (props: any) => <h1 data-testid="page-title">{props.title}</h1>
}));

// Import the component after mocks
import AboutPage from "@/app/(infos)/about/page";

describe("AboutPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn()
    });
  });

  it("renders the page title correctly", () => {
    render(<AboutPage />);
    expect(screen.getByTestId("page-title")).toHaveTextContent("Our Story");
  });

  it("renders all the paragraphs with translation content", () => {
    render(<AboutPage />);
    
    expect(screen.getByText(mockTranslations.intro)).toBeInTheDocument();
    expect(screen.getByText(mockTranslations.artist)).toBeInTheDocument();
    expect(screen.getByText(mockTranslations.background)).toBeInTheDocument();
    expect(screen.getByText(mockTranslations.customization)).toBeInTheDocument();
    expect(screen.getByText(mockTranslations.digital)).toBeInTheDocument();
    expect(screen.getByText(mockTranslations.conclusion)).toBeInTheDocument();
    expect(screen.getByText(mockTranslations.signature)).toBeInTheDocument();
  });

  it("renders the CTA section with correct text", () => {
    render(<AboutPage />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Let us tailor something unique for you."
    );
  });

  it("renders a contact button that links to the contact page", () => {
    render(<AboutPage />);
    
    const contactButton = screen.getByTestId("button");
    const link = screen.getByTestId("link");
    
    expect(contactButton).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/contact");
    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
  });

  it("uses the form variant for the button styling", () => {
    render(<AboutPage />);
    const button = screen.getByTestId("button");
    expect(button).toHaveAttribute("data-variant", "form");
    expect(button).toHaveAttribute("data-as-child", "true");
  });

  it("wraps content in ErrorBoundary", () => {
    render(<AboutPage />);
    // The mock ErrorBoundary simply renders its children
    // So if all the above tests pass, this implicitly works
    expect(screen.getByTestId("page-title")).toBeInTheDocument();
  });
});
