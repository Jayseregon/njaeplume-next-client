import { cn, formatDate, formatPrice, getRandomSubset } from "@/lib/utils";

describe("cn (className utility)", () => {
  test("combines class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  test("handles conditional class names", () => {
    const condition = true;

    expect(cn("class1", condition && "class2")).toBe("class1 class2");
    expect(cn("class1", !condition && "class2")).toBe("class1");
  });

  test("handles null and undefined values", () => {
    expect(cn("class1", null, undefined, "class2")).toBe("class1 class2");
  });

  test("handles tailwind class conflicts correctly", () => {
    // The second margin class should override the first
    expect(cn("m-2", "m-4")).toBe("m-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  test("handles complex tailwind utilities", () => {
    expect(cn("p-2 m-2", "p-4")).toBe("m-2 p-4");
    expect(cn("text-red-500 font-bold", "text-blue-500")).toBe(
      "font-bold text-blue-500",
    );
  });
});

describe("formatDate", () => {
  test("formats Date object correctly", () => {
    const date = new Date(2023, 0, 15); // Jan 15, 2023

    expect(formatDate(date)).toBe("January 15, 2023");
  });

  test("formats ISO date string correctly", () => {
    // Create the date directly from the ISO string to handle timezone consistently
    const date = new Date("2023-02-20T00:00:00Z");
    const expected = date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    expect(formatDate("2023-02-20")).toBe(expected);
  });

  test("formats timestamp correctly", () => {
    // March 10, 2023 (timestamps are in milliseconds)
    const timestamp = 1678449600000; // March 10, 2023

    expect(formatDate(timestamp)).toBe("March 10, 2023");
  });

  test("handles null value", () => {
    expect(formatDate(null)).toBe("N/A");
  });

  test("handles invalid date string", () => {
    // Invalid dates typically result in "Invalid Date" when formatted
    const result = formatDate("not-a-date");

    expect(result).toMatch(/Invalid Date|N\/A/); // Different browsers/environments might handle this differently
  });
});

describe("formatPrice", () => {
  test("formats whole dollar amounts correctly", () => {
    expect(formatPrice(100)).toBe("CA$100.00");
  });

  test("formats cents correctly", () => {
    expect(formatPrice(10.99)).toBe("CA$10.99");
  });

  test("formats large numbers with commas", () => {
    expect(formatPrice(1000)).toBe("CA$1,000.00");
    expect(formatPrice(1000000)).toBe("CA$1,000,000.00");
  });

  test("formats zero correctly", () => {
    expect(formatPrice(0)).toBe("CA$0.00");
  });

  test("formats negative amounts correctly", () => {
    // The actual formatted result has the CA prefix before the negative sign
    // This is how Intl.NumberFormat works with currency formatting
    expect(formatPrice(-50.25)).toBe("CA-$50.25");
  });
});

describe("getRandomSubset", () => {
  test("returns entire array when length is less than max count", () => {
    const items = [1, 2, 3];
    const result = getRandomSubset(items, 5);

    expect(result).toHaveLength(3);
    expect(result).toEqual(expect.arrayContaining(items));
  });

  test("returns exactly max count items when array is longer", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = getRandomSubset(items, 5);

    expect(result).toHaveLength(5);

    // All returned items should be from the original array
    result.forEach((item) => {
      expect(items).toContain(item);
    });
  });

  test("returns shuffled subset with default max count when not specified", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = getRandomSubset(items);

    expect(result).toHaveLength(5); // Default max count is 5

    // All returned items should be from the original array
    result.forEach((item) => {
      expect(items).toContain(item);
    });
  });

  test("handles empty array", () => {
    expect(getRandomSubset([])).toEqual([]);
  });

  test("handles null or undefined input", () => {
    expect(getRandomSubset(null as any)).toBeNull();
    expect(getRandomSubset(undefined as any)).toBeUndefined();
  });

  test("preserves object references", () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 3 };
    const items = [obj1, obj2, obj3];

    const result = getRandomSubset(items, 2);

    // The objects in the result should be the same references as in the original array
    result.forEach((item) => {
      const original = items.find((i) => i.id === item.id);

      expect(item).toBe(original);
    });
  });
});
