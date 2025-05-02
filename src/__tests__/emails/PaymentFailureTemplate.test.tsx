import React from "react";
import { render } from "@testing-library/react";

import PaymentFailureEmail from "@/emails/PaymentFailureTemplate";
import { FailedPaymentProps } from "@/interfaces/StripeWebhook";

// Mock the react-email components to make them testable with React Testing Library
jest.mock("@react-email/components", () => ({
  Html: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="html">{children}</div>
  ),
  Head: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="head">{children}</div>
  ),
  Body: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="body" style={style}>
      {children}
    </div>
  ),
  Container: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="container" style={style}>
      {children}
    </div>
  ),
  Section: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="section" style={style}>
      {children}
    </div>
  ),
  Text: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="text" style={style}>
      {children}
    </div>
  ),
  Hr: ({ style }: { style?: React.CSSProperties }) => (
    <hr data-testid="hr" style={style} />
  ),
  Heading: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <h1 data-testid="heading" style={style}>
      {children}
    </h1>
  ),
  title: ({ children }: { children: React.ReactNode }) => (
    <title>{children}</title>
  ),
}));

describe("PaymentFailureEmail", () => {
  const defaultProps: FailedPaymentProps = {
    customerName: "Jane Smith",
  };

  test("renders without crashing", () => {
    const { container } = render(<PaymentFailureEmail {...defaultProps} />);

    expect(container).toBeTruthy();
  });

  test("displays the correct title and header", () => {
    const { getByText, getByTestId } = render(
      <PaymentFailureEmail {...defaultProps} />,
    );

    expect(getByText("Payment Was Not Successful")).toBeInTheDocument();
    expect(
      getByText("We were unable to process your payment for NJAE Plume"),
    ).toBeInTheDocument();

    const heading = getByTestId("heading");

    expect(heading).toHaveStyle("color: rgb(196, 146, 136)");
  });

  test("displays customer name correctly", () => {
    const { getByText } = render(
      <PaymentFailureEmail customerName="Jane Smith" />,
    );

    expect(getByText("Hi Jane Smith,")).toBeInTheDocument();
  });

  test("displays failure explanation and next steps", () => {
    const { getByText } = render(<PaymentFailureEmail {...defaultProps} />);

    // Verify explanation text is shown
    expect(
      getByText((content) =>
        content.includes("Your recent payment attempt failed"),
      ),
    ).toBeInTheDocument();

    // Verify next steps section
    expect(getByText("What to do next:")).toBeInTheDocument();
    expect(
      getByText((content) =>
        content.includes("No charges have been processed"),
      ),
    ).toBeInTheDocument();
  });

  test("displays support information", () => {
    const { getByText } = render(<PaymentFailureEmail {...defaultProps} />);

    expect(
      getByText((content) => content.includes("support@njaeplume.com")),
    ).toBeInTheDocument();

    expect(
      getByText("Thank you for your interest in NJAE Plume."),
    ).toBeInTheDocument();
  });

  test("shows the current year in the copyright notice", () => {
    const currentYear = new Date().getFullYear();
    const { getByText } = render(<PaymentFailureEmail {...defaultProps} />);

    expect(
      getByText((content) => content.includes(`© ${currentYear} NJAE Plume`)),
    ).toBeInTheDocument();
  });

  test("works with default customer name when not provided", () => {
    // Render without providing customerName
    const { getByText } = render(
      <PaymentFailureEmail customerName={undefined as any} />,
    );

    // Check default customer name is used
    expect(getByText("Hi John Doe,")).toBeInTheDocument();
  });

  test("applies proper styling to key elements", () => {
    const { getByTestId } = render(<PaymentFailureEmail {...defaultProps} />);

    // Check body background color
    const body = getByTestId("body");

    expect(body).toHaveStyle("backgroundColor: rgb(248, 245, 238)");
    expect(body).toHaveStyle("color: rgb(196, 146, 136)");

    // Check container styles
    const container = getByTestId("container");

    expect(container).toHaveStyle("backgroundColor: #ffffff");
    expect(container).toHaveStyle("borderRadius: 8px");

    // Check main content section
    const sections = document.querySelectorAll('[data-testid="section"]');
    const mainSection = sections[1]; // Usually the second section is the main content

    expect(mainSection).toHaveStyle("borderLeft: 4px solid rgb(196, 146, 136)");
  });
});
