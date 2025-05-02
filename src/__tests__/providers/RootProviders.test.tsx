import React from "react";
import { render, screen } from "@testing-library/react";

import { RootProviders, NonceContext } from "@/providers/RootProviders";

// Mock dependencies
jest.mock("next-themes", () => ({
  ThemeProvider: ({ children, ...props }: any) => (
    <div data-testid="theme-provider" data-theme-props={JSON.stringify(props)}>
      {children}
    </div>
  ),
}));

jest.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children, nonce }: any) => (
    <div data-nonce={nonce} data-testid="clerk-provider">
      {children}
    </div>
  ),
}));

// Test component that consumes the NonceContext
const NonceConsumer = () => {
  const nonce = React.useContext(NonceContext);

  return <div data-testid="nonce-consumer">Nonce: {nonce}</div>;
};

describe("RootProviders", () => {
  test("renders without crashing", () => {
    render(
      <RootProviders>
        <div data-testid="test-child">Test Content</div>
      </RootProviders>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  test("passes nonce to all providers", () => {
    const testNonce = "test-nonce-123";

    render(
      <RootProviders nonce={testNonce}>
        <NonceConsumer />
      </RootProviders>,
    );

    // Check if nonce is passed to ClerkProvider
    const clerkProvider = screen.getByTestId("clerk-provider");

    expect(clerkProvider).toHaveAttribute("data-nonce", testNonce);

    // Check if nonce is passed to ThemeProvider
    const themeProvider = screen.getByTestId("theme-provider");
    const themeProps = JSON.parse(
      themeProvider.getAttribute("data-theme-props") || "{}",
    );

    expect(themeProps.nonce).toBe(testNonce);

    // Check if nonce is available in NonceContext
    const nonceConsumer = screen.getByTestId("nonce-consumer");

    expect(nonceConsumer).toHaveTextContent(`Nonce: ${testNonce}`);
  });

  test("applies default theme settings", () => {
    render(
      <RootProviders>
        <div>Test</div>
      </RootProviders>,
    );

    const themeProvider = screen.getByTestId("theme-provider");
    const themeProps = JSON.parse(
      themeProvider.getAttribute("data-theme-props") || "{}",
    );

    expect(themeProps.defaultTheme).toBe("dark");
    expect(themeProps.enableSystem).toBe(false);
  });

  test("forwards custom theme props", () => {
    const customThemeProps = {
      defaultTheme: "light",
      enableSystem: true,
      forcedTheme: "dark",
    };

    render(
      <RootProviders themeProps={customThemeProps}>
        <div>Test</div>
      </RootProviders>,
    );

    const themeProvider = screen.getByTestId("theme-provider");
    const themeProps = JSON.parse(
      themeProvider.getAttribute("data-theme-props") || "{}",
    );

    expect(themeProps.defaultTheme).toBe("light");
    expect(themeProps.enableSystem).toBe(true);
    expect(themeProps.forcedTheme).toBe("dark");
  });

  test("NonceContext provides undefined when nonce is not provided", () => {
    render(
      <RootProviders>
        <NonceConsumer />
      </RootProviders>,
    );

    const nonceConsumer = screen.getByTestId("nonce-consumer");

    expect(nonceConsumer).toHaveTextContent("Nonce:");
  });

  test("providers are nested in the correct order", () => {
    const { container } = render(
      <RootProviders>
        <div>Test</div>
      </RootProviders>,
    );

    // Check that ClerkProvider is the outer provider, followed by NonceContext.Provider, and then ThemeProvider
    const html = container.innerHTML;

    // ClerkProvider should be the outermost provider
    expect(html.indexOf("clerk-provider")).toBeLessThan(
      html.indexOf("theme-provider"),
    );
  });
});
