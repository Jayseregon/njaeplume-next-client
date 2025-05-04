import React from "react";
import { render } from "@testing-library/react";

import PaymentFailureEmail from "@/emails/PaymentFailureTemplate";
import { FailedPaymentProps } from "@/interfaces/StripeWebhook";
// Import the actual messages to get the structure and default values
import enMessages from "@/messages/en.json";

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
  // Extract the relevant message section
  const mockMessages = enMessages.PaymentFailure;

  // Update defaultProps to include the structured messages
  const defaultProps: FailedPaymentProps = {
    customerName: "Jane Smith",
    messages: mockMessages, // Pass the PaymentFailure messages
  };

  test("renders without crashing", () => {
    const { container } = render(<PaymentFailureEmail {...defaultProps} />);

    expect(container).toBeTruthy();
  });

  test("displays the correct title and header using messages prop", () => {
    const { getByText, getByTestId } = render(
      <PaymentFailureEmail {...defaultProps} />,
    );

    // Use keys from mockMessages
    expect(getByText(mockMessages.heading)).toBeInTheDocument();
    expect(getByText(mockMessages.subHeading)).toBeInTheDocument();

    // Check title in head - Query the document directly for the title element
    const titleElement = document.querySelector("title");

    expect(titleElement).not.toBeNull(); // Ensure the title element exists
    expect(titleElement).toHaveTextContent(mockMessages.headTitle);

    const heading = getByTestId("heading");

    expect(heading).toHaveStyle("color: rgb(196, 146, 136)");
  });

  test("displays customer name correctly using messages prop", () => {
    const { getByText } = render(<PaymentFailureEmail {...defaultProps} />);

    // Use greeting key from mockMessages
    expect(
      getByText(`${mockMessages.greeting} Jane Smith,`),
    ).toBeInTheDocument();
  });

  test("displays failure explanation and next steps using messages prop", () => {
    const { getByText } = render(<PaymentFailureEmail {...defaultProps} />);

    // Verify explanation text using key
    expect(getByText(mockMessages.failureText)).toBeInTheDocument();

    // Verify next steps section using keys
    expect(getByText(mockMessages.nextStepsTitle)).toBeInTheDocument();
    expect(getByText(mockMessages.nextStepsText)).toBeInTheDocument();
  });

  test("displays support information using messages prop", () => {
    const { getByText } = render(<PaymentFailureEmail {...defaultProps} />);

    // Verify support text using key
    expect(getByText(mockMessages.supportText)).toBeInTheDocument();
    // Verify closing text using key
    expect(getByText(mockMessages.closingText)).toBeInTheDocument();
  });

  test("shows the current year in the copyright notice", () => {
    const currentYear = new Date().getFullYear();
    const { getByText } = render(<PaymentFailureEmail {...defaultProps} />);

    expect(
      getByText((content) => content.includes(`© ${currentYear} NJAE Plume`)),
    ).toBeInTheDocument();
  });

  test("works with default customer name when not provided (requires messages)", () => {
    // Render without providing customerName, but messages are required
    const { getByText } = render(
      <PaymentFailureEmail
        customerName={undefined as any}
        messages={mockMessages} // Pass default messages
      />,
    );

    // Check default customer name is used along with the greeting message
    expect(getByText(`${mockMessages.greeting} John Doe,`)).toBeInTheDocument();
    // Check other messages are rendered
    expect(getByText(mockMessages.heading)).toBeInTheDocument();
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
