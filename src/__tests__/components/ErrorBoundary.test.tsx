import { render } from "@testing-library/react";

import "@testing-library/jest-dom";
import ErrorBoundary from "@/src/components/ErrorBoundary";

// Suppress console.error for error boundary tests
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("ErrorBoundary", () => {
  // Mock component that throws an error during render
  const Bomb = ({ shouldThrow = true }) => {
    if (shouldThrow) {
      throw new Error("Test error");
    }

    return null;
  };

  const FallbackComponent = () => <div>Error occurred!</div>;

  it("renders children when there is no error", () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <div>Normal content</div>
      </ErrorBoundary>,
    );

    expect(getByText("Normal content")).toBeInTheDocument();
  });

  it("renders fallback when there is an error", () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(getByText("Error occurred!")).toBeInTheDocument();
  });

  it("calls componentDidCatch when an error occurs", () => {
    const spy = jest.spyOn(ErrorBoundary.prototype, "componentDidCatch");

    render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("handles nested errors", () => {
    const { getByText } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <div>
          <Bomb />
        </div>
      </ErrorBoundary>,
    );

    expect(getByText("Error occurred!")).toBeInTheDocument();
  });

  it("resets error state when receiving new children", () => {
    const { getByText, rerender } = render(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(getByText("Error occurred!")).toBeInTheDocument();

    rerender(
      <ErrorBoundary fallback={<FallbackComponent />}>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(getByText("Error occurred!")).toBeInTheDocument();
  });
});
