import "@testing-library/jest-dom";

// Define the mock t function once to ensure it's a stable reference
const mockT = (key: string) => key;

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => mockT, // Return the stable mockT function
  useFormatter: () => ({
    dateTime: () => "formatted date",
    number: () => "formatted number",
    list: () => "formatted list",
    relativeTime: () => "formatted relative time",
  }),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
