import { render, screen } from "@testing-library/react";

import { LoadingButton } from "@/components/root/LoadingButton";

// Mock the useTranslations hook from next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: { [key: string]: string } = {
      "Utils.LoadingButton": "Please wait",
    };

    return translations[key] || key;
  },
}));

describe("LoadingButton", () => {
  it("should be disabled", () => {
    render(<LoadingButton />);
    const buttonElement = screen.getByRole("button");

    expect(buttonElement).toBeDisabled();
  });

  it("should show loading icon", () => {
    render(<LoadingButton />);
    const icon = screen.getByTestId("loader2-icon");

    expect(icon).toBeInTheDocument();
  });

  it("should display loading text", () => {
    render(<LoadingButton />);
    expect(screen.getByText("Please wait")).toBeInTheDocument();
  });
});
