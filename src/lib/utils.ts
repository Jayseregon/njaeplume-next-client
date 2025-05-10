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

export function formatPrice(price: number) {
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(price);

  return `CA${formatted}`;
}

export function getRandomSubset<T>(items: T[], maxCount: number = 5): T[] {
  if (!items || items.length <= maxCount) {
    return items;
  }

  // Create a copy of the items array and shuffle it
  const shuffledItems = [...items].sort(() => 0.5 - Math.random());

  // Take only the first 'maxCount' items
  return shuffledItems.slice(0, maxCount);
}
