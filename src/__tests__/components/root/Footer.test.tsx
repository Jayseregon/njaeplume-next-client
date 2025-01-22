import { render, screen } from "@testing-library/react";

import Footer from "@/src/components/root/Footer";

// Mock the useTranslations hook from next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: { [key: string]: string } = {
      copyright1: "Copyright text 1",
      copyright2: "Copyright text 2",
      google1: "Google text",
      gpp: "Privacy Policy",
      gtxt1: " and ",
      gts: "Terms of Service",
      gtxt2: " apply.",
    };

    return translations[key] || key;
  },
}));

describe("Footer", () => {
  it("renders with current year in copyright notice", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();

    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
  });

  it("renders privacy policy link correctly", () => {
    render(<Footer />);
    const privacyLink = screen.getByText("Privacy Policy");

    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute(
      "href",
      "https://policies.google.com/privacy",
    );
  });

  it("renders terms of service link correctly", () => {
    render(<Footer />);
    const termsLink = screen.getByText("Terms of Service");

    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute(
      "href",
      "https://policies.google.com/terms",
    );
  });

  it("applies nonce attribute when provided", () => {
    const testNonce = "test-nonce-123";

    render(<Footer nonce={testNonce} />);
    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveAttribute("nonce", testNonce);
  });

  it("renders all translated text content", () => {
    render(<Footer />);
    expect(screen.getByText(/Copyright text 1/)).toBeInTheDocument();
    expect(screen.getByText(/Copyright text 2/)).toBeInTheDocument();
    expect(screen.getByText(/Google text/)).toBeInTheDocument();
    expect(screen.getByText(/and/)).toBeInTheDocument();
    expect(screen.getByText(/apply./)).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveClass(
      "w-full",
      "flex",
      "text-xs",
      "text-center",
      "antialiased",
    );
  });
});
