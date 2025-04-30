import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next-intl translation hook
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock shadcn Button
jest.mock("@/components/ui/button", () => ({
  Button: (props: any) => (
    <button {...props}>{props.children}</button>
  ),
}));

// Mock icons
jest.mock("@/components/icons", () => ({
  EmailIcon: (props: any) => <div data-testid="email-icon" {...props} />,
}));

// Mock child contact components
jest.mock("@/components/contact/SuccessDisplay", () => ({
  SuccessDisplay: (props: any) => <div data-testid="success-display" />,
}));
jest.mock("@/components/contact/ErrorDisplay", () => ({
  ErrorDisplay: (props: any) => <div data-testid="error-display" />,
}));
jest.mock("@/components/contact/FieldInput", () => ({
  FieldInput: (props: any) => (
    <input
      data-testid={`input-${props.fieldTarget}`}
      name={props.fieldTarget}
      value={props.value}
      onChange={props.onChange}
    />
  ),
}));
jest.mock("@/components/contact/TextInput", () => ({
  TextInput: (props: any) => (
    <textarea
      data-testid={`textarea-${props.fieldTarget}`}
      name={props.fieldTarget}
      value={props.value}
      onChange={props.onChange}
    />
  ),
}));
jest.mock("@/components/contact/HoneypotField", () => ({
  HoneypotField: (props: any) => (
    <input
      data-testid="honeypot"
      name="honeypot"
      value={props.value}
      onChange={props.onChange}
    />
  ),
}));
jest.mock("@/components/root/ErrorBoundary", () => (props: any) => <>{props.children}</>);
jest.mock("@/components/root/ErrorDefaultDisplay", () => () => <div data-testid="error-default-display" />);
jest.mock("@/components/root/PageTitle", () => ({ PageTitle: (props: any) => <h1>{props.title}</h1> }));

// Mock ReCAPTCHA
jest.mock("react-google-recaptcha", () =>
  function MockReCAPTCHA(props: any) {
    return (
      <button
        data-testid="recaptcha-mock"
        onClick={() => props.onChange && props.onChange("mock-token")}
      >
        Mock ReCAPTCHA
      </button>
    );
  }
);

// Mock useFormStatus
jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: () => ({ pending: false }),
}));

// Mock useActionState hook
const mockActionState = jest.fn();
const mockFormAction = jest.fn();
jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useActionState: (action: any, initialState: any) => {
      // Return the mock state and formAction properly
      return [mockActionState() || initialState, mockFormAction];
    },
    // Keep other React APIs
    useState: originalReact.useState,
    useContext: originalReact.useContext,
  };
});

// Mock NonceContext using a factory function
jest.mock("@/providers/RootProviders", () => {
  const React = require('react');
  const NonceContext = React.createContext(undefined);
  return { NonceContext };
});

// Mock sendContactEmail action
const mockSendContactEmail = jest.fn();
jest.mock("@/actions/resend/action", () => ({
  sendContactEmail: (...args: any[]) => mockSendContactEmail(...args),
}));

// Import after mocks
import ContactPage from "@/app/(infos)/contact/page";
import { NonceContext } from "@/providers/RootProviders";

describe("ContactPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockActionState.mockReturnValue(null); // Reset state mock
    mockFormAction.mockImplementation(async (formData) => {
      // Call the mocked sendContactEmail when the form is submitted
      await mockSendContactEmail(formData);
      return { success: true };
    });
  });

  it("renders all form fields and the submit button", () => {
    render(
      <NonceContext.Provider value={undefined}>
        <ContactPage />
      </NonceContext.Provider>
    );
    expect(screen.getByTestId("form")).toBeInTheDocument();
    expect(screen.getByTestId("input-firstName")).toBeInTheDocument();
    expect(screen.getByTestId("input-lastName")).toBeInTheDocument();
    expect(screen.getByTestId("input-email")).toBeInTheDocument();
    expect(screen.getByTestId("input-subject")).toBeInTheDocument();
    expect(screen.getByTestId("textarea-message")).toBeInTheDocument();
    expect(screen.getByTestId("honeypot")).toBeInTheDocument();
    expect(screen.getByTestId("recaptcha-mock")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /btn/i })).toBeInTheDocument();
  });

  it("updates form state when fields are changed", () => {
    render(
      <NonceContext.Provider value={undefined}>
        <ContactPage />
      </NonceContext.Provider>
    );
    
    // Use fireEvent instead of userEvent for more reliable form testing
    fireEvent.change(screen.getByTestId("input-firstName"), { target: { value: "John" } });
    fireEvent.change(screen.getByTestId("input-lastName"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByTestId("input-email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByTestId("input-subject"), { target: { value: "Hello" } });
    fireEvent.change(screen.getByTestId("textarea-message"), { target: { value: "Test message" } });
    
    // Don't try to type an empty string
    // fireEvent.change(screen.getByTestId("honeypot"), { target: { value: "" } });
    
    expect(screen.getByTestId("input-firstName")).toHaveProperty("value", "John");
    expect(screen.getByTestId("input-lastName")).toHaveProperty("value", "Doe");
    expect(screen.getByTestId("input-email")).toHaveProperty("value", "john@example.com");
    expect(screen.getByTestId("input-subject")).toHaveProperty("value", "Hello");
    expect(screen.getByTestId("textarea-message")).toHaveProperty("value", "Test message");
  });

  it("enables submit button only when recaptcha is set", async () => {
    render(
      <NonceContext.Provider value={undefined}>
        <ContactPage />
      </NonceContext.Provider>
    );
    const submitButton = screen.getByRole("button", { name: /btn/i });
    expect(submitButton).toBeDisabled();
    fireEvent.click(screen.getByTestId("recaptcha-mock"));
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("shows success display when state.success is true", () => {
    // Mock the useActionState hook to return success state
    mockActionState.mockReturnValue({ success: true });
    
    render(
      <NonceContext.Provider value={undefined}>
        <ContactPage />
      </NonceContext.Provider>
    );
    
    expect(screen.getByTestId("success-display")).toBeInTheDocument();
  });

  it("shows error display when state.error is set", () => {
    // Mock the useActionState hook to return error state
    mockActionState.mockReturnValue({ error: "Some error", success: false });
    
    render(
      <NonceContext.Provider value={undefined}>
        <ContactPage />
      </NonceContext.Provider>
    );
    
    expect(screen.getByTestId("error-display")).toBeInTheDocument();
  });

  it("submits the form and calls sendContactEmail", async () => {
    mockSendContactEmail.mockResolvedValue({ success: true });
    render(
      <NonceContext.Provider value={undefined}>
        <ContactPage />
      </NonceContext.Provider>
    );
    
    // Use fireEvent for form changes
    fireEvent.change(screen.getByTestId("input-firstName"), { target: { value: "John" } });
    fireEvent.change(screen.getByTestId("input-lastName"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByTestId("input-email"), { target: { value: "john@example.com" } });
    fireEvent.change(screen.getByTestId("input-subject"), { target: { value: "Hello" } });
    fireEvent.change(screen.getByTestId("textarea-message"), { target: { value: "Test message" } });
    
    fireEvent.click(screen.getByTestId("recaptcha-mock"));
    const submitButton = screen.getByRole("button", { name: /btn/i });
    await waitFor(() => expect(submitButton).not.toBeDisabled());
    
    // Create a form submission event
    const form = screen.getByTestId("form");
    fireEvent.submit(form);
    
    // Wait for the mock action to be called
    await waitFor(() => {
      expect(mockFormAction).toHaveBeenCalled();
    });
    
    // Then verify sendContactEmail was called via the action
    await waitFor(() => {
      expect(mockSendContactEmail).toHaveBeenCalled();
    });
  });
});
