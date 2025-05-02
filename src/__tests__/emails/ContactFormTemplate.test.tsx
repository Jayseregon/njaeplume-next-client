import React from "react";
import { render } from "@testing-library/react";

import ContactFormTemplate from "@/emails/ContactFormTemplate";
import { ContactFormTemplateProps } from "@/interfaces/Contact";

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

describe("ContactFormTemplate", () => {
  const defaultProps: ContactFormTemplateProps = {
    firstName: "John",
    lastName: "Doe",
    subject: "Test Subject",
    email: "john.doe@example.com",
    message: "This is a test message",
  };

  test("renders without crashing", () => {
    const { container } = render(<ContactFormTemplate {...defaultProps} />);

    expect(container).toBeTruthy();
  });

  test("displays the proper title", () => {
    const { getByText } = render(<ContactFormTemplate {...defaultProps} />);

    expect(getByText("Hey there! 👋")).toBeInTheDocument();
  });

  test("displays the greeting header", () => {
    const { getByText, getByTestId } = render(
      <ContactFormTemplate {...defaultProps} />,
    );
    const heading = getByTestId("heading");

    expect(heading).toBeInTheDocument();
    expect(getByText("Hey there! 👋")).toBeInTheDocument();
  });

  test("displays the form submission intro text", () => {
    const { getByText } = render(<ContactFormTemplate {...defaultProps} />);

    expect(
      getByText("Someone just reached out through the NJAE Plume contact form"),
    ).toBeInTheDocument();
  });

  test("displays the sender information correctly", () => {
    const { getByText } = render(<ContactFormTemplate {...defaultProps} />);

    // Check sender info section
    expect(getByText("From:")).toBeInTheDocument();
    expect(getByText("John Doe (john.doe@example.com)")).toBeInTheDocument();

    // Check subject section
    expect(getByText("Subject:")).toBeInTheDocument();
    expect(getByText("Test Subject")).toBeInTheDocument();

    // Check message section
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("This is a test message")).toBeInTheDocument();
  });

  test("displays the current year in copyright notice", () => {
    const currentYear = new Date().getFullYear();
    const { getByText } = render(<ContactFormTemplate {...defaultProps} />);

    expect(
      getByText(`© ${currentYear} NJAE Plume. All rights reserved.`),
    ).toBeInTheDocument();
  });

  test("works with default props when not all props are provided", () => {
    // Use partial props to test default prop behavior
    const { getByText } = render(<ContactFormTemplate {...defaultProps} />);

    // Check sender info section with default values
    expect(getByText("From:")).toBeInTheDocument();
    expect(getByText("John Doe (john.doe@example.com)")).toBeInTheDocument();

    // Check subject and message with default values
    expect(getByText("Subject:")).toBeInTheDocument();
    expect(getByText("Test Subject")).toBeInTheDocument();
    expect(getByText("Message:")).toBeInTheDocument();
    expect(getByText("This is a test message")).toBeInTheDocument();
  });

  test("applies the correct styles", () => {
    const { getByTestId } = render(<ContactFormTemplate {...defaultProps} />);

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
    const contentSection = sections[1]; // Second section is the content

    expect(contentSection).toHaveStyle(
      "borderLeft: 4px solid rgb(196, 146, 136)",
    );
  });
});
