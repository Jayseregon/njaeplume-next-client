import "@testing-library/jest-dom";

// Mock next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useFormatter: () => ({
    dateTime: () => "formatted date",
    number: () => "formatted number",
    list: () => "formatted list",
    relativeTime: () => "formatted relative time",
  }),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));
