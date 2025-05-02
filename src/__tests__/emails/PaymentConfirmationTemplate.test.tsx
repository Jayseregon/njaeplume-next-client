import React from "react";
import { render } from "@testing-library/react";

import PaymentConfirmationEmail from "@/emails/PaymentConfirmationTemplate";
import { PaymentConfirmationProps } from "@/interfaces/StripeWebhook";

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
  Button: ({
    href,
    children,
    style,
  }: {
    href: string;
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <a data-testid="button" href={href} style={style}>
      {children}
    </a>
  ),
  Row: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="row">{children}</div>
  ),
  Column: ({
    children,
    style,
  }: {
    children: React.ReactNode;
    style?: React.CSSProperties;
  }) => (
    <div data-testid="column" style={style}>
      {children}
    </div>
  ),
  title: ({ children }: { children: React.ReactNode }) => (
    <title>{children}</title>
  ),
}));

describe("PaymentConfirmationEmail", () => {
  const mockOrderItems = [
    {
      product: {
        name: "Digital Sticker Pack",
        category: "Stickers",
        price: 5.99,
      },
    },
    {
      product: {
        name: "Procreate Brush Set",
        category: "Brushes",
        price: 12.99,
      },
    },
  ];

  const defaultProps: PaymentConfirmationProps = {
    displayId: "ORDER-123-456",
    amount: 18.98,
    createdAt: "2023-10-15T14:30:00Z",
    items: mockOrderItems,
    customerName: "Jane Doe",
    downloadLink: "https://example.com/download",
  };

  test("renders without crashing", () => {
    const { container } = render(
      <PaymentConfirmationEmail {...defaultProps} />,
    );

    expect(container).toBeTruthy();
  });

  test("displays correct order information", () => {
    const { getByText } = render(
      <PaymentConfirmationEmail {...defaultProps} />,
    );

    expect(getByText("Payment Successful! 🎉")).toBeInTheDocument();
    expect(getByText("Hi Jane Doe,")).toBeInTheDocument();
    expect(
      getByText((content) => content.includes("ORDER-123-456")),
    ).toBeInTheDocument();
    expect(
      getByText((content) => content.includes("$18.98")),
    ).toBeInTheDocument();
  });

  test("formats the date correctly", () => {
    const { getByText } = render(
      <PaymentConfirmationEmail {...defaultProps} />,
    );

    // October 15, 2023 should be the formatted date from '2023-10-15T14:30:00Z'
    expect(
      getByText((content) => content.includes("October 15, 2023")),
    ).toBeInTheDocument();
  });

  test("displays all purchased items", () => {
    const { getByText } = render(
      <PaymentConfirmationEmail {...defaultProps} />,
    );

    // Check both products are displayed
    expect(getByText("Digital Sticker Pack")).toBeInTheDocument();
    expect(getByText("Stickers")).toBeInTheDocument();
    expect(getByText("$5.99")).toBeInTheDocument();

    expect(getByText("Procreate Brush Set")).toBeInTheDocument();
    expect(getByText("Brushes")).toBeInTheDocument();
    expect(getByText("$12.99")).toBeInTheDocument();
  });

  test("includes download button with correct link", () => {
    const { getByTestId } = render(
      <PaymentConfirmationEmail {...defaultProps} />,
    );

    const downloadButton = getByTestId("button");

    expect(downloadButton).toHaveAttribute(
      "href",
      "https://example.com/download",
    );
    expect(downloadButton).toHaveTextContent("View My Purchases");
  });

  test("shows the current year in the copyright notice", () => {
    const currentYear = new Date().getFullYear();
    const { getByText } = render(
      <PaymentConfirmationEmail {...defaultProps} />,
    );

    expect(
      getByText((content) => content.includes(`© ${currentYear} NJAE Plume`)),
    ).toBeInTheDocument();
  });

  test("works with default values when props are missing", () => {
    // Render with empty props to trigger default values
    const { getByText } = render(
      <PaymentConfirmationEmail
        amount={undefined as any}
        createdAt={undefined as any}
        customerName={undefined as any}
        displayId={undefined as any}
        downloadLink={undefined as any}
        items={undefined as any}
      />,
    );

    // Check default values are used
    expect(
      getByText((content) => content.includes("NJAE2025-OID0101-010100CO87")),
    ).toBeInTheDocument();
    expect(
      getByText((content) => content.includes("$11.45")),
    ).toBeInTheDocument();
    expect(getByText("Digital Product 1")).toBeInTheDocument();
    expect(getByText("Digital Product 2")).toBeInTheDocument();
  });

  test("applies proper styling to key elements", () => {
    const { getByTestId, getAllByTestId } = render(
      <PaymentConfirmationEmail {...defaultProps} />,
    );

    // Check email body background color
    const body = getByTestId("body");

    expect(body).toHaveStyle("backgroundColor: rgb(248, 245, 238)");

    // Check heading color
    const heading = getByTestId("heading");

    expect(heading).toHaveStyle("color: rgb(196, 146, 136)");

    // Check button styling
    const button = getByTestId("button");

    expect(button).toHaveStyle("backgroundColor: rgb(196, 146, 136)");
    expect(button).toHaveStyle("color: #ffffff");

    // Check product sections
    const sections = getAllByTestId("section");
    const productSection = sections.find((section) =>
      section.textContent?.includes("Digital Sticker Pack"),
    );

    expect(productSection).toBeDefined();
  });
});
