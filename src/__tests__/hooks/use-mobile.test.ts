import { renderHook, act } from "@testing-library/react";

import { useIsMobile } from "@/hooks/use-mobile";

// Keep track of the registered event listeners
let mediaQueryListeners: Record<
  string,
  ((event: { matches: boolean }) => void)[]
> = {};

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn((event, listener) => {
      if (!mediaQueryListeners[query]) {
        mediaQueryListeners[query] = [];
      }
      mediaQueryListeners[query].push(listener);
    }),
    removeEventListener: jest.fn((event, listener) => {
      if (mediaQueryListeners[query]) {
        mediaQueryListeners[query] = mediaQueryListeners[query].filter(
          (l) => l !== listener,
        );
      }
    }),
  })),
});

// Helper to simulate a window resize
const simulateResize = (width: number) => {
  // Set window inner width
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });

  // Trigger all the event listeners
  Object.keys(mediaQueryListeners).forEach((query) => {
    mediaQueryListeners[query].forEach((listener) => {
      listener({
        matches: width < 768,
      });
    });
  });
};

describe("useIsMobile", () => {
  beforeEach(() => {
    // Reset the media query listeners between tests
    mediaQueryListeners = {};
  });

  it("should return true when viewport width is less than 768px", () => {
    // Set initial window width to mobile size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());

    // Should be true for mobile width
    expect(result.current).toBe(true);
  });

  it("should return false when viewport width is greater than or equal to 768px", () => {
    // Set initial window width to desktop size
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    // Should be false for desktop width
    expect(result.current).toBe(false);
  });

  it("should update when viewport changes from desktop to mobile", () => {
    // Start with desktop width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());

    // Initial value should be false
    expect(result.current).toBe(false);

    // Simulate resize to mobile width
    act(() => {
      simulateResize(767);
    });

    // Value should update to true
    expect(result.current).toBe(true);
  });

  it("should update when viewport changes from mobile to desktop", () => {
    // Start with mobile width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());

    // Initial value should be true
    expect(result.current).toBe(true);

    // Simulate resize to desktop width
    act(() => {
      simulateResize(1024);
    });

    // Value should update to false
    expect(result.current).toBe(false);
  });

  it("should clean up event listeners on unmount", () => {
    // Get the query string used by the hook
    const queryString = `(max-width: ${768 - 1}px)`;

    const { unmount } = renderHook(() => useIsMobile());

    // Check that we have listeners registered before unmount
    expect(mediaQueryListeners[queryString]?.length).toBeGreaterThan(0);

    unmount();

    // After unmount, there should be no listeners left for this query
    expect(mediaQueryListeners[queryString]?.length).toBe(0);
  });
});
