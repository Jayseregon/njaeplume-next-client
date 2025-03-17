import { render, screen } from "@testing-library/react";

import Footer from "@/components/root/Footer";

// Mock the useTranslations hook from next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: { [key: string]: string } = {
      about: "About Us",
      ourStory: "Our Story",
      policies: "Policies",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookies: "Cookies",
      returns: "Returns",
      shipping: "Shipping",
      disclaimer: "Disclaimers",
      help: "Help",
      faq: "FAQ",
      contact: "Contact Us",
      digital: "Status",
      online: "Online",
      location: "Location",
      locationAddress: "Digital Product",
      humanMadeProducts: "Human-made Products",
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

  it("renders Our Story link correctly", () => {
    render(<Footer />);
    const ourStoryLink = screen.getByText("Our Story");

    expect(ourStoryLink).toBeInTheDocument();
    expect(ourStoryLink).toHaveAttribute("href", "/about");
  });

  it("renders privacy policy link correctly", () => {
    render(<Footer />);
    const privacyLink = screen.getByText("Privacy Policy", {
      selector: 'a[href="https://policies.google.com/privacy"]',
    });

    expect(privacyLink).toBeInTheDocument();
    expect(privacyLink).toHaveAttribute(
      "href",
      "https://policies.google.com/privacy",
    );
  });

  it("renders terms of service link correctly", () => {
    render(<Footer />);
    const termsLink = screen.getByText("Terms of Service", {
      selector: 'a[href="https://policies.google.com/terms"]',
    });

    expect(termsLink).toBeInTheDocument();
    expect(termsLink).toHaveAttribute(
      "href",
      "https://policies.google.com/terms",
    );
  });

  it("renders policy page links correctly", () => {
    render(<Footer />);

    // Check all policy links exist with correct hrefs
    const policyLinks = [
      { text: "Privacy Policy", href: "/policies/privacy" },
      { text: "Terms of Service", href: "/policies/terms" },
      { text: "Cookies", href: "/policies/cookies" },
      { text: "Returns", href: "/policies/returns-refunds" },
      { text: "Shipping", href: "/policies/shipping" },
      { text: "Disclaimers", href: "/policies/disclaimers" },
    ];

    policyLinks.forEach((link) => {
      const element = screen
        .getAllByText(link.text)
        .find((el) => el.closest("a")?.getAttribute("href") === link.href);

      expect(element).toBeInTheDocument();
      expect(element?.closest("a")).toHaveAttribute("href", link.href);
    });
  });

  it("renders help links correctly", () => {
    render(<Footer />);

    const faqLink = screen.getByText("FAQ");

    expect(faqLink).toBeInTheDocument();
    expect(faqLink.closest("a")).toHaveAttribute("href", "/faq");

    const contactLink = screen.getByText("Contact Us");

    expect(contactLink).toBeInTheDocument();
    expect(contactLink.closest("a")).toHaveAttribute("href", "/contact");
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
    expect(screen.getByText("Human-made Products")).toBeInTheDocument();
    expect(screen.getByText(/Google text/)).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(<Footer />);
    const footer = screen.getByRole("contentinfo");

    expect(footer).toHaveClass(
      "w-full",
      "bg-stone-50",
      "dark:bg-stone-900",
      "text-stone-700",
      "dark:text-stone-300",
    );

    // Check container and grid layout
    expect(footer.firstChild).toHaveClass(
      "container",
      "mx-auto",
      "px-4",
      "py-8",
      "md:py-10",
    );
    const mainContent = footer.querySelector(".grid");

    expect(mainContent).toHaveClass("grid-cols-1", "md:grid-cols-3", "gap-6");
  });

  it("renders the human-made products element", () => {
    render(<Footer />);
    const humanMadeElement = screen.getByText("Human-made Products");

    expect(humanMadeElement).toBeInTheDocument();
    expect(humanMadeElement.parentElement).toHaveClass(
      "bg-amber-50",
      "dark:bg-amber-900/30",
      "text-amber-700",
      "dark:text-amber-300",
    );
  });

  it("renders the fun digital element with status indicator", () => {
    render(<Footer />);
    const statusText = screen.getByText("Status:");
    const statusValue = screen.getByText("Online");
    const locationText = screen.getByText("Location:");
    const locationValue = screen.getByText("Digital Product");

    expect(statusText).toBeInTheDocument();
    expect(statusValue).toBeInTheDocument();
    expect(locationText).toBeInTheDocument();
    expect(locationValue).toBeInTheDocument();
  });
});
