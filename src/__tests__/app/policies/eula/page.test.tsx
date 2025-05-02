import React from "react";
import { render, screen } from "@testing-library/react";

// Mock translations using simplified version of the content from en.json
const eulaTranslations = {
  title: "End-User License Agreement (EULA)",
  lastUpdated: "Last Updated: March 17, 2025",
  definitions: {
    title: "Definitions and Legal References",
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
      "Thank you for purchasing our digital products at njaeplume.com, operated by NJAE Plume G.P..",
    acceptance:
      "By purchasing and downloading our digital product, you acknowledge that you have read, understood, and agree to be bound by this License Agreement.",
    licenseGrant:
      "Upon purchase, you are granted a limited, non-exclusive, non-transferable license to use the digital product for personal purposes only.",
    usageRestrictions:
      "You are not permitted to resell, reproduce, distribute, modify, or create derivative works of the product without prior written consent from NJAE Plume G.P..",
    personalUseClarification:
      "Personal use as permitted under this license means using the digital product for your own individual, non-commercial purposes.",
    copyright:
      "All copyrights and intellectual property rights in the product remain the exclusive property of NJAE Plume G.P..",
    termination:
      "This license is effective until terminated by NJAE Plume G.P..",
    warrantyDisclaimer:
      "The product is provided 'as-is' without any warranties, either express or implied.",
    limitationOfLiability:
      "To the maximum extent permitted by applicable law, in no event shall NJAE Plume G.P. be liable for any indirect, incidental, special, consequential, or punitive damages.",
    indemnification:
      "You agree to indemnify and hold harmless NJAE Plume G.P., its affiliates, officers, directors, employees, agents, and licensors.",
    governingLaw:
      "This Agreement is governed by and construed in accordance with the laws of the Province of Quebec and the federal laws of Canada applicable therein.",
    entireAgreement:
      "This License Agreement constitutes the entire agreement between you and NJAE Plume G.P. concerning the product.",
    severability:
      "If any provision of this License Agreement is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall remain in full force and effect.",
  },
};

// Mock next-intl translation hook
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    // Handle nested keys like "definitions.title"
    if (key.includes(".")) {
      const [section, subKey] = key.split(".");
      const sectionData =
        eulaTranslations[section as keyof typeof eulaTranslations];

      return typeof sectionData === "object" && sectionData !== null
        ? (sectionData as Record<string, string>)[subKey] || key
        : key;
    }

    return eulaTranslations[key as keyof typeof eulaTranslations] || key;
  },
}));

// Mock UI components
jest.mock("@/components/ui/separator", () => ({
  Separator: ({ className }: { className: string }) => (
    <hr className={className} data-testid="separator" />
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
import EULAPage from "@/app/policies/eula/page";

describe("EULA Page", () => {
  it("renders the page title correctly", () => {
    render(<EULAPage />);
    expect(screen.getByTestId("page-title")).toHaveTextContent(
      "End-User License Agreement (EULA)",
    );
  });

  it("renders the definitions section with all terms", () => {
    render(<EULAPage />);

    // Check section title
    expect(
      screen.getByText("Definitions and Legal References"),
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
    render(<EULAPage />);

    // Check introduction paragraph
    expect(
      screen.getByText(/Thank you for purchasing our digital products/),
    ).toBeInTheDocument();

    // Check key policy sections
    expect(
      screen.getByText(/By purchasing and downloading our digital product/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Upon purchase, you are granted a limited/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You are not permitted to resell/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Personal use as permitted under this license/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/All copyrights and intellectual property rights/),
    ).toBeInTheDocument();

    // Check legal sections
    expect(
      screen.getByText(/This license is effective until terminated/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The product is provided 'as-is'/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/To the maximum extent permitted by applicable law/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You agree to indemnify and hold harmless/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This Agreement is governed by and construed/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /This License Agreement constitutes the entire agreement/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/If any provision of this License Agreement is held/),
    ).toBeInTheDocument();
  });

  it("renders separators between sections", () => {
    render(<EULAPage />);
    const separators = screen.getAllByTestId("separator");

    expect(separators.length).toBe(2);
  });

  it("displays the last updated date", () => {
    render(<EULAPage />);
    expect(
      screen.getByText("Last Updated: March 17, 2025"),
    ).toBeInTheDocument();
  });

  it("wraps content in ErrorBoundary", () => {
    render(<EULAPage />);
    // The mock ErrorBoundary simply renders its children, so verify the content is present
    expect(screen.getByTestId("page-title")).toBeInTheDocument();
  });
});
