import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number | Date | null): string {
  if (input === null) return "N/A";

  const date = input instanceof Date ? input : new Date(input);

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Returns a random subset of items from an array with a maximum size
 * @param items The array of items to select from
 * @param maxCount The maximum number of items to return (default: 5)
 * @returns A random subset of the original array
 */
export function getRandomSubset<T>(items: T[], maxCount: number = 5): T[] {
  if (!items || items.length <= maxCount) {
    return items;
  }

  // Create a copy of the items array and shuffle it
  const shuffledItems = [...items].sort(() => 0.5 - Math.random());

  // Take only the first 'maxCount' items
  return shuffledItems.slice(0, maxCount);
}
